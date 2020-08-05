# StarControl 2020 Web UI

## Releases

Audience: Users

Simulator+WebUI releases can be found at https://github.com/org-arl/r2c2/releases (starfish-simulator)

### Instructions

* Pre-requisites
    * JDK 8
* Download starfish-simulator.zip
* Unzip starfish-simulator.zip
* Run the command: `./run.sh`
* Open a browser (preferable Chrome/Firefox) and open http://localhost:8888

## Development

Audience: Developers

This section contains instructions on the development process.

The WebUI uses the React framework
* [React](https://reactjs.org/)
* [Create React App](https://create-react-app.dev/)

The WebUI uses fjage's Javascript gateway for communications
* [fjage](https://github.com/org-arl/fjage)
* [fjage Javascript gateway](https://fjage.readthedocs.io/en/latest/jsgw.html)

### Pre-requisites

* Node.js
* npm

### Download simulator

* https://github.com/org-arl/r2c2/releases/ (starfish-simulator.zip)

### Install packages

Only when changes are made in `package.json`.

```
npm install
```

### Start development server

Start the simulator, then:

```
npm run start
```

## Build

### Pre-requisites

* JDK 8

### Standalone simulator

This section contains instructions on building the standalone simulator (it includes the web UI).

**NOTE**
* This requires access to the `starfish` repository.

* Check out the `starfish` repository to the same directory as the `r2c2` repository (such that they are siblings in the same directory).
* Switch to the base directory of `starfish`.
* Run:
    ```
    ./gradlew clean && ./gradlew :simulator2:build
    ```
* The simulator distribution can be found at `simulator2/build/distributions/starfish-simulator.zip`.

## About the StarControl web UI:

#### Map UI
Provides the following functionalities:
+ The map displays the vehicle position, geofence, mission (whichever is selected) and the vehicle path. All of these can be toggled using the buttons.
+ The map can be viewed offline and is rendered using the leaflet library.
+ The map allows the user to draw a new geofence for the vehicle.
+ It provides a tree view of all the missions along with their mission tasks and displays the various pameters for each mission task.
+ The user can view and run missions using the UI.

#### Dashboard
Contains a series of gauges that display various parameters from the vehicle status.

#### Diagnostics
Displays the status and health of all the components of the AUV.

#### Sentuators
Displays various sensors and actuators, their health status and data received from them.

#### Script Control
Enables the user to control the AUV’s behavior by uploading and running sub-routines from a script.
