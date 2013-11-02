GitHub-pages-like publishing
############################

:tags: development, github, web
:date: 2013-11-02 19:17
:category: Development


I really love using GitHub pages for publishing stuff:
I can easily setup the required steps to build & publish my website,
and then forget about it.

When I need to make a change, I can just pull the latest copy,
do the changes, push back and publish.

No need to remember to update remote copies, restart services, etc.

So, I decided to figure out a way to use the same workflow
on my servers too, and this is what I came out with.


First, let me introduce ghp-import
==================================

It's a nice script to quickly import a directory in the ``gh-pages``
branch of the current repository.

You can `check out from github <https://github.com/davisp/ghp-import>`_
or simply ``pip install --user ghp-import``.

It is very handy with github, and I'll show you how to use in our case too.


Setup the remote repository
===========================

It's as simple as:

.. code-block:: shell

    % mkdir mywebsite.git mywebsite
    % cd mywebsite.git
    % git init --bare
    % cat > hooks/post-receive
    #!/bin/sh
    GIT_WORK_TREE=../website/ git checkout -f gh-pages
    ^D
    % chmod +x hooks/post-receive


Testing this out
================

From your local machine, ``cd`` into the repository containing the stuff
you want to publish, and:

.. code-block:: shell

    % git remote add production git@myserver.com:path/to/mywebsite.git
    % ghp-import -n -p -r production -b gh-pages ./output/

That's it! Now, your remote directory ``path/to/mywebsite`` should reflect
the contents of your local ``./output/`` directory.


Sample nginx configuration
==========================

To serve the pages from your repository, you can use something like this
(published here for sake of copy-n-paste):

.. code-block:: nginx

    server {
        listen          80;
        server_name     www.mywebsite.com;
        root            /home/www/mywebsite/;
        access_log      /var/log/nginx/www.mywebsite.com_access.log;

        location / {
            index   index.html;
        }

        location ~* \.(gif|jpg|png)$ {
            expires 30d;
        }
    }

    server {
        server_name  mywebsite.com;
        rewrite ^(.*) http://www.mywebsite.com$1 permanent;
    }


Integration patterns
====================

Sphinx
------

To use with sphinx, I made the following changes to the ``Makefile``:

.. code-block:: makefile

    # For github-pages publication
    DOMAIN_NAME = wiki.hackzine.org

    # ...

    publish: html
        @echo $(DOMAIN_NAME) > $(BUILDDIR)/html/CNAME
        ghp-import -n -p ./build/html
        @echo
        @echo "HTML output published on github-pages"

(creation of the ``CNAME`` file is only needed when publishing github pages
with a custom domain name)

Pelican
-------

To build & publish `pelican`_-powered websites, I use this script:

.. code-block:: bash

    #!/bin/bash
    pelican -s pelicanconf.py -o ./output/ ./content/
    ghp-import -n -p -r production -b gh-pages ./output/

.. _pelican: http://pelican.readthedocs.org/
