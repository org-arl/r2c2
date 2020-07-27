import React from 'react'
import { Map as LeafletMap, Marker, Popup, TileLayer, Circle, Polygon, Polyline } from 'react-leaflet';

import CursorPositionComponent from './CursorPositionComponent';

import CoordSys from '../../assets/CoordSys.js';

import { FjageHelper } from "../../assets/fjageHelper.js";
import { Management } from "../../assets/jc2.js";
import { mapPin, readyMarker, notReadyMarker } from "../../assets/MapIcons.js";
import ToolbarComponent from '../ToolbarComponent';

import { Row, Container, Button } from 'react-bootstrap';

import { StyleSheet, css } from 'aphrodite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs, faUndo, faSave, faWindowClose, faHome, faBan, faSatellite, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import fenceIcon from '../../assets/img/fence.svg';
import missionPtsIcon from '../../assets/img/missionPtsIcon.svg';
import pathIcon from '../../assets/img/path.svg';

import MissionPlannerContext from "./MissionPlanner";
import MissionPlannerMapElement from "./MissionPlannerMapElement";
import MissionPlannerMissionsComponent from "./MissionPlannerMissionsComponent";
import '../../assets/MissionPlanner.css';

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

class MapComponent
	extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.gateway = FjageHelper.getGateway();

		const origin = {
			latitude: 1.315456,
			longitude: 103.737608
		};
		this.coordSys = new CoordSys(origin.latitude, origin.longitude);
		const mapBoundaries = [
			[1.319525, 103.741806],
			[1.315456, 103.737608]
		];

		this.state = {
			mapCenter: {
				latitude: 1.311457,
				longitude: 103.744088
			},
			vehiclePosition : {
				latitude: 1.303457,
				longitude: 103.736088,
				x: 0,
				y: 0
			},
			positionError: 60,
			zoom: 15,
			origin: origin,
			mapBoundaries: mapBoundaries,
			geoFenceCoordinates: [],
			polylineArray: [],
			pathLimit: 1000,

			displayGeoFence: true,
			displayMissionPts: true,
			displayVehiclePath: true,
			displayVehicle: true,

			drawingGeoFence: false,
			drawGeoFence: [],
			cursorPosition: {
				latitude: 1.303457,
				longitude: 103.736088,
				x: 0.0,
				y: 0.0
			},

			missions: null, //all missions
			editedMissions: null, //shows status of a mission (whether changes have been saved to vehicle) For each mission, 0: unedited, 1: edited.

			// -1 depicts that no mission is displayed on screen. Which is the default.
			missionNumber: -1,

			currentMission: [],
			missionPlannerEnabled: false,

			missionPlannerContext: {
				coordSys: this.coordSys,
				missionIndex: -1,
				mission: null,
				taskIndex: -1,
				task: null,
			},
		};

		this.runMission = this.runMission.bind(this);
		this.viewMission = this.viewMission.bind(this);
		this.setVehicleReady = this.setVehicleReady.bind(this);
		this.setVehicleNotReady = this.setVehicleNotReady.bind(this);

		this.enableDrawGeofence = this.enableDrawGeofence.bind(this);
		this.undoGeoFencePoint = this.undoGeoFencePoint.bind(this);
		this.saveNewGeoFence = this.saveNewGeoFence.bind(this);
		this.clearNewGeoFence = this.clearNewGeoFence.bind(this);
		this.cancelNewGeoFence = this.cancelNewGeoFence.bind(this);

		this.checkCollinear = this.checkCollinear.bind(this);
		this.mapOnRightClick = this.mapOnRightClick.bind(this);

		this.dragEndGeoFenceMarker = this.dragEndGeoFenceMarker.bind(this);

		this.vehicleMarker = readyMarker;

		this.vehicleId = null;

		this.missionTreeViewRef = React.createRef();
	}

	componentDidMount() {
		this.gateway.addConnListener((connected) => {
			if (connected) {
				this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.VEHICLESTATUS'));
				this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.MISSIONSTATUS'));
				this.gateway.addMessageListener((msg) => {
					if (msg.__clazz__ === 'org.arl.jc2.messages.VehicleStatus') {
						const lat = this.coordSys.locy2lat(msg.pos.y);
						const long = this.coordSys.locx2long(msg.pos.x);

						if(this.state.polylineArray.length >= this.state.pathLimit){
							// var x = 1;
							for (var i = 1; i < this.state.polylineArray.length - 1; i++) {
								this.state.polylineArray.splice(i,1);
							}
						}
						this.setState({
							vehiclePosition:{
								latitude: lat,
								longitude: long,
								x: msg.pos.x,
								y: msg.pos.y
							},
							polylineArray: [
								...this.state.polylineArray,
								[lat, long]
							]
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
						document.title = vehicleId + " StarControl";
					})
					.catch(reason => {
						console.log('could not get vehicle ID', reason);
					});

				this.management.getMissions()
					.then(missionDefinitions => {
						console.log('missionDefinitions', missionDefinitions);
						this.setState({
							missions: missionDefinitions.missions,
							editedMissions: new Array(missionDefinitions.missions.length).fill(0)
						});
					})
					.catch(reason => {
						console.log('could not get missions', reason);
					});

				this.management.getOrigin()
					.then(response => {
						this.setState({
							origin: {
								latitude: response.latitude,
								longitude: response.longitude
							},
							polylineArray: []
						});
						this.coordSys.updateOrigin(this.state.origin.latitude, this.state.origin.longitude);
					})
					.catch(reason => {
						console.log('could not get origin', reason);
					});

				this.management.getGeofence()
					.then(response => {
						const geoFenceCoordinates = response
							.map((element) => [this.coordSys.locy2lat(element.y), this.coordSys.locx2long(element.x)]);
						this._setMapBoundaries([
							...geoFenceCoordinates,
							[this.state.vehiclePosition.latitude, this.state.vehiclePosition.longitude],
						]);
						this.setState({
							geoFenceCoordinates: geoFenceCoordinates,
						});
					})
					.catch(reason => {
						console.log('could not get geofence', reason);
					});

				this.management.getMeasurement("Position", 4, 1.0)
					.then(measurement => {
						var measurementObj = measurement.items;
						if (!isNaN(measurementObj[2].value) && isNaN(measurementObj[3].value)) {
							this.setState({
								positionError: (measurementObj[2].value + measurementObj[3].value) / 2
							});
						}
					})
					.catch(reason => {
						console.log('could not get measurement', reason);
					});
			}
		});

		this.setVehicleNotReady();

		// Simulate vehicle rediness UI
		setTimeout(this.setVehicleReady, 5000);

		// Simulate map position accuracy UI
		setInterval(
			() => {if(this.state.positionError > 30) this.setState({
				positionError: this.state.positionError - 1
			})},
		200);
	}

	componentWillUnmount() {
		this.gateway.close();
	}

	setVehicleReady(){
		toast.dismiss();
		toast.success("Vehicle is ready !", {
			position: toast.POSITION.BOTTOM_RIGHT,
			autoClose: false
		});
		this.vehicleMarker = readyMarker;
	}

	setVehicleNotReady(){
		toast.dismiss();
		toast.error("Vehicle is not ready !", {
			position: toast.POSITION.BOTTOM_RIGHT,
			autoClose: false
		});
		this.vehicleMarker = notReadyMarker;
	}

	runMission(num) {
		if (this.state.editedMissions[num] === 1) {
			alert("Error: Unsaved Changes. Save mission to vehicle before running.");
			return;
		}
		this.viewMission(num);
		//todo: should there be some response to check if mission has been run?
		this.management.runMission(parseInt(num) + 1);
	}

	_clearViewedMission() {
		this.setState({
			missionNumber: -1,
			currentMission: []
		});
	}

	viewMission(missionIndex) {
		if (this.state.missions === null) {
			console.log('no missions available');
			this._clearViewedMission();
			return;
		}
		if (missionIndex === -1) {
			this._clearViewedMission();
			return;
		}
		if ((missionIndex < 0) || (missionIndex >= this.state.missions.length)) {
			console.log('invalid mission number');
			this._clearViewedMission();
			return;
		}

		const mission = this.state.missions[missionIndex];
		const points = [];
		for (let i = 0; i < mission.tasks.length; i++) {
			const task = mission.tasks[i];
			const x = task.position.x;
			const y = task.position.y;
			const lat = this.coordSys.locy2lat(y);
			const long = this.coordSys.locx2long(x);
			points.push([lat,long]);
		}

		this.setState({
			displayMissionPts: true,
			missionNumber: missionIndex,
			currentMission: points
		});
	}

	enableDrawGeofence(e){
		if (!this.state.missionPlannerEnabled) {
			this.setState({
				drawingGeoFence: true,
				drawGeoFence: this.state.geoFenceCoordinates
			})
		}
	}

	undoGeoFencePoint() {
		var array = [...this.state.drawGeoFence];
		if (array.length > 0) {
			array.splice(-1, 1);
			this.setState({drawGeoFence: array});
		}
	}

	saveNewGeoFence(e){
		console.log("Saving new geofence");
		this.management.updateGeofence(this.state.drawGeoFence)
		.then(response => {
			this.setState({
				drawingGeoFence: false,
				geoFenceCoordinates: this.state.drawGeoFence,
			});
		})
		.catch(reason => {
			console.log('Could not update geofence ', reason);
		});

	}

	clearNewGeoFence(e){
		this.setState({
			drawGeoFence: []
		});
	}

	cancelNewGeoFence(e){
		this.setState({
			drawingGeoFence: false,
			drawGeoFence: []
		});
	}

	openNewWindow(tab) {
		const href = window.location.href;
		const url = href.substring(0, href.lastIndexOf('/') + 1) + tab;
		var w = window.open(url, tab, "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1").focus();
	}

	closeAllChildWindows(){
		var windowsArr = ["Dashboard", "Diagnostics", "Sentuators", "ScriptControl"];
		windowsArr.forEach((tab) => {
			const href = window.location.href;
			const url = href.substring(0, href.lastIndexOf('/') + 1) + tab;
			var w = window.open(url, tab, "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1");
			w.close();
		});
	}

	checkCollinear(pointArray, point) {
		// epsilon accounts for the error in checking if a point is collinear. Larger epsilon will result in wider range of points getting accepted as collinear(even those that lie further from the line segment).
		var epsilon = 0.0000005;
		// check if the point lies between any 2 of the consecutive mission points.
		for (var i = 1; i < pointArray.length; i++) {
			var crossProduct = (point[1] - pointArray[i-1][1]) * (pointArray[i][0] - pointArray[i-1][0]) - (point[0] - pointArray[i-1][0]) * (pointArray[i][1] - pointArray[i-1][1]);
			if(Math.abs(crossProduct) < epsilon){
				var dotProduct = (point[0] - pointArray[i-1][0]) * (pointArray[i][0] - pointArray[i-1][0]) + (point[1] - pointArray[i-1][1])*(pointArray[i][1] - pointArray[i-1][1]);
				if (dotProduct >= 0) {
					var squaredLength = (pointArray[i][0] - pointArray[i-1][0])*(pointArray[i][0] - pointArray[i-1][0]) + (pointArray[i][1] - pointArray[i-1][1])*(pointArray[i][1] - pointArray[i-1][1]);
					if (dotProduct <= squaredLength) {
						return i; //returns index on first match
					}
				}
			}
		}
		return -1; //if not collinear
	}

	mapOnRightClick(e) {
		if (this.missionTreeViewRef.current) {
			this.missionTreeViewRef.current.handleEvent(e);
		}
		const point = [e.latlng.lat, e.latlng.lng];
		if (this.state.drawingGeoFence) {
			const points = this.state.drawGeoFence;
			const index = this.checkCollinear(points, point);
			if (index === -1) {
				console.log("Appending point at the end");
				points.push(point);
			} else {
				console.log("Inserting point between collinear points");
				points.splice(index, 0, point);
			}
			this.setState({
				drawGeoFence: [...points],
			});
		}
	}

	dragEndGeoFenceMarker(e) {
		var newlat = e.target._latlng.lat;
		var newlng = e.target._latlng.lng;
		var oldlat = e.target.options.position[0];
		var oldlng = e.target.options.position[1];
		var drawGeoFenceArr = this.state.drawGeoFence;
		for (var i = 0; i < drawGeoFenceArr.length; i++) {
			if ( drawGeoFenceArr[i][0] === oldlat && drawGeoFenceArr[i][1] === oldlng ){
				drawGeoFenceArr[i] = [newlat, newlng];
				console.log("moved " + i);
			}
		}
		// hack to redraw the geofence polygon.
		this.setState({
			drawGeoFence: []
		});
		this.setState({
			drawGeoFence: drawGeoFenceArr
		});
	}

	// ----

	render() {
		const position = [this.state.vehiclePosition.latitude, this.state.vehiclePosition.longitude];
		const mapCenter = [this.state.mapCenter.latitude, this.state.mapCenter.longitude];

		if (this.state.missions != null) {
			var missionList = new Array(this.state.missions.length).fill(0).map((zero, index) =>
				<div key={index}> {index+1} <Button onClick={() => this.viewMission(index)}>View</Button> <Button onClick={() => this.runMission(index)}>Run</Button></div>
			);
		}

		// Create array containing mission points from the this.state.missions variable.
		var MissionPointsMarkers = [];
		var missionPtLatLngs = [];

		// Check if a legitimate mission is selected to be displayed (ie. this.state.missionNumber should not be -1).
		if (this.state.missionNumber !== -1) {
			for (var i=0; i < this.state.currentMission.length; i++){
				// console.log(this.state.missions);
				var lat = this.state.currentMission[i][0];
				var long = this.state.currentMission[i][1];
				var x = this.coordSys.long2locx(long);
				var y = this.coordSys.lat2locy(lat);

				MissionPointsMarkers.push(
					<Marker icon={mapPin}
							key={"MissionPT" + i}
							position={this.state.currentMission[i]}>
						<Popup>
							Lat: {lat.toFixed(4)}, Long: {long.toFixed(4)} <br/>
							x: {x.toFixed(2)}, y: {y.toFixed(2)}
						</Popup>
					</Marker>
				);

				missionPtLatLngs.push([lat, long]);
			}
		}

		const geoFence = (this.state.displayGeoFence && !this.state.drawingGeoFence) ? <Polygon id="geoFence" positions={this.state.geoFenceCoordinates} color="red"/> : null;

		const missionPts = (this.state.displayMissionPts && !this.state.drawingGeoFence) ? MissionPointsMarkers : null;

		const missionPath = (this.state.displayMissionPts && !this.state.drawingGeoFence) ? <Polyline id="missionPath" positions={missionPtLatLngs} color="green"/> : null;

		const vehiclePath = (this.state.displayVehiclePath && !this.state.drawingGeoFence) ? <Polyline id="vehiclePath" positions={this.state.polylineArray} color="yellow"/> : null;

		const drawGeoFenceOptions = (this.state.drawingGeoFence) ? <div className="drawGeoFence_content">
			<Button title="Undo last point" onClick={this.undoGeoFencePoint}><FontAwesomeIcon icon={faUndo} color="#fff" /></Button>
			<Button title="Save Geofence" onClick={this.saveNewGeoFence}><FontAwesomeIcon icon={faSave} color="#fff" /></Button>
			<Button title="Cancel Geofence" onClick={this.cancelNewGeoFence}><FontAwesomeIcon icon={faWindowClose} color="#fff" /></Button>
			<Button title="Clear Geofence" onClick={this.clearNewGeoFence}><FontAwesomeIcon icon={faTrashAlt} color="#fff" /></Button>
		</div> : null;

		const drawGeoFenceMarkers = [];
		if (this.state.drawingGeoFence) {
			for (var i = 0; i < this.state.drawGeoFence.length; i++) {
				drawGeoFenceMarkers.push(
					<Marker draggable={true} onDragEnd={this.dragEndGeoFenceMarker} icon={mapPin} key={"newGeoFence" + i} position={this.state.drawGeoFence[i]}/>
				);
			}
		}

		const vehicle = this.state.displayVehicle ?
		[<Marker icon={this.vehicleMarker} position={position}>
			<Popup>
				Lat: {this.state.vehiclePosition.latitude.toFixed(4)}, Long: {this.state.vehiclePosition.longitude.toFixed(4)} <br/>
				x: {this.state.vehiclePosition.x.toFixed(4)}, y: {this.state.vehiclePosition.y.toFixed(4)}
			</Popup>
		</Marker>,
		<Circle center={position} radius={this.state.positionError}/>] : null;

		return (
			<MissionPlannerContext.Provider value={this.state.missionPlannerContext}>
				<LeafletMap ref={(ref) => this.mapRef = ref}
							center={mapCenter}
							zoom={this.state.zoom}
							onContextMenu={this.mapOnRightClick}
							onMouseMove={(e) => this._onMouseMove(e)}>
					<TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							   url={tileUrl}
							   minZoom={1}
							   maxZoom={17}
					/>

					{vehicle}
					{geoFence}
					{missionPts}
					{missionPath}
					{vehiclePath}

					<Polygon id="drawGeoFence" positions={this.state.drawGeoFence} color="blue"/>
					{drawGeoFenceMarkers}

					{this.state.missionPlannerEnabled && (
						<MissionPlannerMapElement/>
					)}
				</LeafletMap>

				<Container className={css(styles.map_options_styles)}>
					<Row>
						<ToolbarComponent onClick={(clickedItem) => {this.openNewWindow(clickedItem)}}/>
						<div className="dropdown_styles">
							<Button>Missions</Button>
							<div className="dropdown_content">
								{missionList}
							</div>
						</div>

						<Button onClick={this.closeAllChildWindows}>
							<FontAwesomeIcon icon={faWindowClose} title="Close all child windows"/>
						</Button>

						<Button onClick={(e) => this._onRecentreMap(e)}>
							<FontAwesomeIcon icon={faCrosshairs} title="Re-center map"/>
						</Button>
						<Button active={this.state.displayGeoFence}
								onClick={(e) => this._onToggleGeoFence(e)}>
							<img title="Toggle geofence" src={fenceIcon} height={20} width={20}/>
						</Button>
						<Button active={this.state.displayMissionPts}
								onClick={(e) => this._onToggleMissionPts(e)}>
							<img title="Toggle mission points" src={missionPtsIcon} height={25} width={25}/>
						</Button>
						<Button active={this.state.displayVehiclePath}
								onClick={(e) => this._onToggleVehiclePath(e)}>
							<img title="Toggle vehicle path" src={pathIcon} height={20} width={20}/>
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
							<Button onClick={this.enableDrawGeofence}>
								Draw GeoFence
							</Button>
							{drawGeoFenceOptions}
						</div>

						<div>
							<Button active={this.state.missionPlannerEnabled}
									onClick={(e) => this._onToggleMissionPlanner(e)}>
								MissionPlanner
							</Button>
						</div>
					</Row>

					{this.state.missionPlannerEnabled && (
						<Row>
							<MissionPlannerMissionsComponent ref={this.missionTreeViewRef}
															 missions={this.state.missions}
															 management={this.management}
															 onMissionUpdated={(mission, index) => this._onMissionUpdated(mission, index)}
															 onMissionDeleted={(index) => this._onMissionDeleted(index)}/>
						</Row>
					)}

					<CursorPositionComponent position={this.state.cursorPosition} />
				</Container>
			</MissionPlannerContext.Provider>
		);
	}

	// ----

	_onMouseMove(e) {
		this.setState({
			cursorPosition: {
				latitude: e.latlng.lat.toFixed(6),
				longitude: e.latlng.lng.toFixed(6),
				x: this.coordSys.long2locx(e.latlng.lng).toFixed(3),
				y: this.coordSys.lat2locy(e.latlng.lat).toFixed(3)
			}
		});
	}

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
			missionPlannerEnabled: !this.state.missionPlannerEnabled,
		});
	}

	// ---- map controls ----

	_onRecentreMap(e) {
		this._setMapBoundaries([
			...this.state.geoFenceCoordinates,
			[this.state.vehiclePosition.latitude, this.state.vehiclePosition.longitude],
		]);
	}

	_onToggleGeoFence(e) {
		this.setState({
			displayGeoFence: !this.state.displayGeoFence,
		});
	}

	_onToggleMissionPts(e) {
		this.setState({
			displayMissionPts: !this.state.displayMissionPts,
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

	_setMapBoundaries(coords) {
		const mapBoundaries = this._determineMapBoundaries(coords);
		this.setState({
			mapBoundaries: mapBoundaries,
		});
		this.mapRef.leafletElement.fitBounds(mapBoundaries);
	}

	_determineMapBoundaries(coords) {
		let minLat, maxLat, minLong, maxLong;
		minLat = maxLat = coords[0][0];
		minLong = maxLong = coords[0][1];
		for (let i = 1; i < coords.length; i++) {
			const lat = coords[i][0];
			const long = coords[i][1];
			if (lat < minLat) {
				minLat = lat;
			}
			if (lat > maxLat) {
				maxLat = lat;
			}
			if (long < minLong) {
				minLong = long;
			}
			if (long > maxLong) {
				maxLong = long;
			}
		}
		return [[minLat, minLong],[maxLat, maxLong]];
	}
}

export default MapComponent;
