import React from 'react'
import Layout from '../components/layout'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import ReactMarkdown from 'react-markdown'
import SEO from '../components/seo'

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

const ArticleTemplate = ({ data }) => {
  var date = new Date(data.strapiArticle.created_at);
  return (
    <Layout>
      <SEO title={data.strapiArticle.title} />
      <h1 className={"article__heading"}>{data.strapiArticle.title}</h1>
      <p className={"article__meta"}>By <span>Jason Forte</span> • {date.getDate()} {months[date.getMonth()]} {date.getFullYear()}</p>
      <Img fluid={data.strapiArticle.image.childImageSharp.fluid} />
      <div className={"article__content"}>
        <ReactMarkdown source={data.strapiArticle.content} />
      </div>
    </Layout>
  )
}

export default ArticleTemplate

export const query = graphql`
  query ArticleTemplate($id: String!) {
    strapiArticle(id: {eq: $id}) {
      title
      content
      created_at
      image {
        childImageSharp {
          fluid(maxWidth: 960) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
`