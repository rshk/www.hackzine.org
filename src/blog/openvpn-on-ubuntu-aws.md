---
date: "2023-03-15 19:45:50"
---

# OpenVPN server on Ubuntu

Ubuntu version: 22.04 LTS
OpenVPN version: 2.5.5

We're going to be using AWS for deploying our server, but any other
provider will do. We'll be using Ubuntu 22.04 LTS; things might vary if
using different versions.

## Create EC2 instance and connect to it

* Go to EC2 console
* "Launch an instance"
  * Name: VPN server
  * Application and OS Images: Ubuntu 22.04 LTS 64-bit (ami-06d94a781b544c133)
  * Instance type: ``t3.micro`` should be enough
  * Pick a key pair or create one; download ``MyKey.pem`` to a secure location
  * Create a new security group. We need:
    * A port for SSH (default: 22)
    * A port for OpenVPN (default: 1194)
    * (optional) an HTTP port so we can distribute certificates?
  * Add a 16GB gp2 volume
  * Launch instance

### Connect to the instance

Use a command like:

``` text
ssh ubuntu@ec2-xx-xx-xx-xx.eu-west-1.compute.amazonaws.com -i MyKey.pem
```

Or configure ssh for convenience, in ``.ssh/config``:

``` text
Host vpn-server
     HostName ec2-xx-xx-xx-xx.eu-west-1.compute.amazonaws.com
     IdentityFile "~/path/to/MyKey.pem"
     Port 22
     User ubuntu
```

### Install updates

``` text
sudo apt update
sudo apt dist-upgrade
```

There might be kernel upgrades, so reboot afterwards:

``` text
sudo reboot
```

## Install OpenVPN

Official guide: https://ubuntu.com/server/docs/service-openvpn

For convenience, we're going to run all the following commands on the
server as the root user:

``` text
sudo su -
```

Install OpenVPN and Easy-RSA:

``` text
apt install openvpn easy-rsa
```

Create a new Certificate Authority (CA) to sign all the certificates:

``` text
make-cadir /etc/openvpn/easy-rsa
cd /etc/openvpn/easy-rsa/
./easyrsa init-pki
./easyrsa build-ca
```

### Create server keys and cerificates

``` text
./easyrsa gen-dh
./easyrsa gen-req myservername nopass
./easyrsa sign-req server myservername
openvpn --genkey secret ta.key
```

Copy certificates to the openvpn configuration folder:

``` text
cp pki/dh.pem pki/ca.crt \
    pki/issued/myservername.crt \
    pki/private/myservername.key \
    /etc/openvpn/server/
```

### Server configuration

In ``/etc/openvpn/myserver.conf``:

``` text
port 1194
proto udp
dev tun
ca server/ca.crt
cert server/myservername.crt
key server/myservername.key  # This file should be kept secret
dh server/dh.pem
server 10.8.0.0 255.255.255.0
ifconfig-pool-persist /var/log/openvpn/ipp.txt
keepalive 10 120
tls-auth ta.key 0 # This file is secret
cipher AES-256-GCM
persist-key
persist-tun
status /var/log/openvpn/openvpn-status.log
verb 3
explicit-exit-notify 1
topology subnet
client-to-client
```

#### Enable IPv4 forwarding on the server

In ``/etc/sysctl.conf``, make sure this line is uncommented:

``` text
net.ipv4.ip_forward=1
```

Then reload sysctl:

``` text
sudo sysctl -p /etc/sysctl.conf
```

#### Start the openvpn server

``` text
sudo systemctl start openvpn@myserver
```


#### Monitor server logs

``` text
sudo journalctl -u openvpn@myserver -xe
```


### Client certificates

``` text
./easyrsa gen-req myclient1 nopass
./easyrsa sign-req client myclient1
cp pki/issued/myclient1.crt pki/issued/myclient1.key
```

Copy the following to the client: ``pki/ca.crt`` and ``pki/issued/myclient1.crt``


### Client configuration

``` text
sudo apt install openvpn
```

In ``/etc/openvpn/client.conf``:

``` text
ca ca.crt
cert myclient1.crt
key myclient1.key
tls-auth ta.key 1
client
remote vpnserver.example.com 1194

client
remote 'vpnserver.example.com' 1194
# port 1194
ca 'ca.crt'
cert 'client.crt'
key 'client.key'
dev tun
proto udp
tls-auth 'ta.key' 1
nobind
auth-nocache
script-security 2
persist-key
persist-tun
user nm-openvpn
group nm-openvpn
cipher AES-256-GCM
```

Start:

``` text
sudo systemctl start openvpn@client
```

#### NetworkManager

NetworkManager can import openvpn client configurations.

For ease of use, these two scripts can be used to automate the
configuration process on the client.

File: ``make-bundle.sh``:

``` bash
#!/bin/bash

EASY_RSA_DIR=/etc/openvpn/easy-rsa

HERE="$(dirname "$BASH_SOURCE")"
cd "$HERE"

NAME="$1"

if [ -z "$1" ]; then
    echo "Usage: $0 <name>"
    exit 1
fi


BUNDLEDIR=bundles/"$NAME"
mkdir -p "$BUNDLEDIR" "$BUNDLEDIR"/data
cp -t "$BUNDLEDIR" install.sh
chmod +x "$BUNDLEDIR"/install.sh
cp "${EASY_RSA_DIR}"/pki/ca.crt "$BUNDLEDIR"/data/ca.crt
cp "${EASY_RSA_DIR}"/ta.key "$BUNDLEDIR"/data/ta.key
cp "${EASY_RSA_DIR}"/pki/issued/"$NAME".crt "$BUNDLEDIR"/data/client.crt
cp "${EASY_RSA_DIR}"/pki/private/"$NAME".key "$BUNDLEDIR"/data/client.key
DESTFILE="bundles/${NAME}.tar.gz"
tar -C bundles -czvf "${DESTFILE}" "${NAME}"
echo "Bundle created: ${DESTFILE}"

```

File: ``install.sh``:

``` bash
#!/bin/bash

REMOTE_ADDR=vpnserver.example.com
REMOTE_PORT=1194

CONNECTION_NAME=nm-vpn

HERE="$(dirname "$BASH_SOURCE")"
cd "$HERE"

DATADIR="${HERE}/data"
INSTALLDIR="${HOME}/.vpn"

mkdir -p "${INSTALLDIR}"
cp -t "${INSTALLDIR}" \
   "${DATADIR}/ca.crt" \
   "${DATADIR}/ta.key" \
   "${DATADIR}/client.crt" \
   "${DATADIR}/client.key"

cat > "${INSTALLDIR}/${CONNECTION_NAME}.conf" <<EOF
client
remote '${REMOTE_ADDR}'
ca '${INSTALLDIR}/ca.crt'
cert '${INSTALLDIR}/client.crt'
key '${INSTALLDIR}/client.key'
dev tun
proto udp
port ${REMOTE_PORT}
tls-auth '${INSTALLDIR}/ta.key' 1
nobind
auth-nocache
script-security 2
persist-key
persist-tun
user nm-openvpn
group nm-openvpn
cipher AES-256-GCM
EOF

echo "Importing NetworkManager configuration..."
nmcli connection import type openvpn file "${INSTALLDIR}/${CONNECTION_NAME}.conf"

# Do not use as the default gateway
nmcli connection modify id "${CONNECTION_NAME}" ipv4.never-default true
nmcli connection modify id "${CONNECTION_NAME}" ipv6.never-default true

cat <<EOF
Start the VPN connection from the Network settings or using:

    nmcli connection up ${CONNECTION_NAME}
EOF

```

On the server, use this command to generate a ``.tar.gz`` archive
containing everything needed to connect the client:

``` text
./make-bundle.sh myclient1
```

Copy the archive to the client, untar, and run ``./install.sh``. Then
start the connection from the Network settings, or using ``nmcli``.
