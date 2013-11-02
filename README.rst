Hackzine.org
############

Source files for http://www.hackzine.org.


Usage instructions
==================

To build CSS files (only needed if changing SCSS in the theme)::

    make clean_css_files css_files html

..and to build them automatically (this `autobuild.sh`_ is a generic
one from ``rshk/CommonScripts``, not the one included in the repository!)::

  autobuild.sh -l ./themes/hackzine-org/ make clean_css_files css_files html

.. _autobuild.sh: https://github.com/rshk/CommonScripts/blob/master/Linux/Generic/autobuild.sh

To automatically build upon changes::

    ./autobuild.sh

To start a webserver on the output folder::

    ./serve.sh

will start a SimpleHttpServer on port ``8090``.


License
=======

The blog posts are under `CreativeCommons CC-BY`_ license.

.. _CreativeCommons CC-BY: http://creativecommons.org/licenses/by/2.0/


Other source code, the theme, and any work derived from the
original Pelican code is under `GNU Affero GPL`_.

.. _GNU Affero GPL: http://www.gnu.org/licenses/agpl-3.0.html
