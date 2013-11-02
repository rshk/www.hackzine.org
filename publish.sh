#!/bin/bash

set -e
export PELICAN_SITEURL=http://www.hackzine.org
pelican -s pelicanconf.py -o ./output/ ./content/
ghp-import -n -p -r production -b gh-pages ./output/
