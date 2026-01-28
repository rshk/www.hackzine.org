---
title: "Compiling Emacs 30 on Ubuntu 24.04"
description:
date: 2026-01-28T22:19:19Z
tags: emacs,linux,ubuntu
---

# Install dependencies

First of all, make sure to enable `deb-src` in
`/etc/apt/sources.list.d/ubuntu.sources` (`Types: deb deb-src`), then
run `apt update`.

Install build dependencies:

```shell
sudo apt build-dep -y emacs
sudo apt install libtree-sitter-dev
```

# Clone the source repo

If you only want version 30:

``` shell
git clone --depth 1 --branch emacs-30 git://git.savannah.gnu.org/emacs.git
cd ./emacs
```

If you want the entire emacs repo (beware, it's fairly large!):

```shell
git clone git://git.savannah.gnu.org/emacs.git
cd ./emacs
git worktree add ../emacs-30 origin/emacs-30
```

# Configure

Run `autogen`:

```shell
./autogen.sh
```

Run `./configure`:

```shell
CFLAGS="-march=native -pipe" \
    ./configure \
    --prefix=/opt/emacs30 \
    --with-cairo --with-libsystemd --with-modules \
    --with-tree-sitter \
    --with-x-toolkit=gtk3
```

- Set `--prefix` to the desired install location
- If you don't want X support, remove the `--with-x-toolkit` option,
  add `--without-x --without-sound`
- See `./configure --help` for other options

::: warning
The `-march=native` flag will tell gcc to make the resulting
executable compatible *only* with the architecture of the current CPU.
Remove (or modify) it if you need to redistribute the executable.

See also [`-march` on the Gentoo wiki](https://wiki.gentoo.org/wiki/GCC_optimization#-march).
:::


# Build

```shell
make -j24
```

- Adjust the `-j` option based on the number of cores on your machine


# Install

```shell
make install
```

# Run

```shell
/opt/emacs30/bin/emacs
/opt/emacs30/bin/emacsclient
```

Add to path:

```shell
PATH="/opt/emacs30/bin:${PATH}"
```


# See also

- [Archlinux PKGBUILD for Emacs](https://gitlab.archlinux.org/archlinux/packaging/packages/emacs/-/blob/main/PKGBUILD)
- [GCC Optimization](https://wiki.gentoo.org/wiki/GCC_optimization)
