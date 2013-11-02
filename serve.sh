#!/bin/sh

set -e
cd ./output
exec python -m SimpleHTTPServer 8090
