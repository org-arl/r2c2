import React from 'react'
import {Container, Row, Table} from 'react-bootstrap';

import {FjageHelper} from "../../assets/fjageHelper.js";
import {Management} from "../../assets/jc2.js";
import {css, StyleSheet} from 'aphrodite';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck, faTimes} from '@fortawesome/free-solid-svg-icons'

const styles = StyleSheet.create({
    table_styles: {
        fontSize: "0.75em"
    },
    errorRow: {
        backgroundColor: "#ffbfba"
    }
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
                this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.VEHICLESTATUS'));
                this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.MISSIONSTATUS'));

                this.management = new Management(this.gateway);

                this.management.getVehicleId()
                    .then(vehicleId => {
                        console.log('vehicleId', vehicleId);
                        this.vehicleId = vehicleId;
                    })
                    .catch(reason => {
                        console.log('could not get vehicle ID', reason);
                    });

                this.management.getHealth()
                    .then(response => {
                        // console.log(response);
                        this.setState({
                            diagnostics: response
                        });
                    })
                    .catch(reason => {
                        console.log('could not get health', reason);
                    });
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
            <Container>
                <Row>
                    <h3>Diagnostics</h3>
                </Row>
                <Row>
                    <Table striped bordered hover size="sm" className={css(styles.table_styles)}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Online</th>
                            <th>Healthy</th>
                            <th>Data</th>
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
                                    <td>{getSubStatusIcon(healthDescriptor.online)}</td>
                                    <td>{getSubStatusIcon(healthDescriptor.healthy)}</td>
                                    <td>{getSubStatusIcon(healthDescriptor.data)}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </Row>
            </Container>
        );
    }
}

export default DiagnosticsComponent;
