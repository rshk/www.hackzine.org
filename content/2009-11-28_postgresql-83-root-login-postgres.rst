Make root log in as postgres user on PostgreSQL
###############################################

:tags: sysadmin, postgresql
:date: 2009-11-29 00:50:00
:category: Sysadmin

I am writing some backup scripts for a server, and I needed a way to let the
root user on the machine to login to PostgreSQL as 'postgres' user to perform
some administrative operations.

To do so, I had to make a few changes to the configuration file, to let the
root user to authenticate via local-socket without providing a password
(the script is launched automatically by cron, no user interaction needed).

``/etc/postgresql/8.3/main/pg_hba.conf``::

    # TYPE  DATABASE  USER      CIDR-ADDRESS  METHOD
    local   all       postgres                ident rootaspg
    local   all       all                     ident sameuser
    host    all       all       127.0.0.1/32  md5
    host    all       all       ::1/128       md5

``/etc/postgresql/8.3/main/pg_ident.conf``::

    # MAPNAME  IDENT-USERNAME  PG-USERNAME
    rootaspg   root            postgres
    rootaspg   root            drupal
    rootaspg   postgres        postgres

This allows root to authenticate on postgresql via unix-socket as the users
``postgres`` and ``drupal``.
