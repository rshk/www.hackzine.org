Shooting timelapse videos on Linux
##################################

:tags: photography, timelapse
:date: 2016-05-27 23:17
:category: Photography

I've been doing some experiments with shooting timelapse videos, and
I'd like to share information that could be useful for others (or
future me looking for it again..).

Far from being a guide, I'm just pasting here the commands I used.

Just as a reference, I'm using a Nikon D3300 and Archlinux, but I
assume tethering is supported for most modern DSLR cameras.


Shooting the actual photos
==========================

I'm currently using the dumbest way of doing this: ask gphoto to shoot
one frame every 5 seconds and download to the local hard-drive::

    gphoto2 --capture-image-and-download -I 5 -F 250 --filename 'cap-%Y%m%d-%H%M%S.jpg' --skip-existing

I like to download photos to local hard drive to avoid the risk of
filling the SD card; as a matter of fact, I don't think it's a problem
when shooting 24MP JPEGs, as the camera battery is going to die before
you can fill a 64Gb SD card, but anyways..

You can shoot more than one frame each 5 seconds, if you want the
video to be slower, but keep in mind you'll have to make sure your
exposure time never gets longer than your frame duration.

In the example, I'm shooting 250 frames, which will take
approximatively 21 minutes to shoot and produce a ten seconds video.

I like to keep names tidy and unique, so I changed the filename to
contain the current date.

The last argument, ``--skip-existing``, was added as it looks like
sometimes gphoto2 tries to write a file with the same name of an old
one, even when timestamps are used..? This will prevent the shooting
process to get stuck.


Creating the video
==================

I use ffmpeg for that, and usually create a FHD (1080p) version for
uploading / sharing, and a 6k version to keep as an archive copy (then
I tend to delete the original images, as they can easily use huge
amounts of storage).

Create the FHD video::

    ffmpeg -f image2 -pattern_type glob -i 'cap-*.jpg' -r 25 -vcodec h264 -vb 4096k -acodec null -s 1920x1280 -pix_fmt yuvj422p video.mp4

for the 6k version (same as my camera resolution)::

    ffmpeg -f image2 -pattern_type glob -i 'cap-*.jpg' -r 25 -vcodec h264 -acodec null -pix_fmt yuvj422p -s 6000x4000 video-6k.mp4

Btw, I'm not sure these are the best possible combinations of codecs
etc., I'm not expert with that, but I found those settings to work
pretty well in creating a nice-looking video for uploading to YouTube.


Warning: shooting the sun
=========================

While shooting a few pics of the sun shouldn't be a problem with a
DSLR camera and quick exposure times (unless you're using the Live
View mode), always keep in mind that you're concentrating a huge
amount of energy on your camera's mirror.

While I couldn't find any definitive answer on whether this could
actually be harmful, keep in mind that when shooting a timelapse
video, you're **repeatedly** exposing your camera mirror to (possibly)
quite a lot of energy, which will build up heat with time.

As a rule of thumb, if looking at the sun harms your eyes, then it
will probably harm your camera too. You should be perfectly fine
shooting timelapse videos of sunset / sunrise (I did a few myself),
but you should probably keep the sun out of your frame when it's high
in the sky.


Camera settings
===============

I've been using mostly aperture mode, maximum aperture (f/3.8 shooting
with 24mm on the Nikkor 18÷55 lens), ISO 400 (sometimes ISO 100, but
keep in mind you're likely going to get exposure times longer than 5
seconds which will result in the video looking accelerated when it's
still dark).

Manual mode would be the ideal in order to avoid getting "aperture
flicker", but especially when shooting the sunries, you'd have to
change your settings quite a lot as the day becomes brighter.

I'm planning to try using the "P" mode with (limited) auto-ISO, but I
suspect it wouldn't be flexible enough anyways (especially as when
shooting timelapse you're interested in avoiding sudden spikes in
exposure change, but the camera is not keeping any "state" between
frames to take that into account).

So the solution would probably be to have the camera settings changed
via software; the simple way would be to just figure out the settings
you want at the beginning of the shooting and at the end, and some
script interpolate them for you; a more advanced system could evaluate
the light from the previous frame, and keep changing settings while
avoiding sudden changes in exposure.

Example output video
====================

.. raw:: html

         <video controls preload="auto" width="683" height="455"
         poster="/images/20160527_timelapse-video.jpg"
         src="/images/20160527_timelapse-video.mp4"></video>
