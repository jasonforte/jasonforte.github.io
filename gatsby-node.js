/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const { createFilePath } = require('gatsby-source-filesystem')
const path = require('path')

const makeRequest = (graphql, request) => new Promise((resolve, reject) => {
  resolve(
    graphql(request).then(result => {
      if (result.errors) {
        reject(result.errors)
      }

      return result
    })
  )
})

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const getArticles = makeRequest(graphql, `
  {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
    ) {
      edges {
        node {
          frontmatter {
            slug
          }
        }
      }
    }
  }
  `).then(result => {
    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: `${node.frontmatter.slug}`,
        component: path.resolve(`src/templates/article.js`),
        context: {
          slug: node.frontmatter.slug,
        },
      })
    })
  });

  // Query for articles nodes to use in creating pages.
  return getArticles;
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value
    })
  }
}
