Drupal crons run script
#######################

:tags: Drupal, SysAdmin, scripts
:date: 2009-12-06 14:22:00

This is the script I use to run cronjobs on all the sites in a given
Drupal installation:

.. code:: bash

    #!/bin/bash

    #
    # Drupal sites cronjob runner. Useful to be put into crontab.
    # samu 2009-12-06
    #

    ## --- Configuration ---
    CONF_SITES="/usr/local/etc/drupal-sites" # sites list
    CONF_LOGDIR="/var/log/drupal-cron" # logs dir
    ## --- End Config ---

    # load sites list, stripping lines that are empty or starting by #
    SITES="$(cat "$CONF_SITES" |grep -ve "^$\|^[^A-Za-z0-9]*#")"

    # create log directory if not exists
    if [ ! -e "$CONF_LOGDIR" ] ; then
      echo " * Creating log directory: $CONF_LOGDIR"
      mkdir -p "$CONF_LOGDIR"
    fi

    # prepare logfile name
    LOGFILE="$CONF_LOGDIR/drupal-cron_$( date "+%Y-%m-%d" ).log"

    # Run all cronjobs
    echo "--- Drupal Cronjobs `date "+%Y-%m-%d %H:%M"` -------------------------------------------" | tee -a $LOGFILE
    for site in $SITES; do
    #   wget -S -O - http://drupaltest.drupal.local/cron.php 2>&1 |grep "  HTTP/"|cut -d' ' -f4,5
      printf "%-50s" "  * Cron for $site ... " | tee -a $LOGFILE
      #echo -n "  * Cron for $site ... " | tee -a $LOGFILE
      wget -S -O - -T 30 "http://${site}/cron.php" 2>&1 |
        grep "  HTTP/" |
        tail -n1 |
        sed 's/^ *HTTP[^ ]* \(.*\)/\1/' |
        tee -a $LOGFILE
    done

    echo "Done. Logfile on $LOGFILE"
