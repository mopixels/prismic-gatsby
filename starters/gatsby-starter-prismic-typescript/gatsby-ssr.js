/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */

import * as React from 'react'
import { PrismicPreviewProvider } from 'gatsby-plugin-prismic-previews'

// Styling for the preview modals.
import 'gatsby-plugin-prismic-previews/dist/styles.css'

// Adds a shared React Context for Prismic preview sessions.
export const wrapRootElement = ({ element }) => (
  <PrismicPreviewProvider>{element}</PrismicPreviewProvider>
)
