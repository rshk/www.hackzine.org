#!/bin/sh
export PELICAN_SITEURL=http://127.0.0.1:8090
exec pelican --debug --autoreload -s pelicanconf.py -o output ./content
