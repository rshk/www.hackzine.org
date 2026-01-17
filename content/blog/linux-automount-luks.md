---
title: "Linux: automount LUKS device"
description:
date: 2026-01-17T12:52:16
tags: linux
---

This guide was written specifically on Ubuntu, but it should work
similarly on most modern Linux distributions.

Let's assume we have an existing device, formatted using LUKS and
containing an ext4 filesystem. We want to automount it at boot, at a
specific mount point location.


## Find the name and uuid of the LUKS device

List all the LUKS devices in the system:

``` shell
% lsblk --fs --json | jq '.blockdevices | .. | select(type == "object" and .fstype == "crypto_LUKS") | [.name,.fstype,.uuid] | @tsv' -r
sdx crypto_LUKS da2b593e-8c74-445e-aef6-f0b7f656d8c3
```

You can also use the "Disks" application, if you prefer using a GUI.


## Enable key-based encryption

We need a way to unlock the device without typing in a passphrase.
The solution is to use an encryption key stored in a file:

``` shell
sudo mkdir /etc/luks-keys/
sudo chmod 700 /etc/luks-keys
sudo openssl genrsa -out /etc/luks-keys/default 2048
```

::: warning
The file can be stored anywhere, but make sure it is only readable by root.
:::

Add the key to the LUKS device:

``` shell
sudo cryptsetup luksAddKey /dev/disk/by-uuid/da2b593e-8c74-445e-aef6-f0b7f656d8c3 /etc/luks-keys/default
```

## Add an entry to `/etc/crypttab`

This allows the device to be unlocked automatically

``` shell
echo "mydata UUID=da2b593e-8c74-445e-aef6-f0b7f656d8c3 /etc/luks-keys/default luks" | sudo tee -a /etc/crypttab
```

## Open the newly added device

``` shell
sudo cryptdisks_start mydata
```

## Create a mount point

``` shell
sudo mkdir /mnt/mydata
```

## Add an entry to `/etc/fstab`

```
echo /dev/mapper/mydata /mnt/mydata auto defaults 0 0 | sudo tee -a /etc/fstab
```

::: note
**Note:** This assumes that the LUKS device contains one filesystem. \
For LVM or more complex partitioning schemes, you might need to tweak things a bit.
:::

## Reload systemd

This will update systemd's internal fstab definition:

``` shell
systemctl daemon-reload
```

## Mount the filesystem

``` shell
mount /mnt/mydata
```
