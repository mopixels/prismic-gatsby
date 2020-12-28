import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, identity } from 'fp-ts/function'
import * as PrismicDOM from 'prismic-dom'

import { buildObjectType } from '../lib/buildObjectType'
import { registerType } from '../lib/registerType'
import { getTypeName } from '../lib/getTypeName'

import { Dependencies, FieldConfigCreator, PrismicAPILinkField } from '../types'

export const createLinkFieldConfig: FieldConfigCreator = () =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      buildObjectType({
        name: deps.nodeHelpers.createTypeName('LinkType'),
        fields: {
          link_type: deps.globalNodeHelpers.createTypeName('LinkTypes'),
          isBroken: 'Boolean',
          url: {
            type: 'String',
            resolve: (source: PrismicAPILinkField) =>
              PrismicDOM.Link.url(source, deps.pluginOptions.linkResolver),
          },
          target: 'String',
          size: 'Int',
          id: 'ID',
          type: 'String',
          tags: '[String]',
          lang: 'String',
          slug: 'String',
          uid: 'String',
          document: {
            type: deps.nodeHelpers.createTypeName('AllDocumentTypes'),
            resolve: (source: PrismicAPILinkField) =>
              source.link_type === 'Document' &&
              source.type &&
              source.id &&
              !source.isBroken
                ? deps.nodeHelpers.createNodeId(source.id)
                : undefined,
            extensions: { link: {} },
          },
          raw: { type: 'JSON', resolve: identity },
        },
      }),
    ),
    RTE.chainFirst(registerType),
    RTE.map(getTypeName),
  )
