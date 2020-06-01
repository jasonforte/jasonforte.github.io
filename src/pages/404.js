import React from "react"

import { Link } from 'gatsby'
import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <h1 className={"article__heading"}>Not Found</h1>
    <p className={"article__meta"}>Could not find the article. Try the <Link to="/">home page</Link>.</p>
  </Layout>
)

export default NotFoundPage
