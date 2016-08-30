#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

import os

AUTHOR = u"Samuele Santi"
SITENAME = u"Hackzine.org"
SITEURL = os.environ.get('PELICAN_SITEURL') or 'https://www.hackzine.org'

DEFAULT_CATEGORY = u'Misc'
# DEFAULT_DATE_FORMAT = '%a %d %B %Y'

DEFAULT_LANG = u'en'

TIMEZONE = 'Europe/Rome'

# Blogroll
LINKS = (('Pelican', 'http://getpelican.com/'),
         ('Python.org', 'http://python.org/'),
         ('Jinja2', 'http://jinja.pocoo.org/'),
         ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (
    ('Blog', 'http://www.hackzine.org'),
    ('Website', 'http://www.samuelesanti.com'),
    ('GitHub', 'https://github.com/rshk'),
    ('LinkedIn', 'https://www.linkedin.com/in/samuelesanti'),
    ('Twitter', 'https://twitter.com/hackzine'),
    ('StackOverflow', 'http://stackoverflow.com/users/148845/redshadow'),
)

DEFAULT_PAGINATION = 10

# THEME = 'hackzine-org'
THEME = os.path.join(os.path.dirname(__file__), 'themes/hackzine-org/')

DISQUS_SITENAME = 'hackzineorg'
TWITTER_USERNAME = '_rshk'

# Feed settings
FEED_DOMAIN = SITEURL
FEED_ATOM = 'feeds/atom.xml'
FEED_RSS = 'feeds/rss.xml'
CATEGORY_FEED_ATOM = 'feeds/%s.atom.xml'
CATEGORY_FEED_RSS = 'feeds/%s.rss.xml'

STATIC_PATHS = ['images']

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True
