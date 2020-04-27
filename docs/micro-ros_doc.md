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

This is what we are planning to experiment with STM32-E407 Board.


*TO-DO*

1. Try executing these examples : [NuttX examples](https://micro-ros.github.io/docs/tutorials/advanced/nuttx/nuttx_getting_started/)

2. [Study OliMex ST32-E407 config/data sheeet](https://github.com/micro-ROS/hardware/blob/master/documentation/stm32-e407/STM32-E407.pdf)

See what else is required!



**STM-32

