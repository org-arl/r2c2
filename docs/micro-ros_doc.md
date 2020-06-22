**Micro-ROS**

* ROS2 for microcontrollers

* Uses Real time operating system (RTOS) instead of LInux

* DDS for eXtremely Resource Constrained Environments (DDS-XRCE) instead of classical DDS

**Concepts associated with Mirco-ros: Client library**

* Introduction to Client Library [Introduction to Client Library](https://micro-ros.github.io/docs/concepts/client_library/)

* [Real-Time Executor](https://micro-ros.github.io/docs/concepts/client_library/real-time_executor/)

    ** Architecture

    ** Scheduling Semantics

    ** Real-time embedded application used-case

*Must read exammples for robotics application*

    * Sense-plan-act pipeline in robotics

    * Synchronization of multiple rates (related to sensor fusion)

    * High-priority processing path

** [Lifecycle and System Modes](https://micro-ros.github.io/docs/concepts/client_library/system_modes/)

** [Embedded Transform (TF)](https://micro-ros.github.io/docs/concepts/client_library/embedded_tf/)


**Concepts: Middleware**

* [Detailed Information about Micro XRCE-DDS](https://micro-ros.github.io/docs/concepts/middleware/Micro_XRCE-DDS/)

**Concepts: RTOS**

 micro-ROS integrates RTOS in its software stack taking advantage of RTOS capabilities [Why a Real-Time Operating System?
](https://micro-ros.github.io/docs/concepts/rtos/)

3 major RTOS available for Micro-ros

1. [FreeRTOS](https://micro-ros.github.io/docs/concepts/rtos/FreeRTOS/)

2. [NuttX](https://micro-ros.github.io/docs/concepts/rtos/NuttX/)

3. [Zephyr](https://micro-ros.github.io/docs/concepts/rtos/Zephyr/)

[Comparison of these 3 RTOS](https://micro-ros.github.io/docs/concepts/rtos/comparison/)
 
**Tutorials and Experiments**

* OS Using: ROS2 Dashing

* [Work with Embedded board](https://micro-ros.github.io/docs/tutorials/core/getting_started_embedded/): 

    * Built Docker Image
    
    * Flashed the image on STM32-E407 board
    
* Work with QEMU Simulator(generic and open source machine emulator and virtualizer) [https://micro-ros.github.io/docs/tutorials/core/getting_started_simulator/]

* [Programming client/service with rcl](https://micro-ros.github.io/docs/tutorials/core/programming_rcl_rclc/)

* [RMW & Micro XRCE-DDS Configuration](https://micro-ros.github.io/docs/tutorials/core/microxrcedds_rmw_configuration/)

Since micro-ROS is intended to work on extremely low resources systems, its middleware layer is highly configurable. This configurability, along with the fact that the middleware layer does not use dynamic memory, allows the users to determine how much static memory is going to be allocated.

**Demos**

1. Kobuki Demo:

* Instead of a laptop running ROS, the Kobuki is equipped with a STM32F4 microcontroller only. This STM32F4 runs the micro-ROS stack and a port of the thin_kobuki driver, which interacts with the robot’s firmware (which runs on a built-in microcontroller)

* The STM32F4 communicates the sensor data via DDS-XRCE to a remote laptop running a standard ROS 2 stack, the micro-ROS agent and rviz. 

* At the same time, using the other direction of communication, the Kobuki can be remote-controlled.

2. [Crazyfly demo](https://micro-ros.github.io/docs/tutorials/demos/crazyflie_demo/)

drone- user controlled

kobuki- mobile and user controlled

**Advanced tutorials with NuttX**

This is what we planned to experiment with STM32-E407 Board.


*TO-DO*

1. Try executing these examples : [NuttX examples](https://micro-ros.github.io/docs/tutorials/advanced/nuttx/nuttx_getting_started/)

2. [Study OliMex ST32-E407 config/data sheeet](https://github.com/micro-ROS/hardware/blob/master/documentation/stm32-e407/STM32-E407.pdf)


--------------------------------------------------------------------------------------

**Progress track and instructions with Olimex STM32 and Micro-ros**

1. Installed ROS2 and the micro-ROS build system

* On Ubuntu 18.04 LTS computer, install ROS 2 Dashing Diademata:

```
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

sudo apt update && sudo apt install curl gnupg2 lsb-release
curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | sudo apt-key add -

sudo sh -c 'echo "deb http://packages.ros.org/ros2/ubuntu `lsb_release -cs` main" > /etc/apt/sources.list.d/ros2-latest.list'
sudo apt update
sudo apt install ros-dashing-desktop

```

* Install micro-ROS build system:

```
# Source the ROS 2 installation
source /opt/ros/$ROS_DISTRO/setup.bash

# Create a workspace and download the micro-ROS tools
mkdir microros_ws 
cd microros_ws
git clone -b $ROS_DISTRO https://github.com/micro-ROS/micro-ros-build.git src/micro-ros-build

# Update dependencies using rosdep
sudo apt update && rosdep update
rosdep install --from-path src --ignore-src -y

# Build micro-ROS tools and source them
colcon build
source install/local_setup.bash

```

* Creating a firmware workspace that targets all the required code and tools ##We used NuttX RTOS for this experiment, options available were NuttX, FreeRTOS and Zephyr

```
ros2 run micro_ros_setup create_firmware_ws.sh [RTOS] olimex-stm32-e407

```

You will find a folder named firmware in your workspace.

```
#Update Cmake

sudo apt install wget
wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | sudo apt-key add -
sudo apt install software-properties-common
sudo apt-add-repository 'deb https://apt.kitware.com/ubuntu/ bionic main'
sudo apt update
sudo apt install cmake
``` 
* Configure the firmware

```
# Configure step
ros2 run micro_ros_setup configure_firmware.sh [APP] [OPTIONS]
```

* Creating a new app in Nuttx (The following steps are RTOS-specific commands for creating a new app once the firmware folder is created inside microros_ws)

```
# Go to app folder inside firmware
cd firmware/apps/examples

# Create your app folder and required files. Contents of these file can be found in column Sample app in table above
mkdir uros_pingpong
cd uros_pingpong
touch Kconfig
touch Makefile
touch app.c
touch Make.defs
```

```
cd microros_ws
ros2 run micro_ros_setup configure_firmware.sh uros

git clone https://bitbucket.org/nuttx/tools.git firmware/tools

pushd firmware/tools/kconfig-frontends
./configure --enable-mconf --disable-nconf --disable-gconf --disable-qconf 
LD_RUN_PATH=/usr/local/lib && make && sudo make install && sudo ldconfig
popd

cd firmware/NuttX
make menuconfig

```
***Troubleshooting***

error in flashing image: https://github.com/micro-ROS/micro-ros-build/issues/38

*********** ***********

This will open the NuttX menu config, which allows you to modify the configuration of the RTOS, including adding a new application.

On the menu, follow the path: Application Configuration -> Examples


A list of the available applications will appear. You need to find: micro-ROS Ping-Pong and click y to add it.


Now push three times the key ESC to close the menu. You will be asked if you want to save your new configuration, and you need to click Yes.

```
cd uros_ws/firmware/NuttX
make savedefconfig

```

This will generate a file called defconfig inside of uros_ws/firmware/NuttX. This file is a config profile with all the configuration required to run your specific application.

Finally create a folder called uros_pingpong into uros_ws/firmware/NuttX/configs/olimex-stm32-e407 and move the defconfig file to uros_pingpong folder so you can execute:

```
# Configure step
ros2 run micro_ros_setup configure_firmware.sh uros_pingpong
```
***Troubleshooting***

compile error: https://github.com/micro-ROS/micro-ros-build/issues/29

*********** ***********

* Flash the firmware on Olimex STM32-E407 Using JTAG interface

Connect Olimex ARM-USB-TINY-H to the board:

***Troubleshooting***

If you get error in this step, set the correct power mode by using resistor on STM32E407. The resistor needs to be removed or set manually, check on boot jumpers and USB-OTG cables.

Also check page 8, [olimex_STM32-E407](https://www.olimex.com/Products/ARM/ST/STM32-E407/resources/STM32-E407.pdf)

![board-pic](img/board.png)


************ *************

Make sure that the board power supply jumper (PWR_SEL) is in the 3-4 position in order to power the board from the JTAG connector:


Once you have your computer connected to the Olimex board through the JTAG adapter, run the flash step:

```
# Flash step
ros2 run micro_ros_setup flash_firmware.sh
```

* Running the micro-ROS app

# create and build a micro-ROS agent

```
# Download micro-ROS-Agent packages
ros2 run micro_ros_setup create_agent_ws.sh

# Build micro-ROS-Agent packages, this may take a while.
colcon build
source install/local_setup.bash
```

#Olimex STM32-E407 Serial connection
Olimex development board is connected to the computer using the usb to serial cable

#Olimex STM32-E407 USB connection
Olimex development board is connected to the computer using the USB OTG 2 connector (the miniUSB connector that is furthest from the Ethernet port).

```
#Find your serial device name
ls /dev/serial/by-id/*

# Run a micro-ROS agent
ros2 run micro_ros_agent micro_ros_agent serial --dev [device]
```

* Test the sample micro-ROS app behaviour

```
source /opt/ros/$ROS_DISTRO/setup.bash

# Subscribe to micro-ROS ping topic
ros2 topic echo /microROS/ping
```
```
#You should see the topic messages published by the Ping Pong node every 5 seconds:

user@user:~$ ros2 topic echo /microROS/ping
stamp:
  sec: 20
  nanosec: 867000000
frame_id: '1344887256_1085377743'
---
stamp:
  sec: 25
  nanosec: 942000000
frame_id: '730417256_1085377743'
---

#In another command line, let’s subscribe to the pong topic

source /opt/ros/$ROS_DISTRO/setup.bash

# Subscribe to micro-ROS pong topic
ros2 topic echo /microROS/pong

#At this point, we know that our app is publishing pings. Let’s check if it also answers to someone else pings in a new command line:

source /opt/ros/$ROS_DISTRO/setup.bash

# Send a fake ping ros2 topic pub --once /microROS/ping std_msgs/msg/Header '{frame_id: "fake_ping"}' Now, we should see on the ping subscriber our fake ping along with the board pings:

user@user:~$ ros2 topic echo /microROS/ping
stamp:
  sec: 0
  nanosec: 0
frame_id: fake_ping
---
stamp:
  sec: 305
  nanosec: 973000000
frame_id: '451230256_1085377743'
---
stamp:
  sec: 310
  nanosec: 957000000
frame_id: '2084670932_1085377743'
---
#And in the pong subscriber, we should see the board’s answer to our fake ping:

user@user:~$ ros2 topic echo /microROS/pong
stamp:
  sec: 0
  nanosec: 0
frame_id: fake_ping
---
```


**NuttX specific tutorials**

NSH is a system console that can be used through different interfaces

* NSH console over USB

Visit this link [nsh console over USB](https://micro-ros.github.io/docs/tutorials/advanced/nuttx/nsh_usb/)

* NSH console over UART

Visit this link [nsh console over UART](https://micro-ros.github.io/docs/tutorials/advanced/nuttx/nsh_uart/)

* NSH console over UART

Visit this link [nsh console over UART](https://micro-ros.github.io/docs/tutorials/advanced/nuttx/debugging/)


* Debugging a NuttX Application

Visit this link [Debugging a NuttX Application
](https://micro-ros.github.io/docs/tutorials/advanced/nuttx/add_microros_config/)

NOTE- Due to requirement of USB-TL232 cable I was getting errors and hence it was stopped in between.



***Document in use for more reference***:

1. [getting_started_embedded](https://micro-ros.github.io/docs/tutorials/basic/getting_started_embedded/)

2. [STM32-E407-BLINK](https://github.com/NicHub/STM32-E407-BLINK)

3. [ARM-USB-OCD_and_OCD_H_manual](https://www.olimex.com/Products/ARM/JTAG/_resources/ARM-USB-OCD_and_OCD_H_manual.pdf)

4. [NSH-USB-Olimex](https://micro-ros.github.io/docs/tutorials/advanced/nuttx_getting_started/#NSH-USB-Olimex)

5. [stm32-e407](https://github.com/micro-ROS/hardware/blob/master/documentation/stm32-e407/stm32-e407.md)

6. [micro-ros](https://micro-ros.github.io/)






