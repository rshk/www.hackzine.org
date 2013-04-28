#!/usr/bin/env python
# -*- coding: utf-8 -*- #

import os

AUTHOR = u"Samuele Santi"
SITENAME = u"Hackzine.org"
#SITEURL = 'http://www.hackzine.org'
# todo: set this from the environment?
SITEURL = os.environ.get('PELICAN_SITEURL') or ''


TIMEZONE = 'Europe/Rome'

DEFAULT_LANG = 'en'

# Blogroll
LINKS =  (('Pelican', 'http://docs.notmyidea.org/alexis/pelican/'),
          ('Python.org', 'http://python.org'),
          ('Jinja2', 'http://jinja.pocoo.org'),
          )

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = 10

#THEME = 'hackzine-org'
THEME = os.path.join(os.path.dirname(__file__), 'themes/hackzine-org/')

DISQUS_SITENAME='hackzineorg'
TWITTER_USERNAME = 'hackzine'

FEED_DOMAIN = SITEURL or 'http://www.hackzine.org'
FEED_ATOM = 'feeds/atom.xml'
FEED_RSS = 'feeds/rss.xml'
