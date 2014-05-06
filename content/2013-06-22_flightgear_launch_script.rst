FlightGear launch scripts
#########################

:tags: flightgear, games, aviation
:date: 2013-06-22 20:11
:category: Misc


I usually run my FlightGear_ with quite a lot of command-line options, and thus
having to type 'em all each time is not an option.

I've been using fgo_ for a while, but keeping (un)commenting lines all the time
is not ideal either.

.. _FlightGear: http://www.flightgear.org/
.. _fgo: http://wiki.flightgear.org/FGo!

I could create a bunch of "launcher" scripts, but they would end up being
unreadable quickly, unless I figured out a way to create them a smarter way.

This is what I came up with (by the way, I compiled FlightGear 2.10 by hand
and installed in a non-standard location, that's why you need to set
the ``LD_LIBRARY_PATH`` manually..):

.. code-block:: bash

    #!/bin/bash

    #INSTALLDIR="$( dirname "$( readlink -f "$BASH_SOURCE" )" )"/../
    INSTALLDIR=/opt/FlightGear
    FGFS="${INSTALLDIR}/bin/fgfs"

    export LD_LIBRARY_PATH="${INSTALLDIR}/lib"

    cat "$1" | sed '/^\(#.*\)\?$/d' | xargs -d '\n' \
        "$FGFS" --fg-root="$INSTALLDIR"/fgdata/

Then, I'm writing my launch scripts like this:

.. code-block:: bash

    #!/opt/FlightGear/bin/fglaunch.sh

    ## Aircraft and location
    --aircraft=c172p
    --airport=KHAF

    ## Paths
    --fg-root=/opt/FlightGear/fgdata
    --fg-scenery=/opt/FlightGear/fgdata/Scenery:/opt/FlightGear/fgdata/SceneryTerraSync

    ## Atlas
    --atlas=socket,out,5,localhost,5501,udp

    ## Fetch weather information from the web.
    ## todo: we might want to manually tweak for landing training..
    --enable-real-weather-fetch

    ## Specify FlightGear's window geometry.
    --geometry=1024x768

    ## Enable fullscreen mode.
    #--enable-fullscreen

    ## TerraSync
    --atlas=socket,out,1,localhost,5500,udp

    ## To practice landing
    --in-air
    --offset-distance=5  # Near!
    --altitude=2000      # High!
    --vc=120             # Fast!
    --timeofday=noon

    ## Engine on!
    --prop:/engines/engine/running=true
    --prop:/engines/engine/rpm=1000

    ## Lights on!
    --prop:/controls/lighting/landing-lights=false
    --prop:/controls/lighting/taxi-light=false
    --prop:/controls/lighting/logo-lights=true
    --prop:/controls/lighting/nav-lights=true
    --prop:/controls/lighting/beacon=true
    --prop:/controls/lighting/strobe=true

    ## Just in case..
    --props=5802
