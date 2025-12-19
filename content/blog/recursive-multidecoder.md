---
title: Recursive string multidecoder
description:
date: 2025-12-19
tags: infosec,programming
draft: true
---

Say we found a string somewhere that has clearly been encoded multiple
times, using different encorings.

We could go ahead and manually attempt to decode it step-by-step,
using our favorite programming language, or one of the available tools
for decoding strings, but that's tedious work.

Surely we can automate the whole process? Read along.


## General idea

We could create a script that automatically attempts to decode our
input string using several well-known encoding formats.

* Decoding failed? We guessed the wrong encoding.
* Input didn't change? Also, wrong encoding.

We then keep applying the same process recursively, until we can't
decode the string any further.


## Python implementation

Let's start by creating a dictionary, mapping an encoding name to a
function that can be used to decode a string in that encoding:

``` python
# This is a long way to say, a dict mapping names to a function
# that accepts bytes, returns bytes.
DECODERS: dict[str, Callable[[bytes], bytes]] = {}
```


### Adding functions to the dict

We could do it the boring way, by defining a bunch of functions, then
creating a dict like:

``` python
{
  "encoding1": decode_encoding1,
  "encoding2": decode_encoding2,
  ...
}
```

but that feels clumsy.

Let's create a simple decorator instead:

``` python
def add_decoder(name: str):
    def decorator(fn):
        DECODERS[name] = fn
        return fn
    return decorator
```

We can now proceed to create decoding functions for all the encoding
formats we want to support:

``` python
import base64
import html
import urllib.parse

@add_decoder("base64")
def decode_base64(text: bytes) -> bytes:
    return base64.decodebytes(text)


@add_decoder("base64_urlsafe")
def decode_base64_urlsafe(text: bytes) -> bytes:
    return base64.urlsafe_b64decode(text)


@add_decoder("hex")
def decode_hex(text: bytes) -> bytes:
    return bytes.fromhex(text.decode())


@add_decoder("html")
def decode_html(text: bytes) -> bytes:
    return html.unescape(text)


@add_decoder("url")
def decode_url(text: bytes) -> bytes:
    return urllib.parse.unquote(text.decode()).encode()
```


### Now, for the important bit

We want to recursively exlore results, possibly following multiple
different paths, to see where they lead to.

We also want to decouple the analysis part from the display part, so
we can possibly feed its output into some other tool.

``` python
Result = NewType("Result", tuple[str, bytes, list["Result"]])


def multidecode(text: bytes, max_depth=10) -> Iterable[Result]:
    if max_depth <= 0:
        return  # Max depth reached

    assert isinstance(text, bytes)
    for name, decoder in DECODERS.items():
        try:
            decoded = decoder(text)
        except Exception:
            continue  # Nothing was decoded
        assert isinstance(decoded, bytes)
        if text == decoded:
            continue  # Nothing changed

        yield Result((name, decoded, multidecode(decoded, max_depth=max_depth - 1)))
```


### Displaying the results

We need to recursively traverse the results and print out information:

``` python
def display_result(results: Iterable[Result], depth=0):
    indent = " " * (4 * depth)
    for (
        name,
        decoded,
        subitems,
    ) in results:
        print(f"{indent}{name} -> {decoded}")
        display_result(subitems, depth + 1)
```


### Stitching it all together


``` python
def main():
    for text in sys.argv[1:]:
        print(text)
        text = text.encode()
        results = multidecode(text, max_depth=10)
        display_result(results, depth=1)
        print()


if __name__ == "__main__":
    main()
```



## Example

```
4a5464434a544979614756736247386c4d6a496c4d30456c4d6a416c4d6a4a5862334a735a4355794d69553352413d3d
```

This looks like a hex-encoded string, right?

``` shell
% uv run ./encdec/multidecoder.py "4a546443...52413d3d"
4a546443...52413d3d
    base64 -> b'\xe1\xaex\xeb\x8e7...\xdd\xdd\xdd'
        base64 -> b'\xc7\xbcg\x9b\xb9\xf9'
        base64_urlsafe -> b'\xc7\xbcg\x9b\xb9\xf9'
    base64_urlsafe -> b'\xe1\xaex\xeb\x8e7...\xdd\xdd\xdd'
        base64 -> b'\xc7\xbcg\x9b\xb9\xf9'
        base64_urlsafe -> b'\xc7\xbcg\x9b\xb9\xf9'
    hex -> b'JTdCJTIyaGVsbG8lMjIlM0ElMjAlMjJXb3JsZCUyMiU3RA=='
        base64 -> b'%7B%22hello%22%3A%20%22World%22%7D'
            url -> b'{"hello": "World"}'
        base64_urlsafe -> b'%7B%22hello%22%3A%20%22World%22%7D'
            url -> b'{"hello": "World"}'
```

As we can see, the original string decoded successfully as both base64
and hexadecimal, but while the base64 route lead to unconclusive
results, we can immediately see that decoding it as hex, then base64,
then urlencoded, produced some json-looking object. Hurray!

## Links

[Download the complete source code of multidecoder.py](https://gist.github.com/rshk/b124b90fea932b09759aeec731d8be36)
