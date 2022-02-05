import * as React from "react";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import * as styles from "./layout.module.scss";


export default function Layout({ children }) {
    return (
        <div className={styles.container}>
            <Helmet>
                <title>Hackzine.org</title>
            </Helmet>
            <Header/>
            <div className={styles.siteContent}>
                {children}
            </div>
            <Footer/>
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.node,
}


function Header() {
    // TODO: can we move all the details to configuration?
    return (
        <div className={styles.siteHeader}>
            <div className={styles.title}>Hackzine.org</div>
            <div className={styles.subtitle}>
                by Sam Santi{' '}
                <a href="https://twitter.com/_rshk">
                    <FontAwesomeIcon icon={faTwitter} />
                </a>{' '}
                <a href="https://github.com/rshk">
                    <FontAwesomeIcon icon={faGithub} />
                </a>{' '}
                <a href="https://www.linkedin.com/in/samuelesanti">
                    <FontAwesomeIcon icon={faLinkedin} />
                </a>
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
