# StarControl 2020 Web UI

## Development

This section contains instructions on the development process. 
See also [Create React App](https://create-react-app.dev/).

### Pre-requisites

* Node.js
* npm

### Download simulator

* https://github.com/org-arl/r2c2/releases/download/starfish-simulator-20200417-1230/starfish-simulator.zip

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
