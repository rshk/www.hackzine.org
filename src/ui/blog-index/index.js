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
                    }
                }
            }
        }
    `);

    return (
        <div>
            {data.allMdx.edges.map(({node}) =>
                <div key={node.id} className={styles.blogPostIndexItem}>
                    <h2 style={{flex: 1}} className={styles.title}>
                        <Link to={`/blog/${node.slug}`}>
                            {node.frontmatter.title}
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
