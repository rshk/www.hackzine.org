/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
    const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
            github
            linkedin
          }
        }
      }
    }
  `)

    // Set these values by editing "siteMetadata" in gatsby-config.js
    const author = data.site.siteMetadata?.author
    const social = data.site.siteMetadata?.social

    return (
        <div className="bio">
            <StaticImage
                className="bio-avatar"
                layout="fixed"
                formats={["auto", "webp", "avif"]}
                src="../images/profile-pic.jpg"
                width={50}
                height={50}
                quality={95}
                alt={author?.name || "Profile pic"}
            />

            {author?.name && (
                <div>
                    <div>By <strong>{author.name}</strong></div>
                    <div>
                        {!!social?.twitter &&
                            <a href={`https://twitter.com/${social.twitter}`}>
                                Twitter
                            </a>}
                        {!!social?.github &&
                            <a href={`https://github.com/${social.github}`}>
                                GitHub
                            </a>}
                        {!!social?.linkedin &&
                            <a href={`https://linkedin.com/in/${social.linkedin}`}>
                                Linkedin
                            </a>}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Bio
