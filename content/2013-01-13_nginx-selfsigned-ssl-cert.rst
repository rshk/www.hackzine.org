#################################################
Using HTTPS with self-signed certificate in nginx
#################################################

:date: 2013-01-13 20:58
:tags: linux, sysadmin, nginx, ssl
:category: Sysadmin


I recently needed to enable https support on a nginx server, using
self-signed certificates. This is roughly the procedure I followed to:

* Create a CA siging certificate
* Create a delegate CA certificate for the actual signing
* Generate a certificate signing request
* Sign the request generating the final certificate


Generating the CA certificate
=============================

First of all, generate the master CA certificate:

.. code-block:: bash

    # Create the CA key
    openssl genrsa -des3 -out ca.orig.key 4096

    # Remove passphrase from CA key (optional)
    openssl rsa -in ca.orig.key -out ca.key

    # Create certificate (will create signing request + sign it)
    openssl req -new -x509 -days 365 -key ca.key -out ca.crt

    # Initialize the serial number for signing
    echo 01 > ca.srl

Then, generate a delegate authority certificate, and sign it:

.. code-block:: bash

    openssl genrsa -des3 -out ia.key 4096

    # Create a signing request
    openssl req -new -key ia.key -out ia.csr

    # Sign the request
    openssl x509 -req -days 730 -in ia.csr -CA ca.crt -CAkey ca.key -out ia.crt

    # Initialize the serial number for signed certificates
    echo 01 > ia.srl

Generate certificate for a domain
=================================

.. code-block:: bash

    MYDOMAIN="www.example.com"

    # Create the key (w/o passphrase..)
    openssl genrsa -des3 -out "$MYDOMAIN".orig.key 2048
    openssl rsa -in "$MYDOMAIN".orig.key -out "$MYDOMAIN".key

    # Create the signing request
    openssl req -new -key "$MYDOMAIN".key -out "$MYDOMAIN".csr


Use the IA to sign the request and generate the certificate
-----------------------------------------------------------

::

    openssl x509 -req -days 365 -in "$MYDOMAIN".csr -CA ia.crt -CAkey ia.key -out "$MYDOMAIN".crt


Installing certificates on the server
=====================================

To install the certificates on the web server, just place them somewhere,
eg in ``/etc/ssl/localcerts/``.

You will need to copy ``$MYDOMAIN.key`` and ``$MYDOMAIN.crt``.


Configure nginx
===============

For this, I took great advantage of the new `Server Name Indication`_
feature, that allows clients to specify the requested domain name during
the TLS handshake, thus allowing per-domain cerficates.

The installation is simple, just make sure both your OpenSSL library
and nginx are built with SNI support (the ones shipped with Debian Squeeze are),
then configure nginx as you normally would, but feel free to specify per-domain
certificates.

Example configuration::

    server {
        listen   443;
        server_name www.example.com;
        ssl on;
        ssl_certificate     /etc/ssl/localcerts/www.example.com.crt;
        ssl_certificate_key /etc/ssl/localcerts/www.example.com.key;

        ## Other virtualhost configuration goes here, pretty much
        ## the same as the http version..

    }

That's it! Now you should be able to simply import the CA certificate (.crt) in your browser
and start using the server right away.

.. _`Server Name Indication`: http://en.wikipedia.org/wiki/Server_Name_Indication

See also: `OpenSSL Basics and commands <http://wiki.hackzine.org/sysadmin/openssl-commands.html>`_.

More references
===============

* `Nginx: Configuring HTTPS servers <http://nginx.org/en/docs/http/configuring_https_servers.html>`_
* `Heroku: Creating a Self-Signed SSL Certificate <https://devcenter.heroku.com/articles/ssl-certificate-self>`_
* `Heroku: Creating an SSL Certificate Signing Request <https://devcenter.heroku.com/articles/csr>`_
* `Howto: Make Your Own Cert With OpenSSL <http://blog.didierstevens.com/2008/12/30/howto-make-your-own-cert-with-openssl/>`_
