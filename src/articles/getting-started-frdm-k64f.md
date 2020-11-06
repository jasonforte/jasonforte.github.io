---
slug: "/2020/11/getting-started-frdm-k64f-zephyr"
date: "2020-11-06"
title: "Deploying Zephyr OS on the FRDM-K64F development board"
blurb: |
  A starting point to my re-discovery of microcontroller programming and the world of IoT. Loading and running your
  first Zephyr OS application on the FRDM-K64F Freedom Development Platform.
---

## Getting Closer to the Curcuits

Over the past few months I've been having farily regular meetings with customers who are building startups in the IoT
space. IoT was once a big hit and it has me thinking if there really was a lull or if my Kubernetes distraction has lead
me astray.

IoT is very much still alive and the recent sighting of projects such as K3s and KubeEdge bringing Kubernetes to the edge
has sparked the interest of this ex electrical engineering student.

Almost on a whim I managed to get my hands on a FRDM-K64F MCU and an NVidia Jetson Nano (article comming soon). Having
both of these would give me the flexibility to build with AWS IoT Greengrass, FreeRTOS & Zephyr OS to build embeded
systems, IoT gateways and a number of edge device applications.

## Choosing the Device

Both devices were found after consulting the [AWS IoT Supported Devices Catalog](https://devices.amazonaws.com) to check
compatibility with FreeRTOS, IoT Core & AWS Greengrass.

### Why the FRDM-K64F?

I didn't spend too long deciding on a board. My main purpose was general tinkering. I chose this board because it was
listed as supporting FreeRTOS on the device catalog. It's considered a "development board" so I thought that, paired with
the same pin configuration as an Ardunio, would give me the options to play around with some of the addon boards in future.

The ethernet port was essential as I intended to use this device as a internet connected low power device that connected
into the AWS Cloud.

## First Project - Hello World

For my first task, I wanted to just get a simple hello world & blinky application running on my FRDM-K64F. It's been a
while since I last wrote code for a microcontroller and even back then I relied on a GUI. In this project I decided to
do away with installing IDEs because I'd prefer to stick with VSCode and my terminal.

In terms of the RTOS, I initially tried out FreeRTOS but struggled a bit with setting up the tooling around my board. So
I decided to go with Zephyr OS as a Linux Foundation backed option.


## Prepping the Board with DAPLink

DAPLink is the bit of software that allows the easy flashing and debugging of code that is running on the MCU. When I
first plugged in my board I was able to see the board mount as `BOOTLOADER`.

Because my device mounted as `BOOTLOADER` and not `MAINTENANCE` the docs required me to update the DAPLink Bootloader
which I did [by following the mbed OS guide](https://os.mbed.com/blog/entry/DAPLink-bootloader-update/).

Recycling the device power automatically mounted the board as `MAITENANCE` - good sign. Now I could to

```bash
$ cp ./0244_k20dx_bootloader_update_0x5000.bin /media/BOOTLOADER && sync
$ # Recycle Power
$ cp ./0253_k20dx_frdmk64f_0x5000.bin /media/MAINTENANCE && sync
$ # Recycle Power
```

This time, when you re-cycle power you should see the board mount as `DAPLink`.


## Installing Zephyr OS Dependncies

I was working on a fairly fresh installation of Ubuntu 20.04.1 so my next step was to install the Zephyr OS dependencies
[as stated in this guide](https://docs.zephyrproject.org/latest/getting_started/index.html).

This gave me access to the `west` tool that would allow me to build my sample apps and then flash to the device.

## Loading the Hello World

As part of the [Zephyr getting started guide](https://docs.zephyrproject.org/latest/getting_started/index.html) you end
up with a `~/zephyrproject/zephyr` directory.

To build the hello world app and flash to your device you do the following:

```bash
$ west build -b frdm_k64f samples/hello_world
$ west flash
```

With that you have now got the hello world app running on the FRDM-K64F board.

## Viewing the Zephyr Hello World Output

I'll admit that what stumped me at first glance was how I'd be able to see the Hello World output that the device was
printing.

After some research, I found that it was fairly straight forward thanks to DAPLink. The device appears as a tty under
the `/dev` directory.

To find the device I need to check dmesg

```bash
$ dmesg | grep tty
[66555.401523] cdc_acm 1-1:1.1: ttyACM0: USB ACM device
[66570.292077] cdc_acm 1-1:1.1: ttyACM0: USB ACM device
```

From this I knew I'd be able to access from `/dev/ttyACM0`. There was only one last piece of the puzzle and that was to
set the baud rate of the serial port. This was accomplished using `stty`

```bash
$ stty -F /dev/ttyACM0 115200
```

With that I could see the output being emitted to the serial port with the following command. All I needed to do was
push the reset button to see the message pop up.

```bash
$ cat < /dev/ttyACM0
*** Booting Zephyr OS build zephyr-v2.4.0-1133-ge4e3ab3cc315  ***

Hello World! frdm_k64f
```

## Second Project - Blinky Example on the FRDM-K64F

The next thing I did was test out the blinky example. Having all the above setup it was easy to build and deploy this
from the provided source code in `samples/basic/blinky`.

```bash
$ west build -b frdm_k64f samples/basic/blinky
$ west flash
```

As expected, on reset my device light started flashing green.

## Conclusion

With this basic example out of the way I felt I was ready to try out some more complicated setups involving ARM, IoT Core
and the embedded C SDKs for AWS.
