Importing Apache logs in ElasticSearch
######################################

:tags: sysadmin, elasticsearch, logstash, kibana, apache, logs
:date: 2014-05-06 17:43:00
:category: Sysadmin

I needed some way to visualize and analyze logs from webservers.

So, I decided to use the "elasticsearch stack" for that:

- `LogStash <http://logstash.net/>`_
- `ElasticSearch <http://elasticsearch.org/>`_
- `Kibana <http://www.elasticsearch.org/overview/kibana/>`_


Setting up ElasticSearch
========================

Just download, untar and launch::

    wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.1.1.tar.gz
    tar xzvf elasticsearch-1.1.1.tar.gz
    cd elasticsearch-1.1.1
    ./bin/elasticsearch

Check if everything is ok::

    http localhost:9200


Importing logs to ElasticSearch
===============================

I used LogStash to import the logs from file to ElasticSearch.
That required a bit of configuration.

First, download & unpack logstash::

    wget https://download.elasticsearch.org/logstash/logstash/logstash-1.4.0.tar.gz
    tar xzvf logstash-1.4.0.tar.gz

Then, create a configuration file like this::

    input {
          stdin {
              type => "apache"
          }
    }

    filter {
        grok {
            match=> { message => "%{COMBINEDAPACHELOG}" }
        }
        date {
            locale => "en"
            match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
            timezone => "Europe/Rome"
        }
    }


    output {
        elasticsearch {
            cluster => "elasticsearch.local"
            host => "127.0.0.1"
            protocol => http
            index => "my-logs"
            index_type => "apache"
        }
    }

And run logstash to import the file(s)::

    ./logstash-1.4.0/bin/logstash --config ./logstash.conf < apache.access.log


Using kibana to visualize logs
==============================

Download kibana::

    wget https://download.elasticsearch.org/kibana/kibana/kibana-3.0.1.tar.gz
    tar xzvf kibana-3.0.1.tar.gz

Then, you'll need to install on a webserver under the same domain of your
elasticsearch instance (localhost in this case).

I used lighttpd for that, with a configuration file like this::

    server.modules = (
	"mod_access",
	"mod_alias",
	"mod_redirect",
    )

    server.document-root        = "/path/to/kibana-3.0.1"
    server.upload-dirs          = ( "/tmp/" )

    server.errorlog             = "/dev/stderr"

    server.pid-file             = "/tmp/kibana-lighttpd.pid"
    server.port                 = 9999

    index-file.names            = ( "index.html" )
    url.access-deny             = ( "~", ".inc" )
    static-file.exclude-extensions = ( ".php", ".pl", ".fcgi" )

    ## Directory listing
    dir-listing.encoding = "utf-8"
    server.dir-listing   = "enable"

    ## Access log
    server.modules += ( "mod_accesslog" )
    accesslog.filename = "/dev/stderr"

    mimetype.assign             = (
      ".gz"           =>      "application/x-gzip",
      ".tar.gz"       =>      "application/x-tgz",
      ".tgz"          =>      "application/x-tgz",
      ".tar"          =>      "application/x-tar",
      ".zip"          =>      "application/zip",
      ".gif"          =>      "image/gif",
      ".jpg"          =>      "image/jpeg",
      ".jpeg"         =>      "image/jpeg",
      ".png"          =>      "image/png",
      ".xbm"          =>      "image/x-xbitmap",
      ".xpm"          =>      "image/x-xpixmap",
      ".xwd"          =>      "image/x-xwindowdump",
      ".css"          =>      "text/css",
      ".html"         =>      "text/html",
      ".htm"          =>      "text/html",
      ".js"           =>      "text/javascript",
      ".conf"         =>      "text/plain",
      ".text"         =>      "text/plain",
      ".txt"          =>      "text/plain",
      ".spec"         =>      "text/plain",
      ".dtd"          =>      "text/xml",
      ".xml"          =>      "text/xml",
      ".bz2"          =>      "application/x-bzip",
      ".tbz"          =>      "application/x-bzip-compressed-tar",
      ".tar.bz2"      =>      "application/x-bzip-compressed-tar",
      ""              =>      "application/octet-stream",
    )

Then just run it (as a normal user)::

    /usr/sbin/lighthttpd -f lighttpd.conf -D


Ok, now we're ready: kibana should be visible on http://localhost:9999


Using kibana to analyze the logs
================================

Tweak a couple settings, add some nice charts and.. here it is!

.. image:: ./static/images/kibana-apache.png
    :width: 680px
    :align: center

Find here the json configuration I used for that dashboard:
https://gist.github.com/rshk/23ff4b0c162ba4b8a326
