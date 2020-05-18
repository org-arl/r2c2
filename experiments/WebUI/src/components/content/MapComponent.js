import React from 'react'
import { Map as LeafletMap, Marker, Popup, TileLayer, Circle, Polygon, Polyline } from 'react-leaflet';

import CursorPositionComponent from './CursorPositionComponent';

import MissionPlanner from './MissionPlanner';

import CoordSys from '../../assets/CoordSys.js';

import { FjageHelper } from "../../assets/fjageHelper.js";
import { Management } from "../../assets/jc2.js";
import { mapPin, readyMarker, notReadyMarker } from "../../assets/MapIcons.js";
// import ManualCommands from '../../assets/ManualCommands.js';
import ToolbarComponent from '../ToolbarComponent';

import { Row, Container, Dropdown, Button, DropdownButton } from 'react-bootstrap';

import { StyleSheet, css } from 'aphrodite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs, faUndo, faSave, faWindowClose } from '@fortawesome/free-solid-svg-icons'

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
			missionPoints: [],
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

			drawingMission: false,
			newMission: []

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
		this.cancelNewGeoFence = this.cancelNewGeoFence.bind(this);

		this.drawNewMission = this.drawNewMission.bind(this);

		this.mapOnClick = this.mapOnClick.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.moveGeoFenceMarker = this.moveGeoFenceMarker.bind(this);

		this.vehicleMarker = readyMarker;

		this.vehicleId = null;
		this.missions = null;
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
						this.missions = missions;
						this.numberOfMissions = missions.length;
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
		this.viewMission(num);
		//todo: should there be some response to check if mission has been run?
		this.management.runMission(parseInt(num) + 1);
	}

	viewMission(num){
		// TODO: mission not being shown in first function call. Displays only on second call.

		this.missionNumber = num;

		if (this.missions === null) {
			console.log('no missions available');
			return;
		}
		if ((this.missionNumber < 0) || (this.missionNumber >= this.missions.length)) {
			console.log('invalid mission number');
			return;
		}

		var missionPoints = [];
		var missionPointsArray = this.missions[this.missionNumber];

		for (var i=0; i < missionPointsArray.length; i++){
			var lat = this.coordSys.locy2lat(missionPointsArray[i].mp.y);
			var long = this.coordSys.locx2long(missionPointsArray[i].mp.x);
			missionPoints.push([missionPointsArray[i].mp.x.toFixed(4), missionPointsArray[i].mp.y.toFixed(4), lat.toFixed(4), long.toFixed(4)]);
		}
		this.setState({
			missionPoints: missionPoints
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
		if (!this.state.drawingMission) {
			this.setState({
				drawingGeoFence: true
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
		// TODO: add code to save geofence on vehicle and replace current geofence.

		this.setState({
			drawingGeoFence: false,
			// geoFenceCoordinates: this.state.drawGeoFence,
			drawGeoFence: []
		});
	}

	cancelNewGeoFence(e){
		this.setState({
			drawingGeoFence: false,
			drawGeoFence: []
		});
	}

	drawNewMission(e){
		if (!this.state.drawingGeoFence) {
			this.setState({
				drawingMission: true
			});
			this.missions.push([]);
		}
	}

	cancelNewMission(e){
		this.setState({
			drawingMission: false,
			newMission: []
		});
		if (this.missions.length > 0) {
			this.missions.splice(-1, 1);
		}
	}

	openNewWindow(tab) {
		const href = window.location.href;
		const url = href.substring(0, href.lastIndexOf('/') + 1) + tab;
		var w = window.open(url, tab, "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1");
	}

	mapOnClick(e) {
		console.log(e.latlng);
		if (this.state.drawingGeoFence) {
			this.setState({
				drawGeoFence: [...this.state.drawGeoFence, [e.latlng.lat, e.latlng.lng]]
			});
		} else if (this.state.drawingMission) {
			this.setState({
				newMission: [...this.state.newMission, [e.latlng.lat, e.latlng.lng]]
			});
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

	moveGeoFenceMarker(e) {
		// var newlat = e.latlng.lat;
		// var newlng = e.latlng.lng;
		// var drawGeoFenceArr = this.state.drawGeoFence;
		// for (var i = 0; i < drawGeoFenceArr.length; i++) {
		// 	if ( drawGeoFenceArr[i][0] === e.oldLatLng.lat && drawGeoFenceArr[i][1] === e.oldLatLng.lng ){
		// 		drawGeoFenceArr[i] = [newlat, newlng];
		// 		console.log("hello");
		// 	}
		// }
		// this.setState({
		// 	drawGeoFence: drawGeoFenceArr
		// });
		// console.log(this.state.drawGeoFence);
	}

	render() {
		const position = [this.state.vehiclePosition.latitude, this.state.vehiclePosition.longitude];
		const mapCenter = [this.state.mapCenter.latitude, this.state.mapCenter.longitude];

		var missionList = new Array(this.numberOfMissions).fill(0).map((zero, index) =>
			<div key={index}> {index+1} <Button onClick={() => this.viewMission(index)}>View</Button> <Button onClick={() => this.runMission(index)}>Run</Button></div>
		);

		var MissionPointsMarkers = [];
		var missionPtLatLngs = [];
		this.state.missionPoints.forEach((missionPoint, i) => {
			var x = missionPoint[0], y = missionPoint[1], lat = missionPoint[2], long = missionPoint[3];
			MissionPointsMarkers.push(
				<Marker icon={mapPin} key={i} position={[lat, long]}>
					<Popup>
						Lat: {lat}, Long: {long} <br/>
						x: {x}, y: {y}
					</Popup>
				</Marker>
			);
			missionPtLatLngs.push([lat, long]);
		});

		const geoFence = (this.state.displayGeoFence && !this.state.drawingGeoFence && !this.state.drawingMission) ? <Polygon id="geoFence" positions={this.state.geoFenceCoordinates} color="red"></Polygon> : null;

		const missionPts = (this.state.displayMissionPts && !this.state.drawingGeoFence && !this.state.drawingMission) ? MissionPointsMarkers : null;

		const missionPath = (this.state.displayMissionPts && !this.state.drawingGeoFence && !this.state.drawingMission) ? <Polyline id="missionPath" positions={missionPtLatLngs} color="green"></Polyline> : null;

		const vehiclePath = (this.state.displayVehiclePath && !this.state.drawingGeoFence && !this.state.drawingMission) ? <Polyline id="vehiclePath" positions={this.state.polylineArray} color="yellow"></Polyline> : null;

		const drawGeoFenceOptions = (this.state.drawingGeoFence) ? <div className="drawGeoFence_content">
			<Button type="submit" onClick={this.undoGeoFencePoint}><FontAwesomeIcon icon={faUndo} color="#fff" /></Button>
			<Button type="submit" onClick={this.saveNewGeoFence}><FontAwesomeIcon icon={faSave} color="#fff" /></Button>
			<Button type="submit" onClick={this.cancelNewGeoFence}><FontAwesomeIcon icon={faWindowClose} color="#fff" /></Button>
		</div> : null;

		const drawGeoFenceMarkers = [];
		if (this.state.drawingGeoFence) {
			for (var i = 0; i < this.state.drawGeoFence.length; i++) {
				// drawGeoFenceMarkers.push(<Marker onMove={this.moveGeoFenceMarker} icon={mapPin} key={i} draggable={true} position={this.state.drawGeoFence[i]}></Marker>);
				drawGeoFenceMarkers.push(<Marker onMove={this.moveGeoFenceMarker} icon={mapPin} key={i} position={this.state.drawGeoFence[i]}></Marker>);
			}
		}

		const drawNewMissionMarkers = [];
		if (this.state.drawingMission) {
			for (var i = 0; i < this.state.newMission.length; i++) {
				drawNewMissionMarkers.push(
					<Marker icon={mapPin} key={i} position={this.state.newMission[i]}>
						<Popup>
							<DropdownButton id="dropdown-basic-button" title="MissionTask Type">
								<Dropdown.Item href="#/action-1">SimpleMT</Dropdown.Item>
								<Dropdown.Item href="#/action-2">LawnMoverMT</Dropdown.Item>
							</DropdownButton>
						</Popup>
					</Marker>
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
		<Circle center={position} radius={this.state.positionError}></Circle>] : null;



		return (
			<div>
				<LeafletMap ref={(ref) => this.mapRef = ref} center={mapCenter} zoom={this.state.zoom} onClick={this.mapOnClick} onMouseMove={this.onMouseMove}>
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

					<Polyline id="newMission" positions={this.state.newMission} color="red"></Polyline>
					{drawNewMissionMarkers}

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
						<Button type="submit" onClick={this.toggleGeoFence}><img title="Toggle Geofence" src={fenceIcon} height={20} width={20}/></Button>
						<Button type="submit" onClick={this.toggleMissionPts}><img title="Toggle Mission Points" src={missionPtsIcon} height={25} width={25}/></Button>
						<Button type="submit" onClick={this.toggleVehiclePath}><img title="Toggle Vehicle Path"  src={pathIcon} height={20} width={20}/></Button>

						<div className="drawGeoFence_styles">
							<Button type="submit" onClick={this.enableDrawGeofence}>Draw GeoFence</Button>
							{drawGeoFenceOptions}
						</div>
					</Row>
					<Row>
						<MissionPlanner drawNewMissionFunc={this.drawNewMission} viewMissionFunc={this.viewMission} missions={this.missions} management={this.management}/>
					</Row>
					<CursorPositionComponent position={this.state.cursorPosition} />
				</Container>
			</div>
		);
	}
}


export default MapComponent;
