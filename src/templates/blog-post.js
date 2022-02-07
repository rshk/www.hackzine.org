import * as React from "react";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { useStaticQuery, graphql } from 'gatsby';

import Layout from "ui/layout";


export default function BlogPost({ pageContext: { node } }) {
    return (
        <Layout>
            <article>
                <h1>{node.frontmatter.title}</h1>
                <MDXRenderer localImages={node.frontmatter.embeddedImagesLocal}>
                    {node.body}
                </MDXRenderer>
            </article>
        </Layout>
    );
}
