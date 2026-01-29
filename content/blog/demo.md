---
title: "DEMO"
description:
date: 2080-01-01
tags: demo
draft: true
---

:::success
This is a success message
:::

:::warning
This is a warning message
:::

:::danger
This is a danger message
:::

:::info
This is an info message
:::

:::note
This is a note message
:::

``` python
import os

def some_function(foo: str, bar: tuple[FooBar, int]) -> BarFoo:
    """Some docstring"""

    a_list = [1, 2, 3, "42"]

    if something > 100:
        # A comment
        do_something()

    return None
```


``` python
foo = "a very long line"  # This is a very long line so we can test scrollbars and make sure they look nice
```

``` text
This is some plain text
```

Some HTTP response:

``` http
HTTP/1.1 200 OK
Date: Thu, 29 Jan 2026 11:54:45 GMT
Content-Type: text/html
Transfer-Encoding: chunked
Connection: keep-alive
CF-RAY: 9c588964b854fc3e-FCO
Last-Modified: Tue, 27 Jan 2026 13:22:54 GMT
Allow: GET, HEAD
Accept-Ranges: bytes
Age: 2260
cf-cache-status: HIT
Server: cloudflare

<!doctype html><html lang="en"><head><title>Example Domain</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#eee;width:60vw;margin:15vh auto;font-family:system-ui,sans-serif}h1{font-size:1.5em}div{opacity:0.8}a:link,a:visited{color:#348}</style><body><div><h1>Example Domain</h1><p>This domain is for use in documentation examples without needing permission. Avoid use in operations.<p><a href="https://iana.org/domains/example">Learn more</a></div></body></html>
```

Returning JSON:

``` http
% curl -i http://httpbin.org/get
HTTP/1.1 200 OK
Date: Thu, 29 Jan 2026 11:55:38 GMT
Content-Type: application/json
Content-Length: 252
Connection: keep-alive
Server: gunicorn/19.9.0
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true

{
  "args": {},
  "headers": {
    "Accept": "*/*",
    "Host": "httpbin.org",
    "User-Agent": "curl/8.5.0",
    "X-Amzn-Trace-Id": "Root=1-697b4ab9-5bda3970781bf1cb261dd201"
  },
  "origin": "93.56.160.49",
  "url": "http://httpbin.org/get"
}
```
