import * as RTE from 'fp-ts/ReaderTaskEither'
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'

import {
  Dependencies,
  PrismicClient,
  PrismicClientQueryOptions,
  PrismicAPIDocument,
  ResolveType,
} from '../types'
import { QUERY_PAGE_SIZE } from '../constants'

import { createClient } from './createClient'
import { buildQueryOptions } from './buildQueryOptions'

const queryByIds = (
  client: PrismicClient,
  ids: string[],
  queryOptions: PrismicClientQueryOptions,
): T.Task<ResolveType<ReturnType<PrismicClient['getByIDs']>>> => (): ReturnType<
  typeof client.getByIDs
> => client.getByIDs(ids, queryOptions)

const aggregateQueryByIds = (
  client: PrismicClient,
  ids: string[],
  queryOptions: PrismicClientQueryOptions,
  page = 1,
  docs: PrismicAPIDocument[] = [],
): T.Task<PrismicAPIDocument[]> =>
  pipe(
    queryByIds(client, ids, {
      ...queryOptions,
      page,
      pageSize: QUERY_PAGE_SIZE,
    }),
    T.bind('aggregateResults', (response) =>
      T.of([...docs, ...response.results]),
    ),
    T.chain((scope) =>
      page < scope.total_pages
        ? aggregateQueryByIds(
            client,
            ids,
            queryOptions,
            page + 1,
            scope.aggregateResults,
          )
        : T.of(scope.aggregateResults),
    ),
  )

/**
 * Queries documents in a list of document IDs from a Prismic repository using
 * the environment's configuration. The following fields from the environment's
 * `pluginOptions` are used, in addition to those used in `createClient`:
 *
 * - `pluginOptions.releaseID`: Prismic Release ID from which to fetch
 *   documents. If not provided, the master ref is used.
 *
 * - `pluginOptions.fetchLinks`: List of document link fields to fetch.
 *
 * - `pluginOptions.lang`: Language of documents to fetch. If not provided, all
 *   languages are fetched.
 *
 * @see gatsby-source-prismic/lib/createClient.ts
 *
 * @returns List of Prismic documents.
 */
export const queryDocumentsByIds = (
  ids: string[],
): RTE.ReaderTaskEither<Dependencies, never, PrismicAPIDocument[]> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bindW('client', createClient),
    RTE.bind('queryOptions', (scope) => buildQueryOptions(scope.client)),
    RTE.map((scope) =>
      aggregateQueryByIds(scope.client, ids, scope.queryOptions),
    ),
    RTE.chain((docs) => RTE.fromTask(docs)),
  )
