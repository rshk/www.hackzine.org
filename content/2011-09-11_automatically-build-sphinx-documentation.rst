Automatically build Sphinx documentation
########################################

:date: 2011-09-11 05:18:00
:tags: Bash, documentation, Python, Sphinx

This is a short bash script I wrote in order to automatically build the HTML
version of some documentation using the `Sphinx`_ documentation system upon
change of any file inside the documentation directory.

The script should be placed inside the documentation directory (the same containing the Sphinx Makefile, etc).
Its behavior is quite straight-forward; what it does is:

1. Retrieve the directory containing the script, and use as ``$WORKDIR``
2. Wait for a modify/create/delete event on the ``$WORKDIR``
3. Use the makefile to build html documentation into ``$WORKDIR``
4. Continue the infinite loop until stopped by ``CTRL-C``

.. code:: bash

    #!/bin/bash
    ## Automatically build Sphinx documentation upon file change
    ## Copyright (c) 2011 Samuele ~redShadow~ Santi - Under GPL

    WORKDIR="$( dirname "$0" )"
    while :; do
        ## Wait for changes
        inotifywait -e modify,create,delete -r "$WORKDIR"
        ## Make html documentation
        make -C "$WORKDIR" html
    done

.. _Sphinx: http://sphinx.pocoo.org/

Update: improved version
------------------------

This is the improved version I'm using, as of 2012-11-06 (in fact,
this very same page has been built by a similar script).

.. code:: bash

    #!/bin/bash
    ## Automatically build Sphinx documentation upon file change
    ## Copyright (c) 2011-2012 Samuele ~redShadow~ Santi - Under GPL

    if ! which inotifywait &>/dev/null; then
        echo "ERROR: Program 'inotifywait' is not installed"
        exit 1
    fi

    ## Gray out the output
    fade() {
        sed 's/^\(.*\)$/\x1b[1;30m\1\x1b[0m/'
    }

    while :; do
        ## Wait for changes in current directory
        inotifywait -r -e modify,close_write,moved_to,moved_from,move,create,delete ./hackzine/ 2>&1 | fade

        ## Run the command and retrieve return code
        "$@"
        RET="$?"
        ARGS="$@"

        ## Try to send a notification using libnotify
        if which notify-send &>/dev/null; then
            if [ "$RET" == "0" ]; then
                ICO="dialog-information"
                TITLE="Make execution successful"
            else
                ICO="dialog-error"
                TITLE="Make execution failed"
            fi
            notify-send "$TITLE" \
                "Command was: '$ARGS'\n\nPWD: $(pwd)\n\nReturn code: $RET" \
                --icon="$ICO" \
                2>&1 | fade
        fi
    done

Example usage would be::

    ./autobuild.sh make html
