import * as React from "react";
import { Link, useStaticQuery, graphql } from 'gatsby';
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { Container } from "reactstrap";

//import "style/index.scss";
import * as styles from "./layout.module.scss";


export default function Layout({ children }) {
    return (
        <Container>
            <Helmet>
                <title>Hackzine.org</title>
            </Helmet>
            <Header/>
            <div className={styles.siteContent}>
                {children}
            </div>
            <Footer/>
        </Container>
    );
}

Layout.propTypes = {
    children: PropTypes.node,
}


function Header() {
    const data = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    title
                    authorName
                    twitterUrl
                    githubUrl
                    linkedinUrl
                }
            }
        }
    `);

    const {
        title: siteTitle,
        authorName,
        twitterUrl,
        githubUrl,
        linkedinUrl,
    } = data.site.siteMetadata;

    return (
        <div className={styles.siteHeader}>
            <div className={styles.title}>
                <Link to="/">{siteTitle}</Link>
            </div>
            <div className={styles.subtitle}>
                <span>by {authorName}{' '}</span>
                {!!twitterUrl && <a href={twitterUrl}>
                    <FontAwesomeIcon icon={faTwitter} />
                </a>}
                {' '}
                {!!githubUrl && <a href={githubUrl}>
                    <FontAwesomeIcon icon={faGithub} />
                </a>}
                {' '}
                {!!linkedinUrl && <a href={linkedinUrl}>
                    <FontAwesomeIcon icon={faLinkedin} />
                </a>}
            </div>
        </div>
    );
}


function Footer() {
    return (
        <div className={styles.siteFooter}>
            <div>© 2009-{(new Date()).getFullYear()}</div>
        </div>
    );
}
