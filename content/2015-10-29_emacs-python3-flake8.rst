Python3 development with Emacs
##############################

:tags: python, emacs
:date: 2015-10-29 12:40:19
:category: Development

I am currently working on a mix of Python2/Python3 projects, and as
such, I need to find a way to customize a few things on a per-project
basis. This post contains notes I'm going to take along the path.


Per-directory variables
=======================

Using ``.dir-locals.el``, you can customize things on a per-directory
basis.  Changes will affect all files in the directory containing this
file, and all its subdirectories.

**Note:** you can use the ``M-x add-dir-local-variable`` command to
quickly setup dir-locals. You'll be prompted to provide all the
required information.


Custom flake8 executable
------------------------

Set the ``flycheck-python-flake8-executable`` variable to the name of
the executable you want to use. Will be resolved against ``$PATH``.

.. code-block:: lisp

    ;;; Directory Local Variables
    ;;; For more information see (info "(emacs) Directory Variables")

    ((python-mode
      (flycheck-python-flake8-executable . "flake8-3.5")))


(in this case, I manually renamed flake8 installed by python3.5 to
``~/.local/bin/flake8-3.5``; it would probably be a good idea to use
the `Emacs Python virtualenv API`_ but I still have to figure out how).

.. _`Emacs Python virtualenv API`: http://emacs-python-environment.readthedocs.org/en/latest/
