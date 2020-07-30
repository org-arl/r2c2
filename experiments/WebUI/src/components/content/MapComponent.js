import React from 'react'
import {Map as LeafletMap, TileLayer} from 'react-leaflet';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faBan,
    faCrosshairs,
    faHome,
    faSatellite,
    faSave,
    faTrashAlt,
    faUndo,
    faWindowClose,
    faMinusCircle,
} from '@fortawesome/free-solid-svg-icons'
import {Button, Container, Row} from 'react-bootstrap';
import {css, StyleSheet} from 'aphrodite';

import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import fenceIcon from '../../assets/img/fence.svg';
import missionPtsIcon from '../../assets/img/missionPtsIcon.svg';
import pathIcon from '../../assets/img/path.svg';

import CoordSys from "../../assets/CoordSys";
import {FjageHelper} from "../../assets/fjageHelper";
import {Management} from "../../assets/jc2";

import ToolbarComponent from "../ToolbarComponent";

import MissionPlannerContext from "./MissionPlanner";
import MissionPlannerMapElement from "./MissionPlannerMapElement";
import MissionPlannerMissionsComponent from "./MissionPlannerMissionsComponent";
import "../../assets/MissionPlanner.css";

import CoordSysContext from "../map/CoordSysContext";
import CursorPositionComponent from "../map/CursorPositionComponent";
import GeoFenceEditorMapElement from "../map/GeoFenceEditorMapElement";
import GeoFenceMapElement from "../map/GeoFenceMapElement";
import MissionMapElement from "../map/MissionMapElement";
import VehicleMapElement from "../map/VehicleMapElement";
import VehicleTrailMapElement from "../map/VehicleTrailMapElement";

console.log('process.env.REACT_APP_MAP_TILE_URL', process.env.REACT_APP_MAP_TILE_URL);

toast.configure();

const tileUrl = process.env.REACT_APP_MAP_TILE_URL
    ? process.env.REACT_APP_MAP_TILE_URL
    : process.env.PUBLIC_URL + '/osm/tiles/{z}/{x}/{y}.png';

const styles = StyleSheet.create({
    map_options_styles: {
        position: "absolute",
        zIndex: "1000",
        marginTop: "10px",
        marginLeft: "60px"
    }
});

const MODE_NONE = 0;
const MODE_GEOFENCE_EDITOR = 1;
const MODE_MISSION_PLANNER = 2;

const TOAST_AUTOCLOSE = {
    position: toast.POSITION.BOTTOM_RIGHT,
    autoClose: true,
};

const TOAST_NO_AUTOCLOSE = {
    position: toast.POSITION.BOTTOM_RIGHT,
    autoClose: false,
};

class MapComponent
    extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.gateway = FjageHelper.getGateway();

        this.state = {
            mode: MODE_NONE,

            mapCenter: [1.3521, 103.8198],
            mapZoom: 12,

            origin: null,
            coordSys: null,

            cursorPosition: null,

            vehiclePositionLocal: null,
            vehicleErrorRadius: 60,
            vehicleReady: false,

            geoFence: null,

            missionDefinitions: null,
            mission: null,

            displayVehicle: true,
            displayVehiclePath: true,
            displayGeoFence: true,
            displayMission: true,


            drawGeoFence: [],

            missionPlannerContext: {
                coordSys: null,
                missionIndex: -1,
                mission: null,
                taskIndex: -1,
                task: null,
            },
        };

        this.vehicleId = null;

        this.vehicleTrailRef = React.createRef();
        this.geoFenceEditorRef = React.createRef();
        this.missionTreeViewRef = React.createRef();
    }

    componentDidMount() {
        this.gateway.addConnListener((connected) => {
            if (connected) {
                this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.VEHICLESTATUS'));
                this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.MISSIONSTATUS'));
                this.gateway.addMessageListener((msg) => {
                    if (msg.__clazz__ === 'org.arl.jc2.messages.VehicleStatus') {
                        this._updateVehiclePosition({
                            x: msg.pos.x,
                            y: msg.pos.y,
                        });
                    } else if (msg.__clazz__ === 'org.arl.jc2.messages.MissionStatusNtf') {
                        console.log(msg);
                    }
                });

                this.management = new Management(this.gateway);

                this.management.getOrigin()
                    .then(response => {
                        this._updateOrigin({
                            latitude: response.latitude,
                            longitude: response.longitude
                        });
                    })
                    .catch(reason => {
                        console.log('could not get origin', reason);
                        toast.error("FATAL: Could not get origin!", TOAST_AUTOCLOSE);
                    });

                this.management.getVehicleId()
                    .then(vehicleId => {
                        console.log('vehicleId', vehicleId);
                        this.vehicleId = vehicleId;
                        document.title = vehicleId + " StarControl";
                    })
                    .catch(reason => {
                        console.log('could not get vehicle ID', reason);
                        toast.error("FATAL: Could not get vehicle ID!", TOAST_AUTOCLOSE);
                    });

                this.management.getGeofence()
                    .then(response => {
                        this._updateGeoFence(response);
                    })
                    .catch(reason => {
                        console.log('could not get geofence', reason);
                        toast.error("FATAL: Could not get geofence!", TOAST_AUTOCLOSE);
                    });

                this.management.getMissions()
                    .then(missionDefinitions => {
                        this._updateMissionDefinitions(missionDefinitions);
                    })
                    .catch(reason => {
                        console.log('could not get missions', reason);
                        toast.error("FATAL: Could not get missions!", TOAST_AUTOCLOSE);
                    });

                this.management.getMeasurement("Position", 4, 1.0)
                    .then(measurement => {
                        let xPosErr = NaN;
                        let yPosErr = NaN;
                        measurement.items.forEach(item => {
                            if (item.type === 'MQ_XPOS_ERR') {
                                xPosErr = parseFloat(item.value);
                            } else if (item.type === 'MQ_YPOS_ERR') {
                                yPosErr = parseFloat(item.value);
                            }
                        });
                        if (!isNaN(xPosErr) && !isNaN(yPosErr)) {
                            const vehicleErrorRadius = (xPosErr + yPosErr) / 2;
                            this.setState({
                                vehicleErrorRadius: vehicleErrorRadius,
                            });
                        }
                    })
                    .catch(reason => {
                        console.log('could not get measurement', reason);
                    });
            }
        });

        this._setVehicleNotReady();
        // Simulate vehicle readiness UI
        setTimeout(() => this._setVehicleReady(), 5000);

        // Simulate map position accuracy UI
        setInterval(
            () => {
                if (this.state.vehicleErrorRadius > 30) {
                    this.setState({
                        vehicleErrorRadius: this.state.vehicleErrorRadius - 1,
                    });
                }
            },
            200);
    }

    componentWillUnmount() {
        this.gateway.close();
    }

    render() {
        const inNormalMode = (this.state.mode === MODE_NONE);
        const inGeofenceEditor = (this.state.mode === MODE_GEOFENCE_EDITOR);
        const inMissionPlanner = (this.state.mode === MODE_MISSION_PLANNER);

        return (
            <CoordSysContext.Provider value={this.state.coordSys}>
                <MissionPlannerContext.Provider value={this.state.missionPlannerContext}>
                    <LeafletMap ref={(ref) => this.mapRef = ref}
                                center={this.state.mapCenter}
                                zoom={this.state.mapZoom}
                                onContextMenu={(e) => this._onMapRightClick(e)}
                                onMouseMove={(e) => this._onMouseMove(e)}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url={tileUrl}
                            minZoom={1}
                            maxZoom={17}
                        />

                        {(inNormalMode || inMissionPlanner) && this.state.displayGeoFence && (
                            <GeoFenceMapElement id="geofence"
                                                points={this.state.geoFence}
                                                color="red"/>
                        )}

                        {inGeofenceEditor && (
                            <GeoFenceEditorMapElement id="geofenceEditor"
                                                      ref={this.geoFenceEditorRef}
                                                      points={this.state.geoFence}
                                                      color="blue"/>
                        )}

                        {inNormalMode && this.state.displayMission && this.state.mission && (
                            <MissionMapElement id="mission"
                                               mission={this.state.mission}
                                               color="green"/>
                        )}

                        <VehicleTrailMapElement id="vehicleTrail"
                                                ref={this.vehicleTrailRef}
                                                hidden={!inNormalMode || !this.state.displayVehiclePath}
                                                color="yellow"
                                                maxSize={1000}/>

                        {this.state.displayVehicle && (
                            <VehicleMapElement id="vehicle"
                                               point={this.state.vehiclePositionLocal}
                                               errorRadius={this.state.vehicleErrorRadius}
                                               ready={this.state.vehicleReady}/>
                        )}

                        {inMissionPlanner && (
                            <MissionPlannerMapElement/>
                        )}
                    </LeafletMap>

                    <Container className={css(styles.map_options_styles)}>
                        <Row>
                            <ToolbarComponent onClick={(item) => {
                                this._openNewWindow(item)
                            }}/>
                            <div className="dropdown_styles">
                                <Button>Missions</Button>
                                <div className="dropdown_content">
                                    {this.state.missionDefinitions && this.state.missionDefinitions.missions.map((mission, index) => {
                                        return (
                                            <div key={index}>
                                                {index + 1}
                                                &nbsp;
                                                <Button
                                                    onClick={(e) => this._onViewMission(mission, index)}>View</Button>
                                                &nbsp;
                                                <Button onClick={(e) => this._onRunMission(mission, index)}>Run</Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button onClick={(e) => this._onCloseAllChildWindows(e)}>
                                <FontAwesomeIcon icon={faWindowClose} title="Close all child windows"/>
                            </Button>

                            <Button onClick={(e) => this._onRecentreMap(e)}>
                                <FontAwesomeIcon icon={faCrosshairs} title="Re-center map"/>
                            </Button>
                            <Button active={this.state.displayGeoFence}
                                    onClick={(e) => this._onToggleGeoFence(e)}>
                                <img title="Toggle geofence" src={fenceIcon} height={20} width={20}
                                     alt="Toggle geofence"/>
                            </Button>
                            <Button active={this.state.displayMission}
                                    onClick={(e) => this._onToggleMission(e)}>
                                <img title="Toggle mission points" src={missionPtsIcon} height={25} width={25}
                                     alt="Toggle mission points"/>
                            </Button>
                            <Button active={this.state.displayVehiclePath}
                                    onClick={(e) => this._onToggleVehiclePath(e)}>
                                <img title="Toggle vehicle path" src={pathIcon} height={20} width={20}
                                     alt="Toggle vehicle path"/>
                            </Button>

                            <div className="mission_options">
                                <Button onClick={(e) => this._onAbortMission(e)}>
                                    <FontAwesomeIcon icon={faBan} title="Abort mission"/>
                                </Button>
                                <Button onClick={(e) => this._onStationKeep(e)}>
                                    <FontAwesomeIcon icon={faSatellite} title="Station-keep"/>
                                </Button>
                                <Button onClick={(e) => this._onGoHome(e)}>
                                    <FontAwesomeIcon icon={faHome} title="Go home"/>
                                </Button>
                            </div>

                            <div className="drawGeoFence_styles">
                                <Button onClick={(e) => this._onToggleGeofenceEditor(e)}>
                                    Draw GeoFence
                                </Button>
                                {inGeofenceEditor && (
                                    <div className="drawGeoFence_content">
                                        <Button title="Undo"
                                                onClick={(e) => this._onGeoFenceEditorUndo(e)}>
                                            <FontAwesomeIcon icon={faUndo} color="#fff"/>
                                        </Button>
                                        <Button title="Clear"
                                                onClick={(e) => this._onGeoFenceEditorClear(e)}>
                                            <FontAwesomeIcon icon={faTrashAlt} color="#fff"/>
                                        </Button>
                                        <Button title="Save"
                                                onClick={(e) => this._onGeoFenceEditorSave(e)}>
                                            <FontAwesomeIcon icon={faSave} color="#fff"/>
                                        </Button>
                                        <Button title="Cancel"
                                                onClick={(e) => this._onGeoFenceEditorCancel(e)}>
                                            <FontAwesomeIcon icon={faWindowClose} color="#fff"/>
                                        </Button>
                                        <Button title="Delete point"
                                                onClick={(e) => this._onGeoFenceEditorDeletePoint(e)}>
                                            <FontAwesomeIcon icon={faMinusCircle} color="#fff"/>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Button active={inMissionPlanner}
                                        onClick={(e) => this._onToggleMissionPlanner(e)}>
                                    MissionPlanner
                                </Button>
                            </div>
                        </Row>

                        {inMissionPlanner && (
                            <Row>
                                <MissionPlannerMissionsComponent ref={this.missionTreeViewRef}
                                                                 missions={this.state.missions}
                                                                 management={this.management}
                                                                 onMissionUpdated={(mission, index) => this._onMissionUpdated(mission, index)}
                                                                 onMissionDeleted={(index) => this._onMissionDeleted(index)}/>
                            </Row>
                        )}

                        <CursorPositionComponent position={this.state.cursorPosition}/>
                    </Container>
                </MissionPlannerContext.Provider>
            </CoordSysContext.Provider>
        );
    }

    // ----

    _updateOrigin(origin) {
        this.setState({
            origin: origin,
            coordSys: new CoordSys(origin.latitude, origin.longitude),
            mapCenter: [origin.latitude, origin.longitude],
        }, () => this._fitMapToBounds());
    }

    _updateGeoFence(geoFence) {
        this.setState({
            geoFence: geoFence,
        }, () => this._fitMapToBounds());
    }

    _updateMissionDefinitions(missionDefinitions) {
        this.setState({
            missionDefinitions: missionDefinitions,
        });
    }

    _fitMapToBounds() {
        if (!this.state.coordSys) {
            return;
        }
        const points = [];
        if (this.state.geoFence) {
            const localBounds = this._getBounds(this.state.geoFence.map(point => [point.x, point.y]));
            if (localBounds) {
                points.push(...localBounds);
            }
        }
        if (this.state.vehiclePositionLocal) {
            points.push([this.state.vehiclePositionLocal.x, this.state.vehiclePositionLocal.y]);
        }
        if (points.length > 1) {
            const localBounds = this._getBounds(points);
            const globalBounds = [
                [
                    this.state.coordSys.locy2lat(localBounds[0][1]),
                    this.state.coordSys.locx2long(localBounds[0][0]),
                ],
                [
                    this.state.coordSys.locy2lat(localBounds[1][1]),
                    this.state.coordSys.locx2long(localBounds[1][0]),
                ],
            ];
            this.mapRef.leafletElement.fitBounds(globalBounds);
        }
    }

    _updateVehiclePosition(point) {
        this.setState({
            vehiclePositionLocal: point,
        });
        if (this.vehicleTrailRef.current) {
            this.vehicleTrailRef.current.addPoint(point);
        }
    }

    // ----

    _onMouseMove(e) {
        this.setState({
            cursorPosition: {
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
            },
        });
    }

    _onMapRightClick(e) {
        if (this.state.mode === MODE_MISSION_PLANNER) {
            if (this.missionTreeViewRef.current) {
                this.missionTreeViewRef.current.handleEvent(e);
            }
        } else if (this.state.mode === MODE_GEOFENCE_EDITOR) {
            if (this.geoFenceEditorRef.current) {
                this.geoFenceEditorRef.current.handleEvent(e);
            }
        }
    }

    // ---- geofence editor ----

    _onToggleGeofenceEditor(e) {
        this.setState({
            mode: (this.state.mode !== MODE_GEOFENCE_EDITOR) ? MODE_GEOFENCE_EDITOR : MODE_NONE,
        })
    }

    _onGeoFenceEditorUndo(e) {
        if (this.geoFenceEditorRef.current) {
            this.geoFenceEditorRef.current.undo();
        }
    }

    _onGeoFenceEditorClear(e) {
        if (this.geoFenceEditorRef.current) {
            this.geoFenceEditorRef.current.clear();
        }
    }

    _onGeoFenceEditorDeletePoint(e) {
        if (this.geoFenceEditorRef.current) {
            this.geoFenceEditorRef.current.deleteSelectedPoint();
        }
    }

    _onGeoFenceEditorSave(e) {
        if (!this.geoFenceEditorRef.current) {
            return;
        }
        const geoFence = this.geoFenceEditorRef.current.getPoints();
        this.management.updateGeofence(geoFence)
            .then(response => {
                this.setState({
                    mode: MODE_NONE,
                    geoFence: geoFence,
                });
                toast.success("Geofence updated!", TOAST_AUTOCLOSE);
            })
            .catch(reason => {
                console.log('Could not update geofence ', reason);
                toast.error("FATAL: Could not update geofence!", TOAST_AUTOCLOSE);
            });
    }

    _onGeoFenceEditorCancel(e) {
        this.setState({
            mode: MODE_NONE,
        });
    }

    // ---- window management ----

    _openNewWindow(item) {
        const href = window.location.href;
        const url = href.substring(0, href.lastIndexOf('/') + 1) + item;
        const w = window.open(url, item,
            "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1");
        if (w) {
            w.focus();
        }
    }

    _onCloseAllChildWindows(e) {
        const windowsArr = ["Dashboard", "Diagnostics", "Sentuators", "ScriptControl"];
        windowsArr.forEach((tab) => {
            const href = window.location.href;
            const url = href.substring(0, href.lastIndexOf('/') + 1) + tab;
            const w = window.open(url, tab,
                "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1");
            if (w) {
                w.close();
            }
        });
    }

    // ---- mission planner ----

    _onMissionUpdated(mission, index) {
        const missions = this.state.missions;
        if ((index < 0) || (index >= missions.length)) {
            return;
        }
        missions[index] = mission;
        this.setState({
            missions: [...missions],
        });
    }

    _onMissionDeleted(index) {
        const missions = this.state.missions;
        if ((index < 0) || (index >= missions.length)) {
            return;
        }
        missions.splice(index, 1);
        this.setState({
            missions: [...missions],
        });
    }

    _onToggleMissionPlanner(e) {
        this.setState({
            mode: (this.state.mode !== MODE_MISSION_PLANNER) ? MODE_MISSION_PLANNER : MODE_NONE,
        });
    }

    // ---- vehicle status ----

    _setVehicleReady() {
        if (this.vehicleStatusToastId) {
            toast.dismiss(this.vehicleStatusToastId);
            this.vehicleStatusToastId = null;
        }
        this.vehicleStatusToastId = toast.success("Vehicle is ready!", TOAST_NO_AUTOCLOSE);
        this.setState({
            vehicleReady: true,
        });
    }

    _setVehicleNotReady() {
        if (this.vehicleStatusToastId) {
            toast.dismiss(this.vehicleStatusToastId);
            this.vehicleStatusToastId = null;
        }
        this.vehicleStatusToastId = toast.error("Vehicle is not ready!", TOAST_NO_AUTOCLOSE);
        this.setState({
            vehicleReady: false,
        });
    }

    // ---- mission viewer/runner ----

    _onViewMission(mission, index) {
        this.setState({
            displayMission: true,
            mission: mission,
        });
    }

    _onRunMission(mission, index) {
        // TODO handle edited missions
        /**
         if (this.state.editedMissions[index] === 1) {
            alert("Error: Unsaved Changes. Save mission to vehicle before running.");
            return;
        }
         */
        this._onViewMission(mission, index);
        // TODO should there be some response to check if mission has been run?
        this.management.runMission(index + 1);
    }

    // ---- map controls ----

    _onRecentreMap(e) {
        this._fitMapToBounds();
    }

    _onToggleGeoFence(e) {
        this.setState({
            displayGeoFence: !this.state.displayGeoFence,
        });
    }

    _onToggleMission(e) {
        this.setState({
            displayMission: !this.state.displayMission,
        });
    }

    _onToggleVehiclePath(e) {
        this.setState({
            displayVehiclePath: !this.state.displayVehiclePath,
        });
    }

    // ---- operator commands ----

    _onAbortMission(e) {
        console.log("Abort Mission!");
        this.management.abortMission();
    }

    _onStationKeep(e) {
        console.log("Station Keep!");
        this.management.stationKeep();
    }

    _onGoHome(e) {
        console.log("Go Home!");
        this.management.abortToHome();
    }

    // ---- map methods ----

    _getBounds(points) {
        if (!points || (points.length === 0)) {
            return null;
        }
        const defaultPoint = [];
        for (let j = 0; j < 2; j++) {
            defaultPoint.push(points[0][j]);
        }
        const minArray = [...defaultPoint];
        const maxArray = [...defaultPoint];
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            for (let j = 0; j < 2; j++) {
                const value = point[j];
                if (value < minArray[j]) {
                    minArray[j] = value;
                } else if (value > maxArray[j]) {
                    maxArray[j] = value;
                }
            }
        }
        return [minArray, maxArray];
    }
}

export default MapComponent;
