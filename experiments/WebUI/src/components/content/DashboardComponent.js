import React, {PureComponent} from 'react';
import {Button, ButtonToolbar, Navbar} from 'react-bootstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSync} from "@fortawesome/free-solid-svg-icons";
import {css, StyleSheet} from "aphrodite";
import {FjageHelper} from "../../assets/fjageHelper";
import {Management} from "../../assets/jc2";
import {HotKeys} from "react-hotkeys";
import D3AngularComponent from "./D3AngularComponent";
import FrontIcon from "../../assets/img/submarine-front-view.svg";
import D3BearingComponent from "./D3BearingComponent";
import D3GaugeComponent from "./D3GaugeComponent";

const styles = StyleSheet.create({
    container0: {
        padding: "1em",
    },
    container: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    gaugeContainer: {
        padding: "10px",
        margin: "5px",
        backgroundColor: "#eeeeee",
    },
});

class DashboardComponent
    extends PureComponent {

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

    hotkeyHandlers = {
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
        this._updateVehicleId(null);

        this.gateway.addConnListener((connected) => {
            if (connected) {
                this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.VEHICLESTATUS'));
                this.gateway.addMessageListener((msg) => {
                    if (msg.__clazz__ === 'org.arl.jc2.messages.VehicleStatus') {
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
                            speed: msg.speed,
                        });
                    }
                });

                this.management = new Management(this.gateway);

                this.management.getVehicleId()
                    .then(vehicleId => {
                        this._updateVehicleId(vehicleId);
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

    render() {
        return (
            <div>
                <Navbar bg="light">
                    <Navbar.Brand>Dashboard</Navbar.Brand>
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
                <div className={css(styles.container0)}>
                    <HotKeys keyMap={this.keyMap}
                             handlers={this.hotkeyHandlers}>
                        <div className={css(styles.container)}>
                            <div className={css(styles.gaugeContainer)}>
                                <D3AngularComponent title="Roll"
                                                    ref="Roll"
                                                    val={this._radiansToDegrees(this.state.roll)}
                                                    minValue={0}
                                                    maxValue={360}
                                                    centralIcon={FrontIcon}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3AngularComponent title="Pitch"
                                                    ref="Pitch"
                                                    val={this._radiansToDegrees(this.state.pitch)}
                                                    minValue={0}
                                                    maxValue={360}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3BearingComponent title="Bearing"
                                                    ref="Bearing"
                                                    val={this.state.bearing}
                                                    minValue={0}
                                                    maxValue={360}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3GaugeComponent title="Thrust"
                                                  ref="Thrust"
                                                  val={0.0}
                                                  minValue={-100}
                                                  maxValue={100}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3GaugeComponent title="Speed"
                                                  ref="Speed"
                                                  val={this.state.speed}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3GaugeComponent title="Depth"
                                                  ref="Depth"
                                                  val={this.state.depth}
                                                  minValue={0}
                                                  maxValue={10}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3GaugeComponent title="Altitude"
                                                  ref="Altitude"
                                                  val={this.state.altitude}
                                                  minValue={0}
                                                  maxValue={10}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3GaugeComponent title="LElevator"
                                                  ref="LElevator"
                                                  val={this._radiansToDegrees(0.0)}
                                                  minValue={-90}
                                                  maxValue={90}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3GaugeComponent title="Rudder"
                                                  ref="Rudder"
                                                  val={this._radiansToDegrees(0.0)}
                                                  minValue={-90}
                                                  maxValue={90}/>
                            </div>
                            <div className={css(styles.gaugeContainer)}>
                                <D3GaugeComponent title="RElevator"
                                                  ref="RElevator"
                                                  val={this._radiansToDegrees(0.0)}
                                                  minValue={-90}
                                                  maxValue={90}/>
                            </div>
                        </div>
                    </HotKeys>
                </div>
            </div>
        );
    }

    _onRefresh = function () {
        // TODO
    }.bind(this);

    _updateVehicleId(vehicleId) {
        if (vehicleId) {
            document.title = vehicleId + " Dashboard";
        } else {
            document.title = "Dashboard";
        }
    }

    _radiansToDegrees(radians) {
        const pi = Math.PI;
        return radians * (180 / pi);
    }
}

export default DashboardComponent;
