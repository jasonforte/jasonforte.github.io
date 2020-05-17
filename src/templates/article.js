import React from 'react'
import Layout from '../components/layout'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import ReactMarkdown from 'react-markdown'

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
  console.log('data', data)
  return (
    <Layout>
      <h1 className={"article__heading"}>{data.strapiArticle.title}</h1>
      <p className={"article__meta"}>By <span>Jason Forte</span> • {date.getDate()} {months[date.getMonth()]} {date.getFullYear()}</p>
      <Img fluid={data.strapiArticle.image.childImageSharp.fluid} />
      <article>
        <ReactMarkdown source={data.strapiArticle.content} />
      </article>
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