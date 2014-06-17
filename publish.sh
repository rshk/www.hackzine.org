#!/bin/bash

set -e
export PELICAN_SITEURL=http://www.hackzine.org
pelican -s pelicanconf.py -o ./output/ ./content/
ghp-import -n -r production -b gh-pages ./output/
git push -f production gh-pages
