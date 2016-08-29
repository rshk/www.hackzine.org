Caching docker image on CircleCI
################################

:date: 2016-08-29 17:27:34
:category: Development
:tags: development, ci, docker


At BKNO3_ we use Docker and docker-compose_ for development, in order
to make sure every developer can easily and reliably set up a
development environment locally, even if they're not familiar with the
project itself (we have several components, with different developers
working on each one).

The same docker containers are used to run continuous integration (on
CircleCI) as well, in order to reduce the differences between the
dev/ci/prod environments.

.. _BKNO3: https://www.bkno3.com
.. _docker-compose: https://docs.docker.com/compose/

A big pain in doing so, however, was the time spent rebuilding the
whole docker image every time the test suite was run, even if nothing
changed (the image would only change when a dependency is added /
upgraded).

To address this issue, we come up with the following technique to
cache the image, and reuse it if nothing was changed with the
requirements since the previous build.


Circle CI configuration
=======================

.. note:: For this to work, you need to use the new containers based
          on Ubuntu Trusty (14.04). Things seem to fail on 12.04 for
          some reason..

First, let's tell CircleCI that we're going to need the docker service.

I specified Python 3.5 here as we are running a few tools outside the
container as well, requiring Py3.5, but the interpreter actually being
used to run the test suite is going to be the one installed in the
container.

And of course this is not just for Python, but it would work for
nodejs, ruby or whatever as well.

.. code:: yaml

    machine:
      python:
        version: 3.5.1
      services:
        - docker

Next, let's tell CircleCI that we want to cache ``~/docker-images/``
between builds, and to use a custom script to build the dependencies:

.. code:: yaml

    dependencies:
      cache_directories:
        - "~/docker-images"

      override:
        - ./bin/ci/build-docker-image


The image build script
======================

Download the complete (up-to-date) script here: `rshk/build-docker-image.sh`_

.. _rshk/build-docker-image.sh: https://gist.github.com/rshk/beecd2c49f81a380d805c8b461b4c704

Below a description of the most relevant concepts from that script.

**Create a "version tag",** depending on the contents of any file
which would affect the created image. This means the ``Dockerfile``
along with any requirement files.


.. code:: bash

    VERSION_TAG="$( sha1sum Dockerfile requirements/*.txt | sha1sum | cut -d' ' -f1 )"

Let's give a name to the image we are going to create (replace
``myorg/myapp`` with something meaningful)

.. code:: bash

    IMAGE_FULL_NAME="myorg/myapp:${VERSION_TAG}"

And define a path in which the above image will be exported

.. code:: bash

    # Cache dir must match the one configured in circle.yml
    CACHE_DIR="$( readlink -f ~/docker-images )"

    IMAGE_ARCHIVE="${CACHE_DIR}/myapp-${VERSION_TAG}.tar"

Attempt to load the image from cache. If not found, just build it
using the ``Dockerfile`` found in the current directory

.. code:: bash

    if [[ -e "$IMAGE_ARCHIVE" ]]; then
        docker load -i "$IMAGE_ARCHIVE"
    else
        docker build -t "$IMAGE_FULL_NAME" .
    fi

Tag the image with the commit SHA1, so that we can easily reference to
it from ``circle.yml``

.. code:: bash

    docker tag "$IMAGE_FULL_NAME" myorg/myapp:"$CIRCLE_SHA1"

And, of course, save the build image in the cache for later

.. code:: bash

    docker save "$IMAGE_FULL_NAME" > "$IMAGE_ARCHIVE"


Bonus #1: running tests in a Docker container
=============================================

This is the actual command being used to run the test suite inside the
container. Of course, adapt the ``py.test ...`` part to specify the
actual command you're going to use to run the build.

.. code:: yaml

    test:
      override:
        - docker run --rm myorg/myapp:$CIRCLE_SHA1 py.test -v ./tests


Bonus #2: attaching container to PostgreSQL
===========================================

Actually, things are a bit more complex, as our app requires
PostgreSQL. Since things could get tricky with volume management, we
opted for just using the PostgreSQL already running on the CircleCI
container used for the build.

The following configuration allows forwarding the local postgres port
inside the container (along with configuring it to accept
connections):

.. code:: yaml

    test:

      pre:
        - >
          sudo bash -c "echo \"listen_addresses = '*'\" >>
          /etc/postgresql/9.5/main/postgresql.conf"
        - >
          sudo bash -c "echo \"host all all 0.0.0.0/0 trust\" >>
          /etc/postgresql/9.5/main/pg_hba.conf"
        - sudo /etc/init.d/postgresql restart

        - psql -c "CREATE DATABASE test_myapp"

      override:
        - >
          docker run --rm
          --add-host postgresdb:$(ip addr show docker0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)
          -e DATABASE_URL=postgres://ubuntu:@postgresdb:5432/test_myapp
          myapp/myapp:$CIRCLE_SHA1
          py.test -v ./tests


Bonus #3: the Dockerfile
========================

Just in case you're wondering, this is the ``Dockerfile`` we use for
building the image::

    FROM python:3.5
    ENV PYTHONUNBUFFERED 1
    ADD . /code
    WORKDIR /code
    RUN pip install -r requirements.txt

..as simple as that!
