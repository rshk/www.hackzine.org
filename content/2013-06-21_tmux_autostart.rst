Auto-starting tmux with panes & services
########################################

:tags: development, linux, tmux
:date: 2013-06-21 18:32
:category: Development


I'm working on a `django`_-based project that uses celery_ workers in order to run
some heavy tasks. Plus, the UI is built using brunch_.

.. _django: http://djangoproject.com/
.. _celery: http://www.celeryproject.org/
.. _brunch: http://brunch.io/

So, each time I want to start all the needed services, I have to:

* Open a bunch of terminals (usually in a tmux session)
* Enable virtualenv in each terminal
* Start the django development server
* Start a celery worker
* Start the brunch file-watcher service
* Maybe open a htop too, just to monitor the resources usage

Of course, I'm not going to do that by hand each time. Instead, I wrote
a tmux configuration script to do everything by itself, while I sit back 
and relax :).

This is what I came up with:

.. code-block:: bash

    #!/usr/bin/tmux source-file

    new-session -d
    split-window -d -t 0 -v
    split-window -d -t 0 -h
    split-window -d -t 0 -v
    split-window -d -t 2 -v
    
    send-keys -t 0 'workon my_virtualenv' enter C-l
    send-keys -t 0 'DJANGO_SETTINGS_MODULE=MyProject.settings.production manage.py runserver' enter
    
    send-keys -t 1 'htop' enter C-l
    
    send-keys -t 2 'workon my_virtualenv' enter C-l
    send-keys -t 2 'DJANGO_SETTINGS_MODULE=MyProject.settings.production manage.py celery worker --loglevel=info' enter
    
    send-keys -t 3 'workon my_virtualenv' enter C-l
    send-keys -t 3 'cd MyProject/webui/' enter
    send-keys -t 3 'brunch watch' enter
    
    ## Just a convenience shell
    send-keys -t 4 'workon my_virtualenv' enter C-l
    select-pane -t 4
    
    attach

This will open a tmux session with this layout::

  +--------------------+--------------------+
  | 0: django server   | 3: brunch watch    |
  +--------------------+--------------------+
  | 2: celery worker   | 1: htop            |
  +--------------------+--------------------+
  | 4: Shell for stuff                      |
  |                                         |
  +-----------------------------------------+

I have no idea on why the panes get numbered that way, but it's ok,
once you know the order..

Btw, you can use ``C-b q`` in a running tmux to find out which the 
pane numbers are.

