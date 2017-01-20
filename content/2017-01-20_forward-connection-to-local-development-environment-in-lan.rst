Forward connection to local development environment in LAN
##########################################################

:date: 2017-01-20 16:23:06
:category: Development
:tags: development,sysadmin,linux,macosx,socat


I needed a quick way to test a few things on a webapp running locally
(on my Linux box) from another machine running Mac OSX.

Quick and easy way (although insecure, make sure you only do this on a
private LAN) was to use socat.

Install on Archlinux (server)::

    sudo pacman -S socat

Install on the MacOSX client via homebrew::

    brew install socat

Proxy local connection to the LAN (on the server; assuming the webapp
runs locally on port 5000)::

    socat tcp-listen:8000,fork tcp:localhost:5000

Proxy remote connection to localhost (so we can access it with the
benefits of "local" apps in a browser; otherwise, we would have to
have the app served via HTTPS to, eg. use location services)::

    socat tcp-listen:5000,fork,bind=127.0.0.1 tcp:192.168.x.x:8000

..where, of course, ``192.168.x.x`` is the IP of the server machine.

Now, you can just visit http://localhost:5000 from the client.
