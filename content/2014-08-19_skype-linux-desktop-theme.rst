Make Skype use desktop theme on 64bit Linux
###########################################

:tags: linux, debian, skype
:date: 2014-08-19 16:10
:category: Sysadmin

To make Skype use the same theme as other desktop applications (in my
case, the same theme I'm using for Gtk apps), you'll need to install
the 32bit version of the gtk theme engine you're using.

On debian jessie, I simply did::

    apt-get install gtk2-engines:i386

Also make sure you have ``ia32-libs`` installed, but should already be
in order to make Skype work..
