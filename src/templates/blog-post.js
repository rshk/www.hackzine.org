import * as React from "react";
import { MDXRenderer } from "gatsby-plugin-mdx";

import Layout from "ui/layout";


export default function BlogPost({ pageContext: { node } }) {
    return (
        <Layout>
            <article>
                <h1>{node.frontmatter.title}</h1>
                <MDXRenderer>
                    {node.body}
                </MDXRenderer>
            </article>
        </Layout>
    );
}
