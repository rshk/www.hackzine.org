import * as React from "react"
import { Link, useStaticQuery, graphql } from 'gatsby';
import * as styles from "./index.module.scss";

export default function BlogPostsIndex() {
    const data = useStaticQuery(graphql`
        query {
            allMdx(sort: {order: DESC, fields: [frontmatter___date]}) {
                edges {
                    node {
                        id
                        slug
                        frontmatter {
                            formattedDate: date(formatString: "MMMM DD, YYYY")
                            title
                        }
                        headings(depth:h1) {
                            value
                        }
                    }
                }
            }
        }
    `);

    return (
        <div>
            {data.allMdx.edges.map(({node}) =>
                <div key={node.id} className={[
                    styles.blogPostIndexItem,
                    "d-md-flex align-items-center my-3"
                ].join(" ")}>
                    <h2 style={{flex: 1}} className={styles.title}>
                        <Link to={getBlogPostPath(node)}>
                            {getBlogPostLinkTitle(node)}
                        </Link>
                    </h2>
                    <div className={styles.date}>
                        {node.frontmatter.formattedDate}
                    </div>
                </div>
            )}
        </div>
    );
}


/**
 * Get the title from a blog post node
 *
 * If a ``title`` field is defined in the "front matter", then use it.
 * Otherwise, use the first <h1> title found in the markdown file.
 */
function getBlogPostLinkTitle(node) {
    if (node.frontmatter.title) {
        return node.frontmatter.title;
    }
    if (node.headings.length >= 1) {
        return node.headings[0].value;
    }
    return "Untitled blog post";
}


function getBlogPostPath(node) {
    return `/blog/${node.slug}`;
}
