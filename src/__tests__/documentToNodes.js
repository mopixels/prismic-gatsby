import { documentToNodes } from '../documentToNodes'
import { generateTypeDefsForCustomType } from '../generateTypeDefsForCustomType'
import document from './fixtures/document.json'
import documentNormalizedNodes from './fixtures/documentNormalizedNodes.json'
import customTypeJson from './fixtures/customTypeSchema.json'

jest.mock('gatsby-source-filesystem')

const customTypeId = 'all_field_types'

const schema = {
  buildObjectType: config => ({ kind: 'OBJECT', config }),
  buildUnionType: config => ({ kind: 'UNION', config }),
}

const gatsbyContext = {
  createNodeId: () => 'result of createNodeId',
  createContentDigest: () => 'result of createContentDigest',
  schema,
  actions: {
    createNode: jest.fn(),
  },
  store: {},
  cache: {},
}

const pluginOptions = {}

describe('documentToNodes', () => {
  test('returns a list of normalized nodes to create', async () => {
    const { typePaths } = generateTypeDefsForCustomType({
      customTypeId,
      customTypeJson,
      gatsbyContext,
      pluginOptions,
    })

    const result = await documentToNodes(document, {
      typePaths,
      gatsbyContext,
      pluginOptions,
    })

    expect(result).toEqual(documentNormalizedNodes)
  })

  test.skip('dataString is equal to data stringified', async () => {
    const { typePaths } = generateTypeDefsForCustomType({
      customTypeId,
      customTypeJson,
      gatsbyContext,
      pluginOptions,
    })

    const result = await documentToNodes(document, {
      typePaths,
      gatsbyContext,
      pluginOptions,
    })

    const docNode = result[result.length - 1]
    const data = docNode.data
    const parsedDataString = JSON.parse(result[result.length - 1].dataString)

    expect(parsedDataString).toEqual(data)
  })
})
