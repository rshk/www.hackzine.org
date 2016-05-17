PostGIS on Gitlab-CI
####################

:tags: postgis, gitlab, docker
:date: 2016-05-17 18:01
:category: Development

It took me a while to figure out how to setup postgis on a gitlab-ci
build, and could not find anything on the docs, so here is a brief
explanation of what I did:

.. _mdillon/postgis: https://hub.docker.com/r/mdillon/postgis/

First of all, I used `mdillon/postgis`_ as a base image for the
service, to avoid having to install postgis on the ``postgres:9.4``
base image over and over.

Using custom docker images as services is explained on the `Using
Docker Images`_ page of the official guide.

.. _Using Docker Images: http://docs.gitlab.com/ce/ci/docker/using_docker_images.html

But in short, all I had to do is make a few following changes to
``.gitlab-ci.yml``:

.. code-block:: yaml

    services:
      # Instead of postgres:9.4 -- this is going to pull pg9.4 + postgis2.2
      - mdillon/postgis:9.4

    variables:
      # These are used by the base image to setup the first database
      POSTGRES_DB: test_myapp
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: ""

      # This is going to be used by the application
      DATABASE_URL: "postgres://testuser:@mdillon__postgis/test_myapp"


Just be aware that the hostname for the container is going to be built
from the image name, stripping the version number, and replacing any
slash ``/`` with double-underscore ``__``.
