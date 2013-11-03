Even better testing, with py.test + tox + travis
################################################

:tags: python, development
:date: 2013-11-03 15:10:00
:category: Development

I recently wrote `a post about using py.test and tox <|filename|2013-05-12_python-testing-tox-pytest-2to3.rst>`_. Now I improved the technique a bit, so here it is a new post with all the recent improvements.

(Please refer to that post for the problems I had to solve, and reasons behind the need of this kind of customizations).


The new test class
==================

In order to properly support Python3, I'm using this test class in my ``setup.py``:

.. code-block:: python

    from setuptools.command.test import test as TestCommand

    class PyTest(TestCommand):
	test_package_name = 'MyMainPackage'

	def finalize_options(self):
	    TestCommand.finalize_options(self)
	    _test_args = [
		'--verbose',
		'--ignore=build',
		'--cov={0}'.format(self.test_package_name),
		'--cov-report=term-missing',
		'--pep8',
	    ]
	    extra_args = os.environ.get('PYTEST_EXTRA_ARGS')
	    if extra_args is not None:
		_test_args.extend(extra_args.split())
	    self.test_args = _test_args
	    self.test_suite = True

	def run_tests(self):
	    import pytest
	    from pkg_resources import normalize_path, _namespace_packages

	    # Purge modules under test from sys.modules. The test loader will
	    # re-import them from the build location. Required when 2to3 is used
	    # with namespace packages.
	    if sys.version_info >= (3,) and getattr(self.distribution, 'use_2to3', False):
		#module = self.test_args[-1].split('.')[0]
		module = self.test_package_name
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

		## Replace the module name with normalized path
		#self.test_args[-1] = normalize_path(ei_cmd.egg_base)
		self.test_args.append(normalize_path(ei_cmd.egg_base))

	    errno = pytest.main(self.test_args)
	    sys.exit(errno)

One of the main advantages compared to the old one is that this allows easily
customization of the py.test invocation arguments from the environment, which
is very handy when running tests from tox, eg, in case you need to add the
``--pdb`` argument::

    PYTEST_EXTRA_ARGS='--pdb' tox -e py33

In order to stick it in the ``setup.py``, you'll have to do the following changes:

.. code-block:: python

    tests_require = [
	'pytest',
	'pytest-pep8',
	'pytest-cov',
    ]

    extra = {}
    if sys.version_info >= (3,):
	extra['use_2to3'] = True

    setup(
	# ...
	test_suite='objpack.tests',
	tests_require=tests_require,
	cmdclass={'test': PyTest},
	**extra)


The tox configuration file
==========================

.. code-block:: ini

    [tox]
    envlist = py26,py27,py32,py33

    [testenv]
    deps =
	 pytest
	 pytest-pep8
	 pytest-cov

    commands=
	py.test --ignore=build --pep8 -v --cov=MyPackage --cov-report=term-missing MyPackage

    [testenv:py32]
    commands=
	python setup.py test

    [testenv:py33]
    commands=
	python setup.py test

In this case, I'm using the raw py.test command in Python 2, while passing through
``setup.py`` in Python 3, in order to first compile the source through 2to3.


The Travis CI configuration
===========================

In order to get better integration with ``tox``, I'm tweaking things a bit:
TravisCI just runs the tox command, each time with a different ``TOXENV``.

Then tox itself will handle all the virtualenv creation, using the appropriate
Python version each time.

.. code-block:: yaml

    language: python

    branches:
      except:
        - gh-pages

    python:
      - "2.7"

    env:
      - TOXENV=py26
      - TOXENV=py27
      - TOXENV=py32
      - TOXENV=py33
      - TOXENV=pypy

    install:
      - pip install tox --use-mirrors

    script: tox
