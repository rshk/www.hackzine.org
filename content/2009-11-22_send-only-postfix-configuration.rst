Send-only Postfix configuration
###############################

:tags: sysadmin, postfix
:date: 2009-11-23 00:42:00

I just configured postfix on a machine to send-only mode (just send emails, do not receive).
I cut-and-paste the configuration here. Maybe it is not so cool, but it works.

``/etc/postfix/main.cf``

.. code:: cfg

    ## See /usr/share/postfix/main.cf.dist for a commented, more complete version

    smtpd_banner = $myhostname ESMTP $mail_name (Debian/GNU)
    biff = no

    # appending .domain is the MUA's job.
    append_dot_mydomain = no

    readme_directory = no

    # TLS parameters
    smtpd_tls_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
    smtpd_tls_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
    smtpd_use_tls=yes
    smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
    smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache

    # See /usr/share/doc/postfix/TLS_README.gz in the postfix-doc package for
    # information on enabling SSL in the smtp client.

    myhostname = myhost.mydomain.org
    mydomain = mydomain.org

    myorigin = $mydomain
    relayhost = $mydomain
    inet_interfaces = loopback-only
    local_transport = error:local delivery is disabled

    mynetworks_style = host

    alias_maps = hash:/etc/aliases
    alias_database = hash:/etc/aliases

    relayhost =
    mailbox_command = procmail -a "$EXTENSION"
    mailbox_size_limit = 0
    recipient_delimiter =
    inet_interfaces = all
    myorigin = /etc/mailname
    inet_protocols = ipv4

It should work for most internet sites that just have to send out emails and
nothing more.

Any advice/improvement is welcome!


See also
--------

The official `STANDARD_CONFIGURATION_README <http://www.postfix.org/STANDARD_CONFIGURATION_README.html>`_.

