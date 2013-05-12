Python testing with py.test and 2to3 (plus Tox and Travis CI)
#############################################################

:tags: python, development
:date: 2013-05-12 23:12:00
:category: Development

I recently decided to try `py.test`_ as my test-running facility,
in place of the old, boring ``unittest`` module.

It seems a nice piece of software so far, the only problem I encountered
is making it work automatically with Python 3, on code built via 2to3 script.

.. _py.test: http://pytest.org/


A little intro to 2to3
======================

For those not familiar with it, `2to3`_ is a script that converts code
written for Python 2.x into code for Python 3.x, for example by replacing
things like ``"string"`` and ``u"unicode"`` with ``b"bytes"`` and ``"string"``,
``.iteritems()`` with ``.items()``, etc.

The excellent `distribute`_ packaging tool offers support for automatically
passing code through 2to3 before installing or testing, so, using standard
``unittest``, you can simply run ``python setup.py test`` and have your
code built & tests run "automagically", independently from the version
(just make sure to add ``use_2to3=True`` to your ``setup()`` call).

.. _2to3: http://docs.python.org/2/library/2to3.html
.. _distribute: http://pythonhosted.org/distribute/


Problems with py.test
=====================

On `the official integration guide`_ between py.test and distribute, it
says to use something like this as a test command class, in order
to use py.test in place of unittest:

.. _the official integration guide: http://pytest.org/latest/goodpractises.html#integration-with-setuptools-distribute-test-commands

.. code-block:: python

    from setuptools.command.test import test as TestCommand
    import sys

    class PyTest(TestCommand):
        def finalize_options(self):
            TestCommand.finalize_options(self)
            self.test_args = []
            self.test_suite = True
        def run_tests(self):
            #import here, cause outside the eggs aren't loaded
            import pytest
            errno = pytest.main(self.test_args)
            sys.exit(errno)

    setup(
        #...,
        tests_require=['pytest'],
        cmdclass = {'test': PyTest},
        )

I tried it, and it works like a charm with Python 2.
But with Python 3, it keeps trying to load modules from the source directory
instead of the build directory.

I had a look at the ``TestCommand`` code, and hacked together this thing,
that seems to be working fine, so far:


.. code-block:: python

    class PyTest(TestCommand):
        def finalize_options(self):
            TestCommand.finalize_options(self)
            self.test_args = ['yourpackage/tests']
            self.test_suite = True

        def run_tests(self):
            from pkg_resources import _namespace_packages
            import pytest

            # Purge modules under test from sys.modules. The test loader will
            # re-import them from the build location. Required when 2to3 is used
            # with namespace packages.
            if sys.version_info >= (3,) and getattr(self.distribution, 'use_2to3', False):
                module = self.test_args[-1].split('.')[0]
                if module in _namespace_packages:
                    del_modules = []
                    if module in sys.modules:
                        del_modules.append(module)
                    module += '.'
                    for name in sys.modules:
                        if name.startswith(module):
                            del_modules.append(name)
                    map(sys.modules.__delitem__, del_modules)

                ## Run on the build directory for 2to3-built code
                ## This will prevent the old 2.x code from being found
                ## by py.test discovery mechanism, that apparently
                ## ignores sys.path..
                ei_cmd = self.get_finalized_command("egg_info")
                self.test_args = [normalize_path(ei_cmd.egg_base)]

            errno = pytest.main(self.test_args)
            sys.exit(errno)


In short, what it does is, for Python 3 only, to instruct py.test to search
for tests inside the build directory for 2to3 converted code, instead of the
current directory.


Tox configuration
=================

Yeah, I promised you some advice on how to use tox to run the tests too,
so here it is the configuration I'm using::

    [tox]
    envlist = py26,py27,py32,py33

    [testenv]
    deps = pytest

    commands=
        python setup.py test

Yes, that's it. Now install tox and run it::

    pip install tox
    tox


Travis CI configuration
=======================

Since I use `Travis CI`_ too for many of my projects hosted on GitHub,
and I'm counting on copy-pasting from this post in the future :), here it
is the configuration I'm using right now::

    branches:
      except:
        - gh-pages

    language: python

    python:
      - "2.6"
      - "2.7"
      - "3.1"
      - "3.2"
      - "3.3"

    env:
        - PIP_USE_MIRRORS=true

    script: "python setup.py test"

    matrix:
      allow_failures:
        - python: "3.1"


.. _Travis CI: http://travis-ci.org/
