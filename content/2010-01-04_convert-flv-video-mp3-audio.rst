Convert FLV video to MP3 audio
##############################

:tags: Linux, Multimedia, Utility
:date: 2010-01-04 14:49:00

Many times we download a song we like from YouTube, or other sites, as a
FLV video. But how to convert it to a regulare audio-only MP3 file?
Here is a nice solution I found on the net, using FFMPEG.

The syntax of the command is::

    ffmpeg [[infile options][-i infile]]... {[outfile options] outfile}

So, to convert a flv video to mp3, we could use something like::

    $ ffmpeg -i filename.flv -acodec mp3 -ac 2 -ab 128 -vn -y filename.mp3

Explanation of options
----------------------

``-i filename``
    Specifies the input file name

``-ac 2``
    Specifies the number of audio channels to use

``-ab 128``
    Specifies the audio bitrate (in k). For youtube videos, 64 is enough.

``-vn``
    Disables video recording.

``-y``
    Overwrites output file.

``-f fmt``
    Force format.

``-metadata key=value``
    Set a metadata key/value pair.

To see informations on the input file, before converting it::

    $ ffmpeg -i filename.flv

To see all available codecs/filters::

    $ ffmpeg -filters

Bibliography/Links
------------------

`Extracting an MP3 From a YouTube Flash (FLV) Download <http://symbolik.wordpress.com/2007/10/10/extracting-an-mp3-from-a-youtube-flash-flv-download/>`_
    A nice post I found on the youtube-to-mp3 topic I've found

`Vixy.net <http://vixy.net/>`_
    An online FLV-to-* converter, that should enable direct-download from youtube videos.
