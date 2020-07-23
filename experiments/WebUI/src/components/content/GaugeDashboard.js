import React from 'react';
import {Container, Row} from 'react-bootstrap';
import {HotKeys} from "react-hotkeys";

import D3GaugeComponent from './D3GaugeComponent';
import D3AngularComponent from './D3AngularComponent';
import D3BearingComponent from './D3BearingComponent';

import {FjageHelper} from "../../assets/fjageHelper.js";
import {Message, Performative} from '../../assets/fjage.js';
import { Management} from "../../assets/jc2.js";

import FrontIcon from '../../assets/img/submarine-front-view.svg';
import SideIcon from '../../assets/img/submarine-side-view.svg';


class OperatorCmdReq extends Message {
    constructor(params) {
        super(new Message(), Performative.REQUEST);
        this.__clazz__ = 'org.arl.jc2.messages.OperatorCmdReq';
        if (params) {
            const keys = Object.keys(params);
            for (let k of keys) {
                this[k] = params[k];
            }
        }
    }
}

class GaugeDashboard extends React.Component {
    constructor(props, context) {
        super(props, context);

        // this.manualCommands = new ManualCommands('localhost', 8888);
        // this.manualCommands.getVehicleStatus();

        this.gateway = FjageHelper.getGateway();

        this.state = {
            xCoordinate: 0.0,
            yCoordinate: 0.0,
            altitude: 0.0,
            bearing: 0.0,
            depth: 0.0,
            pitch: 0.0,
            roll: 0.0,
            yaw: 0.0,
            speed: 0.0
        }

        this.radians_to_degrees = this.radians_to_degrees.bind(this);

    }

    keyMap = {
        GOTO_Roll: "shift+a",
        GOTO_Pitch: "shift+b",
        GOTO_Bearing: "shift+c",
        GOTO_Thrust: "shift+d",
        GOTO_Speed: "shift+e",
        GOTO_Depth: "shift+f",
        GOTO_Altitude: "shift+g",
        GOTO_LElevator: "shift+h",
        GOTO_Rudder: "shift+i",
        GOTO_RElevator: "shift+j"
    };

    handlers = {
        GOTO_Roll: event => {
            console.log("Roll");
            this.refs.Roll.refs.input.focus();
        },
        GOTO_Pitch: event => {
            console.log("Pitch");
            this.refs.Pitch.refs.input.focus();
        },
        GOTO_Bearing: event => {
            console.log("Bearing");
            this.refs.Bearing.refs.input.focus();
        },
        GOTO_Thrust: event => {
            console.log("Thrust");
            this.refs.Thrust.refs.input.focus();
        },
        GOTO_Speed: event => {
            console.log("Speed");
            this.refs.Speed.refs.input.focus();
        },
        GOTO_Depth: event => {
            console.log("Depth");
            this.refs.Depth.refs.input.focus();
        },
        GOTO_Altitude: event => {
            console.log("Altitude");
            this.refs.Altitude.refs.input.focus();
        },
        GOTO_LElevator: event => {
            console.log("LElevator");
            this.refs.LElevator.refs.input.focus();
        },
        GOTO_Rudder: event => {
            console.log("Rudder");
            this.refs.Rudder.refs.input.focus();
        },
        GOTO_RElevator: event => {
            console.log("RElevator");
            this.refs.RElevator.refs.input.focus();
        }
    };

    componentDidMount() {

        var captainAgentId = null;
        this.gateway.addConnListener((connected) => {
            if (connected) {
                this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.VEHICLESTATUS'));
                this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.MISSIONSTATUS'));
                this.gateway.addMessageListener((msg) => {
                    if (msg.__clazz__ === 'org.arl.jc2.messages.VehicleStatus') {
                        // Disabled as this is quite noisy.
                        // console.log(msg);

                        this.setState({
                            xCoordinate: msg.pos.x,
                            yCoordinate: msg.pos.y,
                            zCoordinate: msg.pos.z,
                            altitude: msg.altitude,
                            bearing: msg.bearing,
                            depth: msg.depth,
                            pitch: msg.pitch,
                            roll: msg.roll,
                            yaw: msg.yaw,
                            speed: msg.speed
                        });
                    } else if (msg.__clazz__ === 'org.arl.jc2.messages.MissionStatusNtf') {
                        console.log(msg);
                    }
                });

				this.management = new Management(this.gateway);
				this.management.getVehicleId()
					.then(vehicleId => {
						console.log('vehicleId', vehicleId);
						this.vehicleId = vehicleId;
					})
					.catch(reason => {
						console.log('could not get vehicle ID', reason);
					});
            }
        });
    }

    componentWillUnmount() {
        this.gateway.close();
    }

    radians_to_degrees(radians) {
        const pi = Math.PI;
        return radians * (180 / pi);
    }

    render() {
		if (this.vehicleId) {
			document.title = this.vehicleId + " Dashboard";
		} else {
			document.title = "Dashboard";
		}
        const gaugeContainerStyle = {
            padding: "10px",
			margin: "5px",
			backgroundColor: "#eeeeee",
        };
        return (
            <HotKeys keyMap={this.keyMap} handlers={this.handlers}>
                <Container>
                    <Row>
                        <div style={gaugeContainerStyle}>
                            <D3AngularComponent title="Roll" ref="Roll" val={this.radians_to_degrees(this.state.roll)}
                                                minValue={0} maxValue={360} centralIcon={FrontIcon}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3AngularComponent title="Pitch" ref="Pitch"
                                                val={this.radians_to_degrees(this.state.pitch)} minValue={0}
                                                maxValue={360}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3BearingComponent title="Bearing" ref="Bearing" val={this.state.bearing} minValue={0}
                                                maxValue={360}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3GaugeComponent title="Thrust" ref="Thrust" val={0.0} minValue={-100} maxValue={100}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3GaugeComponent title="Speed" ref="Speed" val={this.state.speed}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3GaugeComponent title="Depth" ref="Depth" val={this.state.depth} minValue={0}
                                              maxValue={10}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3GaugeComponent title="Altitude" ref="Altitude" val={this.state.altitude} minValue={0}
                                              maxValue={10}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3GaugeComponent title="LElevator" ref="LElevator" val={this.radians_to_degrees(0.0)}
                                              minValue={-90} maxValue={90}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3GaugeComponent title="Rudder" ref="Rudder" val={this.radians_to_degrees(0.0)}
                                              minValue={-90} maxValue={90}/>
                        </div>
                        <div style={gaugeContainerStyle}>
                            <D3GaugeComponent title="RElevator" ref="RElevator" val={this.radians_to_degrees(0.0)}
                                              minValue={-90} maxValue={90}/>
                        </div>
                    </Row>
                </Container>
            </HotKeys>
        );
    }
}

export default GaugeDashboard;
