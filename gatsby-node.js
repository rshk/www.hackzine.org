const path = require(`path`)

exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions
    const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
    // Query for markdown nodes to use in creating pages.
    // You can query for whatever data you want to create pages for e.g.
    // products, portfolio items, landing pages, etc.
    // Variables can be added as the second function parameter
    return graphql(`
    query loadBlogPosts {
        allMdx {
            edges {
                node {
                  id
                  frontmatter {
                      formattedDate: date(formatString: "MMMM DD, YYYY")
                      title
                      embeddedImagesLocal {
                          childImageSharp {
                              gatsbyImageData(layout: FULL_WIDTH)
                          }
                      }
                  }
                  slug
                  body
                }
            }
        }
    }
    `).then(result => {
        if (result.errors) {
            throw result.errors
        }

        // Create blog post pages.
        result.data.allMdx.edges.forEach(edge => {
            const { node } = edge;
            createPage({
                // Path for this page — required
                path: `/blog/${node.slug}`,
                component: blogPostTemplate,
                context: {
                    // Add optional context data to be inserted
                    // as props into the page component.
                    //
                    // The context data can also be used as
                    // arguments to the page GraphQL query.
                    //
                    // The page "path" is always available as a GraphQL
                    // argument.
                    node
                },
            })
        })
    })
}


// exports.createSchemaCustomization = ({ actions, schema }) => {
//     const { createTypes } = actions;
//     createTypes(`
//         type Mdx implements Node {
//             frontmatter: Frontmatter
//             embeddedImagesRemote: [File] @link(from: "fields.embeddedImagesRemote")
//         }
//         type Frontmatter @dontInfer {
//             ...
//             embeddedImagesRemote: [String]
//         }
//     `);
// };
