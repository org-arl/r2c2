import React, {PureComponent} from 'react'
import {Button, ButtonToolbar, Dropdown, Form, Navbar, Tab, Table, Tabs} from 'react-bootstrap';
import Dialog from "react-bootstrap-dialog";
import {FjageHelper} from "../../assets/fjageHelper.js";
import {Management} from "../../assets/jc2.js";
import {toast} from 'react-toastify';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faEdit, faEllipsisH, faEye, faHeartBroken, faSync, faTimes} from '@fortawesome/free-solid-svg-icons';
import {css, StyleSheet} from "aphrodite";

const TITLE = "Sentuators";

toast.configure();

const TOAST_OPTIONS = {
    position: toast.POSITION.BOTTOM_RIGHT,
    autoClose: true,
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    content: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        height: "100%",
        overflowX: "auto",
        overflowY: "auto",
    },
    tableContainer: {},
});

const updateIntervals = [
    {
        label: 'none',
        interval: null,
    },
    {
        label: '1s',
        interval: 1000,
    },
    {
        label: '5s',
        interval: 5000,
    },
    {
        label: '10s',
        interval: 10000,
    },
    {
        label: '15s',
        interval: 15000,
    },
];

class SentuatorsComponent
    extends PureComponent {

    constructor(props) {
        super(props);
        this.gateway = FjageHelper.getGateway();

        this.state = {
            updateInterval: updateIntervals[0],
            sentuators: [],
            selectedSentuator: null,
            sensorWatchMap: {},
            sensorValueMap: {},
            sensorHealthMap: {},
            actuatorHealthMap: {},
        };

        this.intervalHandle = null;
    }

    componentDidMount() {
        this._updateVehicleId(null);

        this.gateway.addConnListener((connected) => {
            if (connected) {
                this.management = new Management(this.gateway);

                this.management.getVehicleId()
                    .then(vehicleId => {
                        this._updateVehicleId(vehicleId);
                    })
                    .catch(reason => {
                        console.log('could not get vehicle ID', reason);
                    });

                this._getSentuators();
            }
        });
    }

    componentWillUnmount() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }

    render() {
        return (
            <div className={css(styles.container)}>
                <Navbar bg="light">
                    <Navbar.Brand>{TITLE}</Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <ButtonToolbar>
                            <Dropdown className="ml-1" title="Select sentuator">
                                <Dropdown.Toggle>
                                    {this.state.selectedSentuator ? this.state.selectedSentuator.name : "Select..."}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {this.state.sentuators && this.state.sentuators.map((sentuator, index) => (
                                        <Dropdown.Item key={index}
                                                       onClick={(e) => this._onSentuatorSelected(sentuator)}>
                                            {sentuator.name}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown className="ml-1" title="Select update interval">
                                <Dropdown.Toggle>
                                    {this.state.updateInterval.label}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {updateIntervals.map((updateInterval, index) => (
                                        <Dropdown.Item key={index}
                                                       onClick={(e) => this._onUpdateIntervalSelected(updateInterval)}>
                                            {updateInterval.label}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            <Button title="Refresh"
                                    size="sm"
                                    onClick={(e) => this._onRefresh()}
                                    className="ml-1">
                                <FontAwesomeIcon icon={faSync} color="white"/>
                            </Button>
                        </ButtonToolbar>
                    </Navbar.Collapse>
                </Navbar>
                <div className={css(styles.content)}>
                    {this.state.selectedSentuator && (
                        <Tabs>
                            {this.state.selectedSentuator.sensors && (this.state.selectedSentuator.sensors.length > 0) && (
                                <Tab eventKey="sensors" title="Sensors">
                                    <div className={css(styles.tableContainer)}>
                                        <Table striped bordered hover>
                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th className="text-center">Health</th>
                                                <th className="text-center"><FontAwesomeIcon icon={faEye}/></th>
                                                <th className="text-left">Values</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.selectedSentuator.sensors.map((sensor, index) => (
                                                <tr key={index}>
                                                    <td>{sensor.name}</td>
                                                    <td className="text-center">{this._getHealthComponent(this.state.sensorHealthMap[sensor.name])}</td>
                                                    <td className="text-center">
                                                        <Form.Switch id={sensor.name}
                                                                     label=""
                                                                     checked={this.state.sensorWatchMap[sensor.name]}
                                                                     onChange={(e) => this._onSensorWatchChanged(e, sensor)}/>
                                                    </td>
                                                    <td className="text-left">
                                                        {this.state.sensorValueMap && this.state.sensorValueMap[sensor.name] && (
                                                            <Table>
                                                                <tbody>
                                                                {this.state.sensorValueMap[sensor.name].items.map((record, index) => (
                                                                    <tr key={index}>
                                                                        <td>{record.type}</td>
                                                                        <td>{record.value}</td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </Table>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Tab>
                            )}
                            {this.state.selectedSentuator.actuators && (this.state.selectedSentuator.actuators.length > 0) && (
                                <Tab eventKey="actuators" title="Actuators">
                                    <div className={css(styles.tableContainer)}>
                                        <Table striped bordered hover>
                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th className="text-center">Health</th>
                                                <th className="text-center"></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.selectedSentuator.actuators.map((actuator, index) => (
                                                <tr key={index}>
                                                    <td>{actuator.name}</td>
                                                    <td className="text-center">{this._getHealthComponent(this.state.actuatorHealthMap[actuator.name])}</td>
                                                    <td className="text-center">
                                                        <Button title="Set" size="sm"
                                                                onClick={(e) => this._onSetActuatorRequested(actuator)}>
                                                            <FontAwesomeIcon icon={faEdit}
                                                                             color="white"/>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Tab>
                            )}
                        </Tabs>
                    )}
                </div>
                <Dialog ref={(component) => {
                    this.dialog = component
                }}/>
            </div>
        );
    }

    // ---- UI events

    _onRefresh() {
        this._getSentuators();
    }

    _onSentuatorSelected(sentuator) {
        this._getSentuatorHealth(sentuator.name);
        const sensorWatchMap = {};
        const sensorValueMap = {};
        sentuator.sensors.forEach((sensor, index) => {
            sensorWatchMap[sensor.name] = false;
            sensorValueMap[sensor.name] = null;
        });
        this.setState({
            selectedSentuator: sentuator,
            sensorWatchMap: sensorWatchMap,
            sensorValueMap: sensorValueMap,
        });
    }

    _onUpdateIntervalSelected(updateInterval) {
        if (updateInterval.interval === this.state.updateInterval.interval) {
            return;
        }
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
        if (updateInterval.interval) {
            this.intervalHandle = setInterval(() => this._handleUpdateInterval(), updateInterval.interval);
        }
        this.setState({
            updateInterval: updateInterval,
        });
    }

    _onSensorWatchChanged(e, sensor) {
        const sensorWatchMap = this.state.sensorWatchMap;
        const watch = e.target.checked;
        sensorWatchMap[sensor.name] = watch;
        this.setState({
            sensorWatchMap: {...sensorWatchMap},
        });
        if (watch) {
            this._getMeasurement(sensor.name);
        }
    }

    _onSetActuatorRequested(actuator) {
        this.dialog.show({
            body: actuator.name,
            prompt: Dialog.TextPrompt({
                required: true,
            }),
            actions: [
                Dialog.CancelAction(),
                Dialog.OKAction((dialog) => {
                    this._setActuatorValue(actuator, dialog.value);
                })
            ]
        })
    }

    // ----

    _setActuatorValue(actuator, value) {
        console.log('_setActuatorValue', actuator, value);
        if (!this.state.selectedSentuator) {
            return;
        }
        this.management.setActuator(this.state.selectedSentuator.name, actuator.type, value)
            .then(response => {
                toast.success("Actuator value set: " + actuator.name + " = " + value, TOAST_OPTIONS);
            })
            .catch(reason => {
                toast.error("Failed to set actuator value: " + actuator.name, TOAST_OPTIONS);
            })
    }

    _getMeasurement(sensorName, maxAge = 1.0) {
        if (!this.state.selectedSentuator) {
            return;
        }
        const sensor = this._findSensor(sensorName);
        if (!sensor) {
            return;
        }
        this.management.getMeasurement(this.state.selectedSentuator.name, sensor.type, maxAge)
            .then(response => {
                const records = response;
                console.log(sensor.name, records);
                const sensorValueMap = this.state.sensorValueMap;
                sensorValueMap[sensor.name] = records;
                this.setState({
                    sensorValueMap: {...sensorValueMap},
                });
            })
            .catch(reason => {
                console.log('could not get sensor measurement', reason);
            })
    }

    _handleUpdateInterval() {
        if (!this.state.selectedSentuator) {
            return;
        }
        this._getSentuatorHealth(this.state.selectedSentuator.name);
        const sensorNames = Object.getOwnPropertyNames(this.state.sensorWatchMap);
        sensorNames.forEach(sensorName => {
            if (this.state.sensorWatchMap[sensorName]) {
                this._getMeasurement(sensorName);
            }
        });
    }

    _findSensor(sensorName) {
        if (!this.state.selectedSentuator || !this.state.selectedSentuator.sensors) {
            return null;
        }
        for (let i = 0; i < this.state.selectedSentuator.sensors.length; i++) {
            const sensor = this.state.selectedSentuator.sensors[i];
            if (sensor.name === sensorName) {
                return sensor;
            }
        }
        return null;
    }

    _getSentuators() {
        this.management.getSentuators()
            .then(response => {
                const sentuators = response;
                this.setState({
                    sentuators: sentuators,
                });
            })
            .catch(reason => {
                console.log('could not get sentuators', reason);
                this.setState({
                    sentuators: [],
                });
            });
    }

    _getHealthComponent(health) {
        if (health === 'HEALTHY') {
            return (
                <FontAwesomeIcon icon={faCheck} color="green" title="HEALTHY"/>
            );
        } else if (health === 'MALFUNCTION') {
            return (
                <FontAwesomeIcon icon={faHeartBroken} color="red" title="MALFUNCTION"/>
            );
        } else if (health === 'UNAVAILABLE') {
            return (
                <FontAwesomeIcon icon={faEllipsisH} color="green" title="UNAVAILABLE"/>
            );
        } else if (health === 'OFFLINE') {
            return (
                <FontAwesomeIcon icon={faTimes} color="red" title="OFFLINE"/>
            );
        } else {
            return null;
        }
    }

    _getSentuatorHealth(sentuatorId) {
        this.management.getSentuatorHealth(sentuatorId)
            .then(response => {
                const sensorHealthMap = {};
                const actuatorHealthMap = {};
                if (this.state.selectedSentuator && (sentuatorId === this.state.selectedSentuator.name)) {
                    if (response.sensors) {
                        response.sensors.forEach((healthRecord, index) => {
                            sensorHealthMap[healthRecord.sensor.name] = healthRecord.health;
                        });
                    }
                    if (response.actuators) {
                        response.actuators.forEach((healthRecord, index) => {
                            actuatorHealthMap[healthRecord.actuator.name] = healthRecord.health;
                        });
                    }
                }
                this.setState({
                    sensorHealthMap: sensorHealthMap,
                    actuatorHealthMap: actuatorHealthMap,
                });
                console.log('health updated');
            })
            .catch(reason => {
                console.log('could not get sentuator health', reason);
                this.setState({
                    sensorHealthMap: {},
                    actuatorHealthMap: {},
                });
            })
    }

    _updateVehicleId(vehicleId) {
        if (vehicleId) {
            document.title = vehicleId + " " + TITLE;
        } else {
            document.title = TITLE;
        }
    }
}

export default SentuatorsComponent;
