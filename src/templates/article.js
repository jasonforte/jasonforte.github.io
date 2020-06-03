import React from 'react'
import Layout from '../components/layout'
import { graphql } from 'gatsby'
import SEO from '../components/seo'

const ArticleTemplate = ({ data }) => {
  console.log('data', data)
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  return (
    <Layout>
      <SEO title={frontmatter.title} />
      <h1 className={"article__heading"}>{frontmatter.title}</h1>
      <p className={"article__meta"}>By <span>Jason Forte</span> • {frontmatter.date}</p>
      <div
        className={"article__content"}
        dangerouslySetInnerHTML={{ __html: html }}
      >
      </div>
    </Layout>
  )
}

export default ArticleTemplate

export const query = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        date(formatString: "DD MMMM YYYY")
        slug
        title
      }
    }
  }
`