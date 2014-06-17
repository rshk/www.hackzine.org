Prevent Spotify from "freezing" on Linux with Awesome wm
########################################################

:tags: linux, spotify, awesome
:date: 2014-06-01 01:01:00
:category: Misc

I recently upgraded Spotify on Linux to version 0.9.10.

A part from the nice improvements (it's cool to have a browse tab, at
last), there are also some issues.

Specifically, it looks like the song change notification doesn't work
well with Awesome WM, causing most parts of X to partially freeze for
about 15 seconds (Awesome is completely unresponsive, only a few
applications keep accepting keystrokes, mouse clicks are simply
ignored).

This is really annoying, especially since there is apparently no way
to disable it from the settings UI.


Luckily enough, I was able to find a solution by digging online a bit.
Apparently, there is an (undocumented?) configuration option that
solves the issue.

It can be used from the command line::

    spotify --ui.track_notifications_enabled=false

Or set in the configuration file
``~/.config/spotify/Users/<spotifylogin>-user/prefs``::

    ui.track_notifications_enabled=false

Note that, for some reason, setting this in
``~/.config/spotify/prefs`` is not enough and looks like it gets
ignored.
