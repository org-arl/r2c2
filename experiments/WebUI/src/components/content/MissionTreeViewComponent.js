import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { ListGroup } from 'react-bootstrap';

import MLegInfoComponent from './MLegInfoComponent';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faTimes, faSave } from '@fortawesome/free-solid-svg-icons'


const styles = StyleSheet.create({
	missionsContainer: {
		position: "fixed",
		height: "50%",
		width: "300px",
		overflowY: "scroll",
		// top: "0px",
		// marginTop: "30px",
		left: "0px",
		backgroundColor: "#fff",
		padding: "5px",
		fontSize: "0.9em"
	}
});

class CursorPositionComponent extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			missions: this.props.missions,
			selectedMission: 0,
			selectedMLeg: 0,
			addMissionMode: false
		}

	}

	selectMission(index) {
		this.props.selectMissionPointFunc(0);
		if (index === this.state.selectedMission) {
			this.setState({
				selectedMission: 0,
				selectedMLeg: 0
			});
			this.props.viewMissionFunc(-1);
			return;
		}

		this.setState({
			selectedMission: index,
			selectedMLeg: 0
		});
		this.props.viewMissionFunc(index-1);
	}

	selectMleg(index) {
		this.setState({
			selectedMLeg: index
		});
		this.props.selectMissionPointFunc(index);
	}

	addNewMission(e) {
		console.log("add new mission");
		this.props.addNewMissionFunc();
		this.setState({
			addMissionMode: true,
			selectedMission: this.state.missions.length + 1,
			selectedMLeg: 0
		});
	}

	cancelAddMission(e) {
		this.props.cancelNewMissionFunc();
		this.setState({
			addMissionMode: false,
			selectedMission: 0,
			selectedMLeg: 0
		});
	}

	saveNewMission(){
		// Yet to be implemented. Save newest mission.
		console.log("Saved new mission");
		this.setState({
			addMissionMode: false
		});
	}

	saveChanges(missionNumber) {
		// Yet to be implemented on backend
		// this.props.management.saveMissionChanges(missionNumber);
		console.log("Save changes for Mission " + missionNumber);
	}

	discardChanges(missionNumber) {
		// Yet to be implemented on backend
		// this.props.management.discardMissionChanges(missionNumber);
		var missionsArray = this.state.missions;
		this.props.management.getMissions()
			.then(missions => {
				console.log("Discarding changes for Mission " + missionNumber);
				missionsArray[missionNumber - 1] = missions[missionNumber - 1];
				this.setState({
					missions: missionsArray
				});
				this.props.viewMissionFunc(missionNumber-1);
			})
			.catch(reason => {
				console.log('Error: could not get missions from vehicle', reason);
			});
	}

	deleteMission(missionNumber) {
		// Yet to be implemented on backend
		// this.props.management.deleteMission(missionNumber);
		console.log("Delete Mission " + missionNumber);
	}

	render() {

		var missionList = [];
		var missionLeg = null;

		if (this.state.missions !== null) {

			this.state.missions.forEach((mission, i) => {

				var missionLegList = [];
				mission.forEach((missionLeg, j) => {
					var activeMleg = (this.state.selectedMLeg == j+1) ? "active" : "" ;
					missionLegList.push(<ListGroup.Item action className={activeMleg} onClick={() => this.selectMleg(j+1)}>{missionLeg.taskID.substring(0, missionLeg.taskID.indexOf("MT") + 2)} : {missionLeg.mp.x.toFixed(2)}, {missionLeg.mp.y.toFixed(2)}, {missionLeg.mp.z.toFixed(2)}</ListGroup.Item>);
				});

				missionLegList.push(<ListGroup.Item className="AddMissionPointComment"> Right Click on map to add mission point </ListGroup.Item>);

				var nestedClass = (this.state.selectedMission === (i+1)) ? "show-nested" : "hide-nested";
				var caretDown = (this.state.selectedMission === (i+1)) ? "caret caret-down" : "caret";
				missionList.push(
					<ListGroup.Item>
						<span onClick={() => this.selectMission(i+1)} className={caretDown}>Mission No. {i+1}</span>
						<FontAwesomeIcon className="saveChangesBtn" icon={faSave} onClick={() => this.saveChanges(i+1)} title="Save Changes to Mission"/>
						<FontAwesomeIcon className="discardChangesBtn" icon={faTimes} onClick={() => this.discardChanges(i+1)} title="Discard Changes to Mission"/>
						<FontAwesomeIcon className="deleteMissionBtn" icon={faTrashAlt} onClick={() => this.deleteMission(i+1)} title="Delete Mission"/>
						<ListGroup className={nestedClass}>
							{missionLegList}
						</ListGroup>
					</ListGroup.Item>
				);
			});


			missionLeg = (this.state.selectedMission > 0 && this.state.selectedMLeg > 0) ? this.state.missions[this.state.selectedMission - 1][this.state.selectedMLeg - 1] : null;
			// console.log(missionLeg);
		}
		if (this.state.addMissionMode === false) {
			missionList.push(<ListGroup.Item onClick={() => this.addNewMission()} className="addMissionBtn"> + </ListGroup.Item>);
		} else {
			missionList.push(
				<ListGroup.Item>
					<FontAwesomeIcon className="cancelAddMissionBtn" icon={faTimes} onClick={() => this.cancelAddMission()} title="Cancel New Mission"/>
					<FontAwesomeIcon className="saveNewMissionBtn" icon={faSave} onClick={() => this.saveNewMission()} title="Save New Mission"/>
				</ListGroup.Item>
			);
		}


		return (
			<div>
				<div className={css(styles.missionsContainer)}>
					<ul>
						{missionList}
					</ul>
				</div>
				<MLegInfoComponent editMode={this.state.addMissionMode} refreshMissionMarkersFunc={this.props.viewMissionFunc} missionIndex={this.state.selectedMission} missionLeg={missionLeg}/>
			</div>
		);
	}
}

export default CursorPositionComponent;
