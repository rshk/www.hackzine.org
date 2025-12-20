---
title: Recursive string multidecoder
description:
date: 2025-12-20
tags: infosec,programming,tools
draft: true
---

It's common when reverse engineering some piece of software or network
protocol, to come across some text that has been encoded multiple
times, possibly mixing multiple encodings.

There are several tools that can help with the decoding process, but
it can be pretty labor intensive to manually decode a string multiple
times, trying to guess the correct encoding in the process.

Wouldn't it be nice to have a tool to automate this process for us,
automatically exploring various combinations of encodings until a
result is found?


## TL;DR just gimme the tool

Sure! Get the source from [github](https://github.com/rshk/multidecoder) or [pypi](https://pypi.org/project/text-multidecoder/).

Install with [pipx](https://pipx.pypa.io/stable/installation/):

``` shell
# Latest release
pipx install text-multidecoder

# From a git branch
pipx install git+https://github.com/rshk/multidecoder.git@main
```

### Command line usage

``` shell
multidecoder -t "string to decode"
multidecoder < decodeme.txt
```


Example:

<pre class="language-custom">
<span class="token punctuation">%</span> <span class="token keyword">multidecoder</span> -t <span class="token string">"4a5464434a544979614756736247386c4d6a496c4d30456c4d6a416c4d6a4a5862334a735a4355794d69553352413d3d"</span>
<span style="color:#42a5f5">base64<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">hex[ e1 ae 78 eb 8e 37 e1 ae 78 e3 de fd eb 5e 3b e7 ae f7 eb 6e 3b df ce 9c e1 de 9a e3 de 9c e1 dd f4 e3 9e 9c e1 de 9a e3 5e 9c e1 de 9a e1 ae 7c eb 6d f7 e1 ae f7 e5 ae 37 e7 9e fd e1 de bd e7 9d f7 e7 6e 35 dd dd dd ]<span style="color:#FFF">
    <span style="color:#42a5f5">base64<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">hex[ c7 bc 67 9b b9 f9 ]<span style="color:#FFF">
        <span style="color:#42a5f5">unicode-chardet<span style="color:#FFF"><span style="color:#1976d2">(Windows-1252)<span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#ffeb3b">Ç¼g›¹ù<span style="color:#FFF">
    <span style="color:#78909c">]base64_urlsafe -> same as base64
<span style="color:#FFF">    <span style="color:#42a5f5">unicode-chardet<span style="color:#FFF"><span style="color:#1976d2">(Windows-1251)<span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">б®xлЋ7б®xгЮэл^;з®члn;ЯОњбЮљгЮњбЭфгћњбЮљг^њбЮљб®|лmчб®че®7зћэбЮЅзќчзn5ЭЭЭ<span style="color:#FFF">
        <span style="color:#78909c">]base64 -> (seen before) hex[ c7 bc 67 9b b9 f9 ]
<span style="color:#FFF">        <span style="color:#78909c">]base64_urlsafe -> (seen before) hex[ c7 bc 67 9b b9 f9 ]
<span style="color:#FFF"><span style="color:#78909c">]base64_urlsafe -> same as base64
<span style="color:#FFF"><span style="color:#42a5f5">hex<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">b'JTdCJTIyaGVsbG8lMjIlM0ElMjAlMjJXb3JsZCUyMiU3RA=='<span style="color:#FFF">
    <span style="color:#42a5f5">base64<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">b'%7B%22hello%22%3A%20%22World%22%7D'<span style="color:#FFF">
        <span style="color:#42a5f5">url<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">b'{"hello": "World"}'<span style="color:#FFF">
            <span style="color:#42a5f5">unicode-utf8<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#ffeb3b">{"hello": "World"}<span style="color:#FFF">
            <span style="color:#78909c">]unicode-chardet(ascii) -> same as unicode-utf8
<span style="color:#FFF">        <span style="color:#42a5f5">unicode-utf8<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">%7B%22hello%22%3A%20%22World%22%7D<span style="color:#FFF">
            <span style="color:#78909c">]url -> (seen before) {"hello": "World"}
<span style="color:#FFF">        <span style="color:#78909c">]unicode-chardet(ascii) -> same as unicode-utf8
<span style="color:#FFF">    <span style="color:#78909c">]base64_urlsafe -> same as base64
<span style="color:#FFF">    <span style="color:#42a5f5">unicode-utf8<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">JTdCJTIyaGVsbG8lMjIlM0ElMjAlMjJXb3JsZCUyMiU3RA==<span style="color:#FFF">
        <span style="color:#78909c">]base64 -> (seen before) b'%7B%22hello%22%3A%20%22World%22%7D'
<span style="color:#FFF">        <span style="color:#78909c">]base64_urlsafe -> (seen before) b'%7B%22hello%22%3A%20%22World%22%7D'
<span style="color:#FFF">    <span style="color:#78909c">]unicode-chardet(ascii) -> same as unicode-utf8
<span style="color:#FFF"><span style="color:#42a5f5">unicode-utf8<span style="color:#FFF"><span style="color:#1976d2"><span style="color:#FFF"><span style="color:#4caf50"> -> <span style="color:#FFF"><span style="color:#8bc34a">4a5464434a544979614756736247386c4d6a496c4d30456c4d6a416c4d6a4a5862334a735a4355794d69553352413d3d<span style="color:#FFF">
    <span style="color:#78909c">]base64 -> (seen before) hex[ e1 ae 78 eb 8e 37 e1 ae 78 e3 de fd eb 5e 3b e7 ae f7 eb 6e 3b df ce 9c e1 de 9a e3 de 9c e1 dd f4 e3 9e 9c e1 de 9a e3 5e 9c e1 de 9a e1 ae 7c eb 6d f7 e1 ae f7 e5 ae 37 e7 9e fd e1 de bd e7 9d f7 e7 6e 35 dd dd dd ]
<span style="color:#FFF">    <span style="color:#78909c">]base64_urlsafe -> (seen before) hex[ e1 ae 78 eb 8e 37 e1 ae 78 e3 de fd eb 5e 3b e7 ae f7 eb 6e 3b df ce 9c e1 de 9a e3 de 9c e1 dd f4 e3 9e 9c e1 de 9a e3 5e 9c e1 de 9a e1 ae 7c eb 6d f7 e1 ae f7 e5 ae 37 e7 9e fd e1 de bd e7 9d f7 e7 6e 35 dd dd dd ]
<span style="color:#FFF">    <span style="color:#78909c">]hex -> (seen before) b'JTdCJTIyaGVsbG8lMjIlM0ElMjAlMjJXb3JsZCUyMiU3RA=='
<span style="color:#FFF"><span style="color:#78909c">]unicode-chardet(ascii) -> same as unicode-utf8
<span style="color:#FFF"></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span>
</pre>

As you can see, the program tried various encodings recursively, which lead to two possible solutions.
The first one appears to be a false positive, leading to some garbled text.
The second one definitely looks more promising, applying `hex -> base64 -> url -> utf-8` decoding to obtain some JSON string.

Duplicate paths using different encodings have also been detected and skipped.



### As a Python library

``` python
from multidecoder import multidecode, display_result

results = multidecode(text, max_depth=10)
display_result(results, sys.stdout)
```

## How does it work?

the `multidecode()` function will go through a list of decoders,
attempting the decode the input text with each one in turn.

If the decoder output is equal to the input, or the decoder errors
out, the "branch" is going to be skipped.

Otherwise, a `Result` is yielded for each successful decoding
operation, with the following fields:

- `decoder_id`: internal identifier for the decoder
- `value`: return value from the decoder
- `args`: list of strings, used by decoders to return extra
  information about the decode process. A common example is the
  `chardet` decoder, which will attempt to automatically guess what
  unicode encoding was used to encode some text.
- `is_new_path`: flag indicating whether this result `value` has been
  seen before. Display and search algorithm might want to use this to
  avoid descending the same branch twice unnecessarily, or possibly
  ending in an infinite loop.
- `sub_results`: iterator of `Result`s obtained by recursively decoding
  this result.
