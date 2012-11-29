Automatic screenshot + upload
#############################

:tags: linux, scripts, utility
:date: 2009-08-05 13:57:00
:category: Tools

.. code:: bash

    #!/bin/bash

    #
    # Auto-screenshot taker
    #
    # Uses xsnap and ssh to take snapshot of a region or window
    # and upload it to a remote server to quickly share it.
    #
    # Copyright (C) 2009  Samuele ~redShadow~ Santi - Under GPL v3
    # Please visit : http://www.hackzine.org
    #

    # TODO find a better way to handle ssh key request
    # we assume that you're using ssh-agent and have the key registered,
    # otherwise there could be some problems / unknown behaviours

    # Also, on Xfce, adding a launcher with "Run in terminal" flag on
    # does the job since terminal is launched in background..

    # Or, there is some programs that ask your ssh keyphrase
    # via-(f**)-graphical-dialog, and that could do the job..

    # Please let me know if you find a better way to use it.

    # Then, yeah, maybe I should add support also for FTP-ing files, etc.
    # but I'm not interested in that and think that FTP is the evil, or better:
    # pure clear-text absolutely-unsecure stupid fuckin' obsolete crap.


    CONF_FILE=~/.autosnap-conf

    if [ -e $CONF_FILE ]; then
      source $CONF_FILE
    else
      echo "Please configure ~/.autosnap-conf before proceeding"
      (
      echo "# Configuration file for autosnap.sh"
      echo "# Generated on `date`"
      echo ""
      echo "# SSH host/port used for uploading with scp"
      echo "SSH_HOST=localhost"
      echo "SSH_PORT=22"
      echo "SSH_USER=`whoami`"
      echo ""
      echo "# Font to be used by xnap. Do not change unless necessary"
      echo "XSNAPFONT=\"-bitstream-charter-medium-r-normal-*-12-*-*-*-p-*-iso8859-*\""
      echo ""
      echo "# Remote destination path"
      echo "REMOTE_PATH=/var/www/files/"
      echo ""
      echo "# (optional) url where uploaded files are accessible"
      echo "REMOTE_URL=http://example.com/files"
      echo ""
      echo "# (optional) browser to auto-open uploaded screenshots"
      echo "BROWSER=firefox"
      echo ""
      echo "# (optional) show dialog box containing the destination url?"
      echo "# Requires kdialog or (fallback) Xdialog"
      echo "SHOWDIALOG=1"
      ) >$CONF_FILE
      exit 1
    fi



    # Check if xsnap is installed
    xsnap --help &>/dev/null
    if [ "$?" == "127" ]; then
      echo "xsnap not found. Please install x11-misc/xsnap"
      exit 1
    fi

    if [ "$XSNAPFONT" == "" ]; then
      XSNAPFONT="-bitstream-charter-medium-r-normal-*-12-*-*-*-p-*-iso8859-*"
    fi

    # Temporary file
    tf="$(mktemp)"

    # Take screenshot
    xsnap -fn "$XSNAPFONT" -png -stdout > "$tf"

    if [ "$1" != "" ]; then
      ONAME="$1"
    else
      ONAME="screenshot"
    fi

    ONAME="${ONAME}_$(date +%Y%m%d-%H%M%S).png"

    # Scp it
    scp -P$SSH_PORT "$tf" ${SSH_USER}@${SSH_HOST}:"${REMOTE_PATH}/$ONAME"
    ssh -p$SSH_PORT ${SSH_USER}@${SSH_HOST} chmod 644 "${REMOTE_PATH}/$ONAME"

    # Show url
    if [ "$REMOTE_URL" != "" ]; then
      URL="$REMOTE_URL/$ONAME"
      echo "$URL"

      if [ "$BROWSER" != "" ]; then
        "$BROWSER" "$URL"
      fi

      if [ "$SHOWDIALOG" == "1" ]; then
        kdialog --msgbox "$URL" || Xdialog --msgbox "$URL" 8 70
      fi

    fi