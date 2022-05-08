const path = require("path");
// import rehypeHighlight from "rehype-highlight";

module.exports = {
    siteMetadata: {
        title: "Hackzine",
        siteUrl: "https://www.hackzine.org",
        authorName: "Sam Santi",
        twitterUrl: "https://twitter.com/_rshk",
        githubUrl: "https://github.com/rshk",
        linkedinUrl: "https://www.linkedin.com/in/samuelesanti",
    },
    plugins: [
        "gatsby-plugin-sass",
        "gatsby-plugin-image",
        "gatsby-plugin-react-helmet",
        "gatsby-plugin-sitemap",
        {
            resolve: "gatsby-plugin-manifest",
            options: {
                "icon": "src/images/icon.png"
            }
        },
        {
            resolve: "gatsby-plugin-mdx",
            options: {
                extensions: [".mdx", ".md"],
                gatsbyRemarkPlugins: [
                    {
                        resolve: "gatsby-remark-images",
                        options: {
                            maxWidth: 1200,
                        },
                    },
                ],
                rehypePlugins: [
                    require("rehype-highlight"),
                ],
            },
        },
        {
            resolve: "gatsby-plugin-sharp",
            options: {
                defaults: {
                    quality: 70,
                    formats: ["auto", "webp", "avif"],
                    placeholder: "blurred",
                }
            },
        },
        "gatsby-transformer-sharp",
        "gatsby-remark-images",
        {
            resolve: "gatsby-source-filesystem",
            options: {
                "name": "images",
                "path": "./src/images/"
            },
            __key: "images"
        },
        {
            resolve: "gatsby-source-filesystem",
            options: {
                "name": "pages",
                "path": "./src/pages/"
            },
            __key: "pages"
        },
        {
            resolve: "gatsby-source-filesystem",
            options: {
                "name": "blog-posts",
                "path": "./src/blog/"
            },
            __key: "blog"
        },
        {
            resolve: "gatsby-plugin-root-import",
            options: {
                src: path.join(__dirname, "src"),
                // pages: path.join(__dirname, "src/pages")
            }
        },
        {
            resolve: "gatsby-plugin-amplitude-analytics",
            options: {
                apiKey: "d7c3e222739b6959350b15e098cc0eaf",
                respectDNT: true,
                // exclude: ["/preview/**", "/do-not-track/me/too/"],
                // eventTypes: {
                //     outboundLinkClick: "OUTBOUND_LINK_CLICK",
                //     pageView: "PAGE_VIEW",
                // },

                // Amplitude JS SDK configuration options (optional)
                amplitudeConfig: {
                    saveEvents: true,
                    includeUtm: true,
                    includeReferrer: true
                },

                // Specify NODE_ENVs in which the plugin should be loaded (optional)
                environments: ["production"],
            },
        },
        "gatsby-plugin-fontawesome-css",
    ]
};
