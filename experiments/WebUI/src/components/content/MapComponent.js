import React from 'react'
import { Map as LeafletMap, Marker, Popup, TileLayer, Circle, Polygon, Polyline } from 'react-leaflet';

import CursorPositionComponent from './CursorPositionComponent';

import MissionPlanner from './MissionPlanner';

import CoordSys from '../../assets/CoordSys.js';

import { FjageHelper } from "../../assets/fjageHelper.js";
import { Management, TargetLocMT } from "../../assets/jc2.js";
import { mapPin, mapPinSelected, readyMarker, notReadyMarker } from "../../assets/MapIcons.js";
// import ManualCommands from '../../assets/ManualCommands.js';
import ToolbarComponent from '../ToolbarComponent';

import { Row, Container, Dropdown, Button, DropdownButton } from 'react-bootstrap';

import { StyleSheet, css } from 'aphrodite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs, faUndo, faSave, faWindowClose, faHome, faBan, faSatellite, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import fenceIcon from '../../assets/img/fence.svg';
import missionPtsIcon from '../../assets/img/missionPtsIcon.svg';
import pathIcon from '../../assets/img/path.svg';

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

function Parameters(){
	this.CruisingThrust = 0.7;
	this.MinimumAltitude = 1.0;
	this.MaximumDepth = 50;
	this.SafetyDistance = 5;
	this.WaypointRadius = 10;
	this.CruisingAltitude = -1
}

function MissionPosition(){
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.params = new Parameters();
}

function MissionTask() {
	this.mp = new MissionPosition();
	this.payload = {};
}

function SimpleMT() {
	this.taskID = "SimpleMT";
	this.endHeading = 0.0;
	MissionTask.call(this);
}

function LawnMoverMT() {
	this.taskID = "LawnMoverMT";
	this.xLength = 0.0;
	this.yLength = 0.0;
	this.moweWidth = 0.0;
	this.moweBearing = 0.0;
	MissionTask.call(this);
}

class MapComponent extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.gateway = FjageHelper.getGateway();

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
			origin: {
				latitude: 1.315456,
				longitude: 103.737608
			},
			mapBoundaries: [
				[1.319525, 103.741806],
				[1.315456, 103.737608]
			],
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
			selectedMissionPoint: 0,
			MissionPlannerEnabled: false

		};

		this.runMission = this.runMission.bind(this);
		this.viewMission = this.viewMission.bind(this);
		this.getMapBoundaries = this.getMapBoundaries.bind(this);
		this.recentreMap = this.recentreMap.bind(this);
		this.setVehicleReady = this.setVehicleReady.bind(this);
		this.setVehicleNotReady = this.setVehicleNotReady.bind(this);

		this.toggleGeoFence = this.toggleGeoFence.bind(this);
		this.toggleMissionPts = this.toggleMissionPts.bind(this);
		this.toggleVehiclePath = this.toggleVehiclePath.bind(this);

		this.enableDrawGeofence = this.enableDrawGeofence.bind(this);
		this.undoGeoFencePoint = this.undoGeoFencePoint.bind(this);
		this.saveNewGeoFence = this.saveNewGeoFence.bind(this);
		this.clearNewGeoFence = this.clearNewGeoFence.bind(this);
		this.cancelNewGeoFence = this.cancelNewGeoFence.bind(this);

		this.mapOnRightClick = this.mapOnRightClick.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);

		this.dragEndGeoFenceMarker = this.dragEndGeoFenceMarker.bind(this);
		this.dragEndMissionPointMarker = this.dragEndMissionPointMarker.bind(this);

		this.vehicleMarker = readyMarker;

		this.vehicleId = null;

		this.selectMissionPoint = this.selectMissionPoint.bind(this);

		this.toggleMissionPlanner = this.toggleMissionPlanner.bind(this);

		this.abortMission = this.abortMission.bind(this);
		this.stationKeep = this.stationKeep.bind(this);
		this.goHome = this.goHome.bind(this);
	}

	componentDidMount() {

		this.coordSys = new CoordSys(this.state.origin.latitude, this.state.origin.longitude, this.state.mapBoundaries.top, this.state.mapBoundaries.left, this.state.mapBoundaries.right, this.state.mapBoundaries.bottom);

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
					})
					.catch(reason => {
						console.log('could not get vehicle ID', reason);
					});

				this.management.getMissions()
					.then(missions => {
						console.log('missions', missions);
						// this.missions = missions;
						this.setState({
							missions: missions,
							editedMissions: new Array(missions.length).fill(0)
						});
					})
					.catch(reason => {
						console.log('could not get missions', reason);
					});

				this.management.getOrigin()
				.then(response => {
					// console.log("origin: ");
					// console.log(response);
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
					// console.log("Geofence: ");
					// console.log(response);
					var geoFenceCoordinates = [];

					response.forEach((element) => {
						geoFenceCoordinates.push([this.coordSys.locy2lat(element.y), this.coordSys.locx2long(element.x)]);
					});

					this.setState({
						mapBoundaries: this.getMapBoundaries([...geoFenceCoordinates, [this.state.vehiclePosition.latitude, this.state.vehiclePosition.longitude]])
					})
					//set bounds of the map so that it is a minimum rectange containing the geofence.
					this.mapRef.leafletElement.fitBounds(this.state.mapBoundaries);
					// console.log(this.state.mapBoundaries);
					this.setState({
						geoFenceCoordinates: geoFenceCoordinates
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

		var x = new TargetLocMT();
		console.log(x);
	}

	componentDidUpdate() {

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

	getMapBoundaries(geoFenceCoordinates){
		// console.log(geoFenceCoordinates);
		var minlat, maxlat, minlong, maxlong;
		minlat = maxlat = geoFenceCoordinates[0][0];
		minlong = maxlong = geoFenceCoordinates[0][1];
		for (var i = 0; i < geoFenceCoordinates.length; i++) {
			if (geoFenceCoordinates[i][0] < minlat) {
				minlat = geoFenceCoordinates[i][0];
			}
			if (geoFenceCoordinates[i][0] > maxlat) {
				maxlat = geoFenceCoordinates[i][0];
			}
			if (geoFenceCoordinates[i][1] < minlong) {
				minlong = geoFenceCoordinates[i][1];
			}
			if (geoFenceCoordinates[i][1] > maxlong) {
				maxlong = geoFenceCoordinates[i][1];
			}
		}
		return [[minlat, minlong],[maxlat, maxlong]];
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

	viewMission(num){
		if (this.state.missions === null) {
			console.log('no missions available');
			this.setState({
				missionNumber: -1,
				currentMission: []
			});
			return;
		}

		if ((num < -1) || (num >= this.state.missions.length)) {
			console.log('invalid mission number');
			this.setState({
				missionNumber: -1,
				currentMission: []
			})
			return;
		}

		if (num === -1) {
			this.setState({
				missionNumber: -1,
				currentMission: []
			})
			return;
		}

		var missionPointsArray = this.state.missions[num];
		var currentMission = [];
		for (var i=0; i < missionPointsArray.length; i++){

			var x = missionPointsArray[i].mp.x, y = missionPointsArray[i].mp.y;
			var lat = this.coordSys.locy2lat(y);
			var long = this.coordSys.locx2long(x);
			currentMission.push([lat,long]);
		}

		this.setState({
			missionNumber: num,
			currentMission: currentMission
		});

	}

	recentreMap(e){
		this.setState({
			mapBoundaries: this.getMapBoundaries([...this.state.geoFenceCoordinates, [this.state.vehiclePosition.latitude, this.state.vehiclePosition.longitude]])
		})
		this.mapRef.leafletElement.fitBounds(this.state.mapBoundaries);
	}

	toggleGeoFence(e) {
		if(this.state.displayGeoFence === true){
			this.state.displayGeoFence = false;
		} else {
			this.state.displayGeoFence = true;
		}
	}

	toggleMissionPts(e) {
		if(this.state.displayMissionPts === true){
			this.state.displayMissionPts = false;
		} else {
			this.state.displayMissionPts = true;
		}
	}

	toggleVehiclePath(e) {
		if(this.state.displayVehiclePath === true){
			this.state.displayVehiclePath = false;
		} else {
			this.state.displayVehiclePath = true;
		}
	}

	enableDrawGeofence(e){
		if (!this.state.MissionPlannerEnabled) {
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

	selectMissionPoint(index) {
		this.setState({
			selectedMissionPoint: index
		});
	}

	openNewWindow(tab) {
		const href = window.location.href;
		const url = href.substring(0, href.lastIndexOf('/') + 1) + tab;
		var w = window.open(url, tab, "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1").focus();
	}

	// executes on right click on map.
	mapOnRightClick(e) {
		console.log(e.latlng);
		if (this.state.drawingGeoFence) {

			this.setState({
				drawGeoFence: [...this.state.drawGeoFence, [e.latlng.lat, e.latlng.lng]]
			});

		} else if (this.state.MissionPlannerEnabled && this.state.missionNumber !== -1) {
			this.setState({
				currentMission: [...this.state.currentMission, [e.latlng.lat, e.latlng.lng]]
			});

			var mission_task = new SimpleMT();
			mission_task.mp.x = this.coordSys.long2locx(e.latlng.lng);
			mission_task.mp.y = this.coordSys.lat2locy(e.latlng.lat);

			console.log(mission_task);

			var missions = this.state.missions;
			var editedMissions = this.state.editedMissions;
			console.log(this.state.editedMissions);
			missions[this.state.missionNumber].push(mission_task);
			editedMissions[this.state.missionNumber] = 1;
			this.setState({
				missions: missions,
				editedMissions: editedMissions
			});
			console.log(this.state.missions);
		}
	}

	onMouseMove(e) {
		// console.log(e.latlng);
		this.setState({
			cursorPosition: {
				latitude: e.latlng.lat.toFixed(6),
				longitude: e.latlng.lng.toFixed(6),
				x: this.coordSys.long2locx(e.latlng.lng).toFixed(6),
				y: this.coordSys.lat2locy(e.latlng.lat).toFixed(6)
			}
		});
	}

	dragEndGeoFenceMarker(e) {
		// console.log(e);
		var newlat = e.target._latlng.lat;
		var newlng = e.target._latlng.lng;
		var oldlat = e.target.options.position[0];
		var oldlng = e.target.options.position[1];
		var drawGeoFenceArr = this.state.drawGeoFence;
		for (var i = 0; i < drawGeoFenceArr.length; i++) {
			if ( drawGeoFenceArr[i][0] === oldlat && drawGeoFenceArr[i][1] === oldlng ){
				drawGeoFenceArr[i] = [newlat, newlng];
				console.log("moved" + i);
			}
		}
		this.setState({
			drawGeoFence: []
		});
		this.setState({
			drawGeoFence: drawGeoFenceArr
		});
	}

	dragEndMissionPointMarker(e) {
		// console.log(e);
		var oldX = this.coordSys.long2locx(e.target.options.position[1]);
		var oldY = this.coordSys.lat2locy(e.target.options.position[0]);

		var newX = this.coordSys.long2locx(e.target._latlng.lng);
		var newY = this.coordSys.lat2locy(e.target._latlng.lat);

		var missionsArr = this.state.missions;
		var editedMissions = this.state.editedMissions;

		var currentMission = missionsArr[this.state.missionNumber];

		console.log(oldX + " " + oldY + " " + newX + " " + newY);
		// console.log(currentMission[0].mp.x + " " + currentMission[0].mp.y);
		for (var i = 0; i < currentMission.length; i++) {
			// rounding up the floats to ignore the error in conversion between latlng and local coordinates.
			if ( Math.round(currentMission[i].mp.x) === Math.round(oldX) && Math.round(currentMission[i].mp.y) === Math.round(oldY) ){

				missionsArr[this.state.missionNumber][i].mp.y = newY;
				missionsArr[this.state.missionNumber][i].mp.x = newX;
				console.log("moved " + i);
			}
		}

		editedMissions[this.state.missionNumber] = 1;

		this.setState({
			missions: missionsArr,
			editedMissions: editedMissions,
			currentMission: []
		});
		this.viewMission(this.state.missionNumber);
	}


	toggleMissionPlanner(e) {
		if (this.state.MissionPlannerEnabled) {
			this.setState({
				MissionPlannerEnabled: false
			});
			this.selectMissionPoint(0);
		} else {
			this.setState({
				MissionPlannerEnabled: true
			});
		}

	}

	abortMission() {
		console.log("Abort Mission!");
		this.management.abortMission();
	}

	stationKeep() {
		console.log("Station Keep!");
		this.management.stationKeep();
	}

	goHome() {
		console.log("Go Home!");
		this.management.abortToHome();
	}

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

				if (this.state.selectedMissionPoint == i+1) {
					MissionPointsMarkers.push(
						<Marker draggable={this.state.MissionPlannerEnabled} onDragEnd={this.dragEndMissionPointMarker} icon={mapPinSelected} key={"MissionPT" + i} position={this.state.currentMission[i]}>
							<Popup>
								Lat: {lat.toFixed(4)}, Long: {long.toFixed(4)} <br/>
								x: {x.toFixed(4)}, y: {y.toFixed(4)}
							</Popup>
						</Marker>
					);
				} else {
					MissionPointsMarkers.push(
						<Marker draggable={this.state.MissionPlannerEnabled} onDragEnd={this.dragEndMissionPointMarker} icon={mapPin} key={"MissionPT" + i} position={this.state.currentMission[i]}>
							<Popup>
								Lat: {lat.toFixed(4)}, Long: {long.toFixed(4)} <br/>
								x: {x.toFixed(4)}, y: {y.toFixed(4)}
							</Popup>
						</Marker>
					);
				}

				missionPtLatLngs.push([lat, long]);
			}
		}

		const geoFence = (this.state.displayGeoFence && !this.state.drawingGeoFence) ? <Polygon id="geoFence" positions={this.state.geoFenceCoordinates} color="red"></Polygon> : null;

		const missionPts = (this.state.displayMissionPts && !this.state.drawingGeoFence) ? MissionPointsMarkers : null;

		const missionPath = (this.state.displayMissionPts && !this.state.drawingGeoFence) ? <Polyline id="missionPath" positions={missionPtLatLngs} color="green"></Polyline> : null;

		const vehiclePath = (this.state.displayVehiclePath && !this.state.drawingGeoFence) ? <Polyline id="vehiclePath" positions={this.state.polylineArray} color="yellow"></Polyline> : null;

		const drawGeoFenceOptions = (this.state.drawingGeoFence) ? <div className="drawGeoFence_content">
			<Button type="submit" title="Undo last point" onClick={this.undoGeoFencePoint}><FontAwesomeIcon icon={faUndo} color="#fff" /></Button>
			<Button type="submit" title="Save Geofence" onClick={this.saveNewGeoFence}><FontAwesomeIcon icon={faSave} color="#fff" /></Button>
			<Button type="submit" title="Cancel Geofence" onClick={this.cancelNewGeoFence}><FontAwesomeIcon icon={faWindowClose} color="#fff" /></Button>
			<Button type="submit" title="Clear Geofence" onClick={this.clearNewGeoFence}><FontAwesomeIcon icon={faTrashAlt} color="#fff" /></Button>
		</div> : null;

		const drawGeoFenceMarkers = [];
		if (this.state.drawingGeoFence) {
			for (var i = 0; i < this.state.drawGeoFence.length; i++) {
				drawGeoFenceMarkers.push(<Marker draggable={true} onDragEnd={this.dragEndGeoFenceMarker} icon={mapPin} key={"newGeoFence" + i} position={this.state.drawGeoFence[i]}></Marker>);
			}
		}

		const vehicle = this.state.displayVehicle ?
		[<Marker icon={this.vehicleMarker} position={position}>
			<Popup>
				Lat: {this.state.vehiclePosition.latitude.toFixed(4)}, Long: {this.state.vehiclePosition.longitude.toFixed(4)} <br/>
				x: {this.state.vehiclePosition.x.toFixed(4)}, y: {this.state.vehiclePosition.y.toFixed(4)}
			</Popup>
		</Marker>,
		<Circle center={position} radius={this.state.positionError}></Circle>] : null;

		const MissionPlannerPanels = (this.state.MissionPlannerEnabled) ?
		<Row>
			<MissionPlanner selectMissionPointFunc={this.selectMissionPoint} viewMissionFunc={this.viewMission} missions={this.state.missions} editedMissions={this.state.editedMissions} management={this.management}/>
		</Row> :
		null;

		return (
			<div>
				<LeafletMap ref={(ref) => this.mapRef = ref} center={mapCenter} zoom={this.state.zoom} onContextMenu={this.mapOnRightClick} onMouseMove={this.onMouseMove}>
					<TileLayer
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url={tileUrl}
						minZoom={1}
						maxZoom={17}
					/>

					{vehicle}
					{geoFence}
					{missionPts}
					{missionPath}
					{vehiclePath}

					<Polygon id="drawGeoFence" positions={this.state.drawGeoFence} color="blue"></Polygon>
					{drawGeoFenceMarkers}

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
						<Button type="submit" onClick={this.recentreMap}><FontAwesomeIcon icon={faCrosshairs}  title="Re-center Map"/></Button>
						<Button type="submit" active={this.state.displayGeoFence} onClick={this.toggleGeoFence}><img title="Toggle Geofence" src={fenceIcon} height={20} width={20}/></Button>
						<Button type="submit" active={this.state.displayMissionPts} onClick={this.toggleMissionPts}><img title="Toggle Mission Points" src={missionPtsIcon} height={25} width={25}/></Button>
						<Button type="submit" active={this.state.displayVehiclePath} onClick={this.toggleVehiclePath}><img title="Toggle Vehicle Path"  src={pathIcon} height={20} width={20}/></Button>

						<div className="mission_options">
							<Button type="submit" onClick={this.abortMission}><FontAwesomeIcon icon={faBan}  title="Abort Mission"/></Button>
							<Button type="submit" onClick={this.stationKeep}><FontAwesomeIcon icon={faSatellite}  title="Station Keep"/></Button>
							<Button type="submit" onClick={this.goHome}><FontAwesomeIcon icon={faHome}  title="Go Home"/></Button>
						</div>

						<div className="drawGeoFence_styles">
							<Button type="submit" onClick={this.enableDrawGeofence}>Draw GeoFence</Button>
							{drawGeoFenceOptions}
						</div>
						<div>
							<Button type="submit" active={this.state.MissionPlannerEnabled} onClick={this.toggleMissionPlanner}>MissionPlanner</Button>
						</div>
					</Row>

					{MissionPlannerPanels}

					<CursorPositionComponent position={this.state.cursorPosition} />
				</Container>
			</div>
		);
	}
}


export default MapComponent;
