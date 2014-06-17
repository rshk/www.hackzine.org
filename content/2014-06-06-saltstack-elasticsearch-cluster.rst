Deploying an Elasticsearch cluster via SaltStack
################################################

:tags: sysadmin, debian, linux, elasticsearch, saltstack
:date: 2014-06-06 16:12:00
:category: Sysadmin

Here is a short guide covering the steps I followed in order to deploy
an ElasticSearch_ cluster using SaltStack_ to manage configuration.

.. _ElasticSearch: http://elasticsearch.org/
.. _SaltStack: http://saltstack.com/


Prerequisites
=============

For the purposes of testing, I will be using a bunch of
locally-installed virtualmachines. Specifically, we'll have:

- A machine running salt master
- Three elasticsearch nodes


Creating the VMs
----------------

To create the machines, I just installed a bare-bones wheezy image
(under KVM) and cloned it four times::

    virt-clone -o TemplateWheezy -n es-cluster-salt-master -f /mnt/virtualmachines/es-cluster-salt-master.img -m '52:54:00:ee:55:f0'
    for id in 01 02 03; do
        virt-clone -o TemplateWheezy -n es-cluster-node-"$id" -f /mnt/virtualmachines/es-cluster-node-"$id".img -m '52:54:00:ee:55:'"$id"
    done

To properly setup the network, I then added static enties for all the
machines in the cluster::

    virsh net-edit default

.. code-block:: xml

    <host mac='52:54:00:ee:55:f0' name='salt-master.es-cluster.local' ip='10.55.2.230'/>
    <host mac='52:54:00:ee:55:01' name='node-01.es-cluster.local' ip='10.55.2.231'/>
    <host mac='52:54:00:ee:55:02' name='node-02.es-cluster.local' ip='10.55.2.232'/>
    <host mac='52:54:00:ee:55:03' name='node-03.es-cluster.local' ip='10.55.2.233'/>

Now we can start the VMs::

    virsh start es-cluster-salt-master
    for id in 01 02 03; do
        virsh start es-cluster-node-"$id"
    done

You can make sure machines are responding::

    ping -c1 10.55.2.230
    ping -c1 10.55.2.231
    ping -c1 10.55.2.232
    ping -c1 10.55.2.233


**Troubleshooting:** if the dhcp seems to be misbehaving, make sure
 you remove all the cached DNS leases::

    virsh net-destroy default
    rm /var/lib/libvirt/dnsmasq/default.*
    virsh net-start default

If you haven't done it yet in the template, it is a good moment for
installing openssh on the VMs. Otherwise, you might want to replace the
openssh certificates to have different ones on each machine.



Preparing the machines
----------------------

First of all, configure the FQDNs of machines::

    hostname salt-master  # or node-XX, ...
    hostname > /etc/hostname
    sed 's/^127\.0\.1\.1\s.*/127.0.1.1\t'"$(hostname)"'.es-cluster.local '"$(hostname)"'/' -i /etc/hosts

To check::

    $ hostname -f
    node-01.es-cluster.local



Installing saltstack
====================

I just followed the official installation guide for Debian:
http://docs.saltstack.com/en/latest/topics/installation/debian.html

::

    echo 'deb http://debian.saltstack.com/debian wheezy-saltstack main' > /etc/apt/sources.list.d/saltstack.list
    wget -q -O- "http://debian.saltstack.com/debian-salt-team-joehealy.gpg.key" | apt-key add -
    apt-get update

On the master::

    apt-get install salt-master

On the minions::

    # If your don't have a DNS
    echo '10.55.2.230 salt' >> /etc/hosts

    apt-get install salt-minion

    hostname -f > /etc/salt/minion_id


Configure minions to reach the master
-------------------------------------

If you want to use a DNS name different from the default ``salt``, change
``/etc/salt/minion``::

.. code-block:: yaml

    master: salt-master.es-cluster.local

(I usually set a CNAME on the internal DNS to make the name ``salt``
point to the correct machine, and leave the default value in minions
configuration).


Register the minion keys on the master
--------------------------------------

::

    root@salt-master:~# salt-key -L
    Accepted Keys:
    Unaccepted Keys:
    node-01.es-cluster.local
    node-02.es-cluster.local
    node-03.es-cluster.local
    Rejected Keys:

    root@salt-master:~# salt-key -A
    The following keys are going to be accepted:
    Unaccepted Keys:
    node-01.es-cluster.local
    node-02.es-cluster.local
    node-03.es-cluster.local
    Proceed? [n/Y] y
    Key for minion node-01.es-cluster.local accepted.
    Key for minion node-02.es-cluster.local accepted.
    Key for minion node-03.es-cluster.local accepted.


Finish setting up the machines
------------------------------

First, check that minions are responding, by issuing::

    salt '*' test.ping

You can also use this to check minions status::

    salt-run manage.status


Configure grains on cluster nodes
=================================

We add some extra grains on the cluster machines in order to:

- keep track of the configuration we want on each machine
- store some configuration, such as which cluster the machine belongs to

In real life, we might want to configure other things, for example to
identify the physical location of the server; then the cluster names
will be decidede in the SLS files depending on those values.

Add this to minion configuration files:

.. code-block:: yaml

    grains:
      roles:
        - elasticsearch
      elasticsearch:
        cluster: es-cluster-local-01


Writing states
==============

Now it's time to prepare the state (SLS) files that will be used to
manage the cluster.

Preparing
---------

On the salt master::

    mkdir /srv/salt
    cd /srv/salt


Creating the "top" file
-----------------------

``/srv/salt/top.sls``

.. code-block:: yaml

    base:
      '*':
        - common_packages
      'roles:elasticsearch':
        - match: grain
        - elasticsearch


``common_packages.sls``
-----------------------

This is used mostly to configure common stuff we want on each machine,
for example editor, configuration files, etc. This is mine::

.. code-block:: yaml

    emacs23-nox:
      pkg.installed

    htop:
      pkg.installed

    etckeeper:
      pkg.installed

    git:
      pkg.installed

    git://github.com/rshk/CommonScripts:
      git.latest:
        - rev: master
        - target: /opt/CommonScripts

    /root/.bashrc:
      file:
        - managed
        - source: salt://conf/bashrc

And, of course, the bashrc file, in ``/srv/salt/conf/bashrc``:

.. code-block:: bash

    # Standard ~/.bashrc
    # Generated via Salt

    export EDITOR='emacs'
    alias e=emacs


    if [ -e /opt/CommonScripts/Configs/bash/bash_aliases ]; then
        . /opt/CommonScripts/Configs/bash/bash_aliases
    fi

    if [ -e /opt/CommonScripts/Configs/bash/gen-ps1.py ]; then
       eval $( python /opt/CommonScripts/Configs/bash/gen-ps1.py )
    fi

    if [ -e ~/.bashrc_local ]; then
        . ~/.bashrc_local
    fi

The elasticsearch configuration
-------------------------------

The most important part is the ``/srv/salt/elasticsearch/init.sls`` file:

.. code-block:: yaml

    /etc/apt/sources.list.d/elasticsearch.list:
      file:
        - managed
        - source: salt://elasticsearch/debian.list

    /etc/elasticsearch/elasticsearch.yml:
      file:
        - managed
        - user: root
        - group: root
        - mode: 644
        - template: jinja
        - source: salt://elasticsearch/elasticsearch.yml

    openjdk-7-jre-headless:
      pkg:
        - installed

    elasticsearch:
      pkg:
        - installed
        - require:
          - file: /etc/apt/sources.list.d/elasticsearch.list
      service:
        - running
        - enable: True
        - require:
          - pkg: elasticsearch
          - pkg: openjdk-7-jre-headless
          - file: /etc/elasticsearch/elasticsearch.yml

Then, we have ``debian.list``, containing the repositories for debian wheezy::

    # Debian repository for elasticsearch
    deb http://packages.elasticsearch.org/elasticsearch/1.0/debian stable main

Last but not least, ``elasticsearch/elasticsearch.yml``""

.. code-block:: jinja

    # Elasticsearch configuration for {{ grains['fqdn'] }}
    # Cluster: {{ grains['elasticsearch']['cluster'] }}

    cluster.name: {{ grains['elasticsearch']['cluster'] }}
    node.name: "{{ grains['fqdn'] }}"
