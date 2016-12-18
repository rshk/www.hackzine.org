mypy: function accepting type, returning instance
#################################################

:date: 2016-12-18 21:08:39
:category: Development
:tags: python,mypy

I recently ended up with a function that looks a bit like this (most
of the logic was removed for sake of example):

.. code-block:: python

    def build(record, **kwargs):
        # Pretend we're doing stuff with the **kwargs here..
        return record(**kwargs)

Where record could be one of several classes. All we care about is,
the function accepts a type as first argument, and returns an instance
of that type.

The problem
===========

At first, the most logical way to describe this to mypy was to use a
``TypeVar`` like this:

.. code-block:: python

    from typing import Any, TypeVar, Type

    T = TypeVar('T')

    def build(record: Type[T], **kwargs: Any) -> T:
        return record(**kwargs)

Unfortunately, mypy disagrees with us::

    % mypy foo.py
    foo.py: note: In function "build":
    foo.py:7: error: Too many arguments for "object"

Apparently, if the typevar is used directly, it will straight
typecheck its call against the ``object`` constructor, rather than
waiting for an actual call and get the type.

Not sure if this is actually intentional, or just something missing
from mypy (I would expect it to work), but this lead me to find an
alternative approach.

The solution
============

If you think about it, another way to see the typing of that function is:

    Accept a callable as first argument, return that callable's return value

In that case, type definition would be as follows:

.. code-block:: python

    from typing import Any, Callable, NamedTuple, TypeVar

    T = TypeVar('T')

    def build(record: Callable[..., T], **kwargs: Any) -> T:
        return record(**kwargs)


Testing if it worked
====================

To check if it worked, and typechecking is able to catch incorrect
usage, I wrote a small test script.

First, I declared a few callables to be passed in as ``record``:

.. code-block:: python

    FooTuple = NamedTuple('FooTuple', [
        ('foo', int),
        ('bar', int),
    ])

    class FooClass:
        spam = None  # type: str
        eggs = None  # type: str

        def __init__(self, spam: str, eggs: str) -> None:
            self.spam = spam
            self.eggs = eggs

    def foofunc(a: int, b: int) -> int:
        return a + b

And a bunch of functions that expect a specific type:

.. code-block:: python

    def accept_tuple(arg: FooTuple) -> None:
        pass

    def accept_class(arg: FooClass) -> None:
        pass

    def accept_int(arg: int) -> None:
        pass

    def accept_str(arg: str) -> None:
        pass

This now will happily pass type checking:

.. code-block:: python

    accept_tuple(build(FooTuple, foo=123, bar=456))
    accept_class(build(FooClass, spam='SPAM', eggs='EGGS'))
    accept_int(build(foofunc, a=1, b=2))

While this won't:

.. code-block:: python

    accept_class(build(FooTuple, foo=123, bar=456))
    accept_tuple(build(FooClass, spam='SPAM', eggs='EGGS'))
    accept_str(build(foofunc, a=1, b=2))

::

    foo.py: note: In function "main":
    foo.py:55: error: Argument 1 to "accept_class" has incompatible type "FooTuple"; expected "FooClass"
    foo.py:56: error: Argument 1 to "accept_tuple" has incompatible type "FooClass"; expected "FooTuple"
    foo.py:57: error: Argument 1 to "accept_str" has incompatible type "int"; expected "str"


Caveats
=======

Mypy still have problems figuring out the type of varargs / kwargs,
and as such it's currently unable to spot the type errors here:

.. code-block:: python

    build(FooTuple, invalid='SOMETHING')
    build(FooClass, spam=123, eggs=456)
    build(foofunc, a='hello', invalid='foobar')

(no error was reported, as of mypy 0.4.6)


Debugging tips
==============

Even if you cannot have it on by default when checking your whole
codebase (because of legacy unannotated code), it's usually helpful to
add the ``--disallow-untyped-calls`` and ``--disallow-untyped-defs``
flags when calling mypy.

Especially I find it useful as apparently I keep forgetting that mypy
will **not** typecheck a function without an explicit return type,
even if that's just ``None``.

For example, mypy won't catch the type error here:

.. code-block:: python

    def hello(a: int) -> int:
        return a

    def main():
        hello('not an int')

But it definitely does if we remember to specify the function's return
type explicitly:

.. code-block:: python

    def main() -> None:
        hello('not an int')

::

    % mypy bar.py
    bar.py: note: In function "main":
    bar.py:6: error: Argument 1 to "hello" has incompatible type "str"; expected "int"

If we had run the first example with ``--disallow-untyped-calls
--disallow-untyped-defs``, we would have definitely spotted earlier
that something was wrong:

::

    % mypy --disallow-untyped-calls --disallow-untyped-defs bar.py
    bar.py: note: In function "main":
    bar.py:5: error: Function is missing a type annotation
