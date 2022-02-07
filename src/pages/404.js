import * as React from "react";
import { Link } from "gatsby";
import Layout from "ui/layout";
import { Helmet } from "react-helmet";


const NotFoundPage = () => {
  return (
      <Layout>
          <Helmet>
              <title>Page Not found</title>
          </Helmet>
          <main>

              <div className="text-center">
                  <h1>Page not found</h1>
                  <div className="my-3">
                      Sorry{" "}
                      <span role="img" aria-label="Pensive emoji">
                          😔
                      </span>{" "}
                      we couldn’t find what you were looking for.
                  </div>
                  <Link to="/">Go home</Link>.
              </div>
          </main>
      </Layout>
  )
}

export default NotFoundPage
