import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query IndexQuery {
      allStrapiArticle {
        edges {
          node {
            id
            title
            content
            created_at
          }
        }
      }
    }
  `)

  console.log('data', data)

  return (
    <Layout>
      <SEO title="Home" />
      <ul>
        {data.allStrapiArticle.edges.map(document => (
          <li key={document.node.id}>
            <Link to={`/${document.node.id}`}>{document.node.title}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default IndexPage
