Using nvidia driver on debian jessie
####################################

:tags: sysadmin, debian, linux, nvidia
:date: 2014-05-12 15:01:00
:category: Sysadmin


I had some troubles getting nvidia proprietary drivers up & running on
Debian Jessie (kernel 3.13-1-amd64).

I'm sharing the solution I found here, as it might be useful to
somebody else.


Machine configuration
=====================

| **Machine:** Thinkpad W530
| **Graphics card:** NVIDIA Corporation GK107GLM [Quadro K2000M] (rev a1)
| **Operating System:** Debian Jessie (testing) - amd64
| **Kernel:** 3.13-1-amd64 (3.13.10-1)

The error message I got::

    [   36.508494] NVRM: GPU at 0000:01:00.0 has fallen off the bus.
    [   36.508500] NVRM: os_pci_init_handle: invalid context!
    [   36.508502] NVRM: os_pci_init_handle: invalid context!
    [   36.508507] NVRM: GPU at 0000:01:00.0 has fallen off the bus.
    [   36.508510] NVRM: os_pci_init_handle: invalid context!
    [   36.508511] NVRM: os_pci_init_handle: invalid context!
    [   36.536034] NVRM: RmInitAdapter failed! (0x25:0x28:1169)
    [   36.536044] NVRM: rm_init_adapter failed for device bearing minor number 0
    [   36.536067] NVRM: nvidia_frontend_open: minor 0, module->open() failed, error -5


Finally, how I solved
=====================

I found a post recommending to add ``rcutree.rcu_idle_gp_delay=1``
kernel boot parameter, and it seems to work just fine.

To accomplish that, I modified ``/etc/default/grub``:

.. code-block:: bash

    GRUB_CMDLINE_LINUX="nox2apic rcutree.rcu_idle_gp_delay=1"

And, just because the nvidia driver is complaining about unsupported
framebuffer, I also commented these two out:

.. code-block:: bash

    # GRUB_GFXMODE=1920x1080x32
    # GRUB_GFXPAYLOAD_LINUX=1920x1080x32

Don't forget to run ``update-grub``, and then reboot.
