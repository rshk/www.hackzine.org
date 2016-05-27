#!/bin/sh

set -e
cd ./output
exec python3 -m http.server 8090
