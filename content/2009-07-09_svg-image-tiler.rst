SVG Image Tiler
###############

:tags: utility, scripts
:date: 2009-07-09 00:00:00

Here it is a small Bash script I wrote in order to easily "cut out"
and rasterize to PNG parts from a SVG file.

Download the script here: `svgtiler.sh <https://gist.github.com/4033974>`_.

It uses `Inkscape <http://inkscape.org/>`_ for all the conversion part.

Usage
=====

* Define the grid dimensions: tile width/height and amount of vertical/horizontal
  tiles.

* For each of the interesting tiles (specified by using row an column number),
  call Inkscape to cut out and render the selected area from the SVG image,
  to a given destination file.

Arguments
=========

``-f filename.svg``
    Specify the input file name

``-t, --tile rows cols``
    Specify the selected tile(s).
    Both "rows" and "cols" can be a single zero-based index,
    a space-separated list or a range defined as ``MIN-MAX``

``-d, --dest path``
    Specify the output destination, as filename prefix.
    The final filename will be ``<path>-row-column.png``.

``-ts, --tile-size width height``
    Specify the tile size, in pixels.

``-gs, --grid-size width height``
    Specify the grid size, in horizontal/vertical tile number.

``-os, --out-size width height``
    Specify the output image size.
    You can specify only one of the two dimensions using the
    ``-ow`` and ``-oh`` arguments; in this case, the other one will be
    calculated proportionally.

``-b, --background color``
    Specify the background color for the image, in RGBA format.
    Defaults to white (ffffffff).

``--inkscape path``
    Specify the path to the Inkscape binary to use, if it's not in PATH.

``--debug``
    Enable debugging output.
