---
title: "Resize the Kali Linux root filesystem"
description:
date: 2026-01-30T23:40:00
tags: linux,debian,kali
---

I recently ran out of space (after installing one too many tools) on a
Kali Linux VM I'm using for learning and experimentation.

The machine is running in KVM via libvirt on a Linux host, but
instructions will be similar when using different virtualization
models.

If you're already familiar with this and just want the commands,
[jump to the TL;DR version](#tl-dr-version) below.

# Resize the virtual disk image

Make sure the guest VM is stopped:

``` shell
virsh shutdown kali
# Or `sudo shutdown -h now` from the guest
```

Head to the location where the libvirt disk image is stored:

``` shell
cd /var/lib/libvirt/images
```

(optional) Double check the current disk size:

``` shell
% sudo qemu-img info kali.qcow2
# [...]
virtual size: 20 GiB (21474836480 bytes)
```

Resize the disk image:

``` shell
sudo qemu-img resize kali.qcow2  40G  # absolute
sudo qemu-img resize kali.qcow2 +20G  # relative, add 20G
```


# Log into the VM and resize the root partition

Start the libvirt guest:

``` shell
virsh start kali
```

Once the machine has booted up, connect to it and list the partitions
on the root drive.

If you selected the default partitioning type (no LVM or encryption,
all files in one partition) during installation, it should look
something like this:


``` shell
$ sudo fdisk -l /dev/vda
Disk /dev/vda: 40 GiB, 42949672960 bytes, 83886080 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xa9ac9489

Device     Boot    Start      End  Sectors  Size Id Type
/dev/vda1  *        2048 39684095 39682048 18.9G 83 Linux
/dev/vda2       39686142 41940991  2254850  1.1G  f W95 Ext'd (LBA)
/dev/vda5       39686144 41940991  2254848  1.1G 82 Linux swap / Solaris
```

- Partition 1 is the main partition containing the Linux root
  filesystem
- Partition 2 is an extended partition, containing logical partitions
- Partition 5 is a swap (logical) partition

::: danger
If your partitions layout doesn't look like the example above, (for
example you have an extra partition for `/home`, or are using LVM
and/or LUKS), proceeding with these instructions will likely result in
data loss, and a non-functioning machine.

- If you used LVM, you should be able to extend the root logical
  volume using `lvchange`. Space will be allocated from the available
  space at the end of the drive, and extra logical volumes won't be
  affected.

- If you have extra (physical or logical) partitions and no LVM, your
  best option is to back them up, destroy, and recreate them. We won't
  be covering how to do that in this guide though.
:::

Disable swap, so we can remove the partition:

```
swapoff /dev/vda5
```

(we will have to recreate it later, but thankfully it doesn't contain
permanent data).

Use `fdisk` to modify the partition table.

What we want to do is:

- Delete all partitions from the drive
- Recreate a new root partition with sufficient space, **MAKING SURE
  IT STARTS AT THE EXACT SAME BLOCK AS THE PREVIOUS ONE**, so the
  filesystem is preserved as well.
- Recreate the swap partition

## Start fdisk

Start `fdisk`:

``` text
$ sudo fdisk /dev/vda

Welcome to fdisk (util-linux 2.41.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

This disk is currently in use - repartitioning is probably a bad idea.
It's recommended to umount all file systems, and swapoff all swap
partitions on this disk.
```

Ignore the warning, we like to live dangerously.

## Verify partition table

It should match what we got from `fdisk -l` earlier.

Make sure to note down the `Start` sector for the first (`/dev/vda1`)
partition, as we'll need to double-check it later.

``` text
Command (m for help): p

Disk /dev/vda: 40 GiB, 42949672960 bytes, 83886080 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xa9ac9489

Device     Boot    Start      End  Sectors  Size Id Type
/dev/vda1  *        2048 39684095 39682048 18.9G 83 Linux
/dev/vda2       39686142 41940991  2254850  1.1G  f W95 Ext'd (LBA)
/dev/vda5       39686144 41940991  2254848  1.1G 82 Linux swap / Solaris
```

## Verify free space

Make sure we have enough space at the end of the drive:

``` text
Command (m for help): F

Unpartitioned space /dev/vda: 20 GiB, 21475885056 bytes, 41945088 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes

   Start      End  Sectors Size
41940992 83886079 41945088  20G
```

## Delete old partitions

::: warning
While `fdisk` offers a command to create a new partition table, doing
so will also remove the bootloader from the main disk, requiring extra
steps to reinstall. The quickest way is to just use the `d` command to
delete all partitions one by one instead.
:::


``` text
Command (m for help): d
Partition number (1,2,5, default 5): 5

Partition 5 has been deleted.

Command (m for help): d
Partition number (1,2, default 2): 2

Partition 2 has been deleted.

Command (m for help): d
Selected partition 1
Partition 1 has been deleted.
```

## Create a new root partition

::: warning Important
Make sure the `First sector` for the new partition is the same as the
old partition, so the filesystem will be preserved.

Also remember to leave some space for the swap partition at the end (2
GB in this case, adjust as needed).
:::

``` text
Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1): 1
First sector (2048-83886079, default 2048):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-83886079, default 83886079): -2G

Created a new partition 1 of type 'Linux' and of size 38 GiB.
Partition #1 contains a ext4 signature.

Do you want to remove the signature? [Y]es/[N]o: n
```

## Create a new swap partition

``` text
Command (m for help): n
Partition type
   p   primary (1 primary, 0 extended, 3 free)
   e   extended (container for logical partitions)
Select (default p): e
Partition number (2-4, default 2):
First sector (79691776-83886079, default 79691776):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (79691776-83886079, default 83886079):

Created a new partition 2 of type 'Extended' and of size 2 GiB.

Command (m for help): n
All space for primary partitions is in use.
Adding logical partition 5
First sector (79693824-83886079, default 79693824):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (79693824-83886079, default 83886079):

Created a new partition 5 of type 'Linux' and of size 2 GiB.

Command (m for help): t
Partition number (1,2,5, default 5): 5
Hex code or alias (type L to list all): swap

Changed type of partition 'Linux' to 'Linux swap / Solaris'.
```

## Double-check the new partitioning layout

``` text
Command (m for help): p
Disk /dev/vda: 40 GiB, 42949672960 bytes, 83886080 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xae55699d

Device     Boot    Start      End  Sectors Size Id Type
/dev/vda1           2048 79691775 79689728  38G 83 Linux
/dev/vda2       79691776 83886079  4194304   2G  5 Extended
/dev/vda5       79693824 83886079  4192256   2G 82 Linux swap / Solaris
```

::: note
If you made any mistakes, you can quit with `q` and start over.
:::

## Write changes to disk

``` text
Command (m for help): w
The partition table has been altered.
Failed to remove partition 5 from system: Device or resource busy
Failed to update system information about partition 1: Device or resource busy
Failed to add partition 5 to system: Device or resource busy

The kernel still uses the old partitions. The new table will be used at the next reboot.
Syncing disks.
```

## Reboot

Reboot is needed to reload the partition table.

# Resize the ext4 filesystem

This will make it use all the available space on the partition:

``` shell
sudo resize2fs /dev/vda1
```

If you run `df -h /`, you should now see the increased filesystem
capacity.

# Recreate swap partition

For convenience, reuse the same UUID as the previous swap partition we
deleted earlier (you can get it from `/etc/fstab`):

``` shell
sudo mkswap -U 2712e819-33fa-4d79-af30-74f91bf93ca8 /dev/vda5
sudo swapon /dev/vda5
```


# TL;DR version

``` shell
# Host: shutdown VM
virsh shutdown kali

# Host: resize disk
qemu-img resize kali.qcow2 +20G

# Host: restart VM
virsh start kali

# Guest: recreate partitions
sudo fdisk /dev/vda
# - Delete all partitions using the `d` command.
#   DO NOT create a new partition table using the `o` command.
# - Create a new primary partition:
n  # new partition
p  # primary
1  # first partition
First sector: 2048  # Must match what copied from the previous partition!
Last sector: -2G    # Leave 2 GB at the end

Created a new partition 1 of type 'Linux' and of size 38 GiB.
Partition #1 contains a ext4 signature.

Do you want to remove the signature? [Y]es/[N]o: n  # <-- IMPORTANT!

# - Create a new swap partition
n  # new partition
e  # extended
# (accept defaults for the rest)

n  # new partition
# (accept defaults for the rest)

t  # set partition type
Partition number: 5
Hex code or alias: swap

p  # double-check
w  # write

# Guest: restart to reload partition table
reboot

# Guest: resize filesystem
sudo resize2fs /dev/vda1
df -h /  # check updated size
```
