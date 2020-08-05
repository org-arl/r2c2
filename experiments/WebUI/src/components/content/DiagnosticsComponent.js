import React from 'react'
import {Button, ButtonToolbar, Navbar, Table} from 'react-bootstrap';

import {FjageHelper} from "../../assets/fjageHelper.js";
import {Management} from "../../assets/jc2.js";
import {css, StyleSheet} from 'aphrodite';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck, faSync, faTimes} from '@fortawesome/free-solid-svg-icons'
import {toast} from "react-toastify";

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
    tableContainer: {
        fontSize: "0.75em",
    },
    errorRow: {
        backgroundColor: "#ffbfba"
    },
});

const TICK = <FontAwesomeIcon icon={faCheck} color="green"/>;
const CROSS = <FontAwesomeIcon icon={faTimes} color="red"/>;

const HEALTH_MAP = {
    "OFFLINE": {
        online: false,
        healthy: null,
        data: null,
        type: 'error',
    },
    "MALFUNCTION": {
        online: true,
        healthy: false,
        data: null,
        type: 'error',
    },
    "UNAVAILABLE": {
        online: true,
        healthy: true,
        data: false,
        type: 'error',
    },
    "HEALTHY": {
        online: true,
        healthy: true,
        data: true,
        type: null,
    },
};

const DEFAULT_HEALTH = {
    online: null,
    healthy: null,
    data: null,
    type: null,
}

function getHealthDescriptor(health) {
    let healthDescriptor = HEALTH_MAP[health];
    if (!healthDescriptor) {
        healthDescriptor = DEFAULT_HEALTH;
    }
    return healthDescriptor;
}

function getSubStatusIcon(value) {
    if (value === null) {
        return null;
    } else if (value) {
        return TICK;
    } else {
        return CROSS;
    }
}

class DiagnosticsComponent
    extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.gateway = FjageHelper.getGateway();

        this.state = {
            diagnostics: [],
        };
    }

    componentDidMount() {
        this.gateway.addConnListener((connected) => {
            if (connected) {
                this.management = new Management(this.gateway);

                this.management.getVehicleId()
                    .then(vehicleId => {
                        console.log('vehicleId', vehicleId);
                        this.vehicleId = vehicleId;
                    })
                    .catch(reason => {
                        console.log('could not get vehicle ID', reason);
                    });

                this._onRefresh();
            }
        });
    }

    componentWillUnmount() {
        this.gateway.close();
    }

    render() {
        if (this.vehicleId) {
            document.title = this.vehicleId + " Diagnostics";
        } else {
            document.title = "Diagnostics";
        }

        const errorClass = css(styles.errorRow);

        return (
            <div className={css(styles.container)}>
                <Navbar bg="light">
                    <Navbar.Brand>Diagnostics</Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <ButtonToolbar>
                            <Button title="Refresh"
                                    size="sm"
                                    onClick={this._onRefresh}
                                    className="ml-1">
                                <FontAwesomeIcon icon={faSync} color="white"/>
                            </Button>
                        </ButtonToolbar>
                    </Navbar.Collapse>
                </Navbar>
                <div className={css(styles.content)}>
                    <div className={css(styles.tableContainer)}>
                        <Table striped bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th className="text-center">Online</th>
                                <th className="text-center">Healthy</th>
                                <th className="text-center">Data</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.diagnostics.map((entry, index) => {
                                const healthDescriptor = getHealthDescriptor(entry.health);
                                let rowClass = null;
                                if (healthDescriptor.type === 'error') {
                                    rowClass = errorClass;
                                }
                                return (
                                    <tr key={index} className={rowClass}>
                                        <td>{index + 1}</td>
                                        <td>{entry.name}</td>
                                        <td className="text-center">{getSubStatusIcon(healthDescriptor.online)}</td>
                                        <td className="text-center">{getSubStatusIcon(healthDescriptor.healthy)}</td>
                                        <td className="text-center">{getSubStatusIcon(healthDescriptor.data)}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        );
    }

    _onRefresh = function () {
        this.management.getHealth()
            .then(response => {
                // console.log(response);
                this.setState({
                    diagnostics: response
                });
                toast.success("Diagnostics refreshed", TOAST_OPTIONS);
            })
            .catch(reason => {
                console.log('could not get health', reason);
                toast.error("Failed to refresh diagnostics", TOAST_OPTIONS);
            });
    }.bind(this);
}

export default DiagnosticsComponent;
