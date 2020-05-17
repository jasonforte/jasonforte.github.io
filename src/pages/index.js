import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"
import Img from 'gatsby-image'

import Layout from "../components/layout"
import SEO from "../components/seo"


const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query IndexQuery {
      allStrapiArticle {
        edges {
          node {
            id
            slug
            title
            blurb
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
      }
    }
  `)

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

return (
    <Layout>
      <SEO title="Home" />
      <div className={"article__list"}>
        {data.allStrapiArticle.edges.map(document => {
          let date = new Date(document.node.created_at)
          return (
            <article>
              <h1 className={"article__heading"}><Link to={document.node.slug}>{document.node.title}</Link></h1>
              <p className={"article__meta"}>By <span>Jason Forte</span> • {date.getDate()} {months[date.getMonth()]} {date.getFullYear()}</p>
              <Img fluid={document.node.image.childImageSharp.fluid} />
              <div className={"article__content"}>
                <p className={"article__blurb"}>{document.node.blurb.split(" ", 50).join(" ")}...</p>
              </div>
              <p className={"article__readmore"}>
                <Link to={document.node.slug}>Continue Reading 🠖</Link>
              </p>
            </article>
          )
        })}
      </div>
    </Layout>
  )
}

export default IndexPage
