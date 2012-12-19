Register APT repository key
###########################

:tags: linux, debian
:date: 2010-01-01 19:45:00
:category: Sysadmin

Here is an useful script to register APT keys, to avoid the
``"There are no public key available for the following key IDs"`` warning message.


.. code:: bash

    #!/bin/bash

    KEYID="$1"

    echo "Registering APT key $1..."
    gpg --keyserver wwwkeys.eu.pgp.net --recv-keys "$KEYID"
    gpg --export --armor "$KEYID" | apt-key add -


Alternate ways to do this
-------------------------

By googling a bit, I found some alternate ways to do this (although
it seems they're not always valid):

From http://kovyrin.net/2006/11/28/debian-problem-apt-get-update/::

    $ apt-key update

While here: http://www.debian-administration.org/users/dkg/weblog/11 they
suggest installing ``debian-archive-keyring``, instead::

    # apt-get install debian-archive-keyring

(or, if you have unstable repositories)::

    # apt-get install debian-archive-keyring/unstable

