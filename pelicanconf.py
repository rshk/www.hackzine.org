#!/usr/bin/env python
# -*- coding: utf-8 -*- #

import os

AUTHOR = u"Samuele Santi"
DEFAULT_CATEGORY = 'Misc'
#DEFAULT_DATE_FORMAT = '%a %d %B %Y'
SITENAME = u"Hackzine.org"
SITEURL = os.environ.get('PELICAN_SITEURL') or 'http://www.hackzine.org'


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

## Feed settings
FEED_DOMAIN = SITEURL
FEED_ATOM = 'feeds/atom.xml'
FEED_RSS = 'feeds/rss.xml'
CATEGORY_FEED_ATOM = 'feeds/%s.atom.xml'
CATEGORY_FEED_RSS = 'feeds/%s.rss.xml'

STATIC_PATHS = ['images']
