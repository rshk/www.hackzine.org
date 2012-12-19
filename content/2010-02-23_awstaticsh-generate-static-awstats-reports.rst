awstatic.sh - Generate static awstats reports
#############################################

:tags: linux, sysadmin, scripts
:date: 2010-02-23 01:47:00
:category: Tools

This is the script I use to generate static reports from awstats

.. code:: bash

    #!/bin/bash

    ## (C)2010 Samuele Santi
    ## License: GPL v3 or later
    ## Date: 2010-02-23

    STATIC_DEST="/var/www/awstats/static"

    cat > "$STATIC_DEST/index.html" << EOF
    <html><head><title>AWSTATS - Static</title></head><body>
    <h1>AWSTATS - Static Statistics</h1>
    <ul>
    EOF

    for conf in $( ls /etc/awstats/ | grep "^awstats\..*\.conf\$" | sed "s/^awstats\.\(.*\).conf\$/\1/" ); do
        echo "Generating static pages for $conf ..."
        if [ ! -e "${STATIC_DEST}/${conf}" ]; then
            mkdir -p "${STATIC_DEST}/${conf}"
        fi
        /usr/share/doc/awstats/examples/awstats_buildstaticpages.pl \
            -awstatsprog=/usr/lib/cgi-bin/awstats.pl \
            -dir="${STATIC_DEST}/${conf}" \
            -config="$conf" -buildpdf 2>&1 \
            | sed "s/^/  /"
        echo "<li><a href='${conf}/awstats.${conf}.html'>${conf}</a> "\
            "[<a href='${conf}/awstats.${conf}.pdf'>PDF</a>]</li>" \
            >> "$STATIC_DEST/index.html"
    done

    cat >> "$STATIC_DEST/index.html" << EOF
    </ul>
    <hr />
    <div><em>Last update: $( date +"%F %T" )</em></div>
    </body></html>
    EOF
