const path = require("path");

module.exports = {
    siteMetadata: {
        title: `Hackzine`,
        siteUrl: `https://www.hackzine.org`,
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
            resolve: 'gatsby-plugin-manifest',
            options: {
                "icon": "src/images/icon.png"
            }
        },
        {
            resolve: "gatsby-plugin-mdx",
            options: {
                extensions: [".mdx", ".md"],
            },
        },
        "gatsby-plugin-sharp",
        "gatsby-transformer-sharp",
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                "name": "images",
                "path": "./src/images/"
            },
            __key: "images"
        },
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                "name": "pages",
                "path": "./src/pages/"
            },
            __key: "pages"
        },
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                "name": "blog-posts",
                "path": "./src/blog/"
            },
            __key: "blog"
        },
        {
            resolve: 'gatsby-plugin-root-import',
            options: {
                src: path.join(__dirname, 'src'),
                // pages: path.join(__dirname, 'src/pages')
            }
        },
    ]
};
