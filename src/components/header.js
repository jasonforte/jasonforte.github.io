import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle, siteSubtitle }) => (
  <header>
    <h1>
      <Link
        to="/"
        className={"title"}
      >
        {siteTitle}
      </Link>


    </h1>
    <h2 className="subtitle">
      {siteSubtitle}
    </h2>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
  siteSubtitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
  siteSubtitle: ``,
}

export default Header
