Using Apache Tika from Python, with jnius
#########################################

:tags: python, development
:date: 2013-05-18 18:06
:category: Development


I needed a library to extract metadata and plaintext transcript from
various file formats, for indexing purposes.

After looking around for a while, I found out that `Apache Tika`_ might
be the right tool for the job (or, at least, it does quite a good job
in extracting information from files).

.. _Apache Tika: http://tika.apache.org/

Sadly though, that thing is written in Java.

At first, I tried it by running the jar via ``subprocess`` and then parsing
the json output. I quickly discarded that approach, as:

* It required to launch the process twice (once for extracting metadata,
  and once to extract the plain-text version)
* Continuously re-launching JVMs is not exactly what you call "lightweight"
* The json output is sometimes malformed :( (I'll open an issue for that).
* I tried using the XML format, but then the returned "text format" is HTML,
  and I want plain text for putting in the indexer.

Then, I tried using it in ``--server`` mode, but the problems are pretty
much the same: you should run two instances for metadata/text, or use
the xml version that contains html tags, ...

So, I decided to try some method of directly calling the Java library
from Python.

There are many ways to do this, including:

* **Using jython** but, even if it's only a worker and not the whole
  application, you lose the ability to use a bunch of Python modules, ..

* **Creating a wrapper via jcc:** I found some people that did that
  with older versions of Tika, but I wasn't able to quickly use that
  on version 1.3 (I'm pretty sure I did something wrong, but I'm not
  very expert in Java..)

* **Using py4j:** I had a look at py4j_ but.. it looks like sort-of a
  rpc library, talking a custom protocol over tcp.. wtf?

* **Using jnius:** finally, I remembered of a library I spotted once,
  called jnius_, that should be made exactly for that purpose: using
  Java libraries from Python, without the need of wrappers, running
  the whole thing in a JVM, etc.. at the end, I opted for doing this way.

.. _py4j: http://py4j.sourceforge.net/
.. _jnius: https://github.com/kivy/pyjnius


Setting up pyjnius
==================

Setting things up was pretty straight-forward, as it was just a matter of::

    pip install cython
    pip install git+git://github.com/kivy/pyjnius.git

Then, I downloaded the tika-app jar, and put it somewhere.

From that point, using the library was a breeze:

.. code-block:: python

    ## If you put the jar in a non-standard location, you need to
    ## prepare the CLASSPATH **before** importing jnius
    import os
    os.environ['CLASSPATH'] = "/path/to/tika-app.jar"

    from jnius import autoclass

    ## Import the Java classes we are going to need
    Tika = autoclass('org.apache.tika.Tika')
    Metadata = autoclass('org.apache.tika.metadata.Metadata')
    FileInputStream = autoclass('java.io.FileInputStream')

    tika = Tika()
    meta = Metadata()
    text = tika.parseToString(FileInputStream(filename), meta)

That's it! Now, you can just access the text transcript from ``text``,
and the file metadata is stored in ``meta`` (have a look at the ``.names()``
and ``.get(name)`` methods).

Integrating this with django and celery tasks was straightforward.

Of course, have a look at the `Tika API Documentation`_ for more information
on the available methods, signatures, etc.

.. _Tika API Documentation: http://tika.apache.org/1.3/api/
