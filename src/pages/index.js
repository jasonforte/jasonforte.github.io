import React from "react"
import {
  Link,
  graphql,
  useStaticQuery
} from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"


const IndexPage = () => {
  const data = useStaticQuery(graphql `
    query IndexQuery {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              slug
              title
              date(formatString: "DD MMMM YYYY")
              blurb
            }
          }
        }
      }
    }
  `)

  const blurbFormat = (blurb) => {
    const parts = blurb.split(" ", 50)
    let suffix = ""
    if (parts.length === 50) {
      suffix = "..."
    }
    return `${parts.join(" ")}${suffix}`
  }

  return (
    <Layout>
    <SEO title = "Home"/>
    <div className = {"article__list"}>
    {data.allMarkdownRemark.edges.map(document => {
      console.log('document', document)
      return (
        <article>
          <h1 className={"article__heading"}><Link to={document.node.frontmatter.slug}>{document.node.frontmatter.title}</Link></h1>
          <p className={"article__meta"}>{document.node.frontmatter.date}</p>
          <div className={"article__content"}>
            <p className={"article__blurb"}>{blurbFormat(document.node.frontmatter.blurb)}</p>
          </div>
          <p className={"article__readmore"}>
            <Link to={document.node.frontmatter.slug}>Continue Reading 🠖</Link>
          </p>
        </article>
      )
    })}
    </div>
    </Layout>
  )
}

export default IndexPage