---
title: "Trick: combining wordlists using standard Unix tools"
description:
date: 2025-12-28T13:42:26
tags: linux,infosec,tricks
---

When performing a dictionary-based brute force attack, as part of a
pentesting campaign, it often arises the need to combine multiple
wordlists from various sources.

(A common scenario: we want to combine generic wordlists with
target-specific words we discovered during information gathering).

We would like to be able to quickly combine them, removing duplicates,
and possibly filter them based on some condition (eg. we know the
password starts with "`foo`", or the last four digits of a PIN are
`1234`).

Some wordlists might be fairly large (`rockyou.txt.gz` is a good
example), so they're generally best kept around compressed using gzip
or other formats.

While some tools support reading gzipped wordlists, this is not true
for every tool out there, and certainly this becomes a problem when we
want to combine multiple gzipped and non-gzipped wordlists.

Thankfully, using standard Unix shell features, we can quickly
generate wordlists on the fly, as needed.


## Passing gzipped wordlists to non-gzip-aware tools

Some commands are able to detect compressed files and automatically
decompress them (`hashcat` for example), but others just expect a
plain text file.

Bash (and Zsh) shells support passing the output of a command pipeline
to another command as the path to an open file descriptor.

So for example, if we want to use a gzipped wordlist with `psk-crack`,
we can call it like this:

```bash
psk-crack -d <(gunzip < /usr/share/wordlists/rockyou.txt.gz) ...
```

Behind the scenes:

```bash
$ ls -lh <(echo hello)
lr-x------ 1 samu samu 64 Dec 28 07:48 /proc/self/fd/11 -> 'pipe:[1093239]'
```

## Combining wordlists

Use `cat` to combine multiple files, for example:

```bash
cat words.txt discovered.txt <(gzip -d < huge.txt.gz) <(xz -d < huge2.txt.xz)
```

## Removing duplicate entries

Use `sort -u`, for example:

```bash
sometool ... <(cat words.txt <(gzip -d < words2.txt) | sort -u)
```

## Filtering entries

```bash
sometool ... <(cat words.txt <(gzip -d < words2.txt) | grep '^foobar')
```


## Word of caution: not all programs can handle pipes

Some programs such as `hashcat` don't seem to be working properly when
reading a wordlist from a pipe:

```bash
$ hashcat -m 5400 -a 0 params.txt <(gunzip < /usr/share/wordlists/rockyou.txt.gz)
hashcat (v7.1.2) starting
[...]

The wordlist or mask that you are using is too small.
This means that hashcat cannot use the full parallel power of your device(s).
Hashcat is expecting at least 4096 base words but only got 0.0% of that.
Unless you supply more work, your cracking speed will drop.
For tips on supplying more work, see: https://hashcat.net/faq/morework
[...]
```

If this is the case, you might have to write the generated wordlist to
a temporary file first:

```bash
cat words.txt <(gzip -d < words2.txt) | sort -u > /tmp/words.txt
hashcat ... /tmp/words.txt
```

Or, in the case of `hashcat`, you can pipe the wordlist directly to
the program input (omit the wordlist parameter in this case):

```bash
cat words.txt <(gzip -d < words2.txt) | sort -u |  hashcat ...
```
