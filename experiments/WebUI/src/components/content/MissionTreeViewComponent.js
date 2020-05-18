import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { ListGroup } from 'react-bootstrap';

import MLegInfoComponent from './MLegInfoComponent';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'


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
			selectedMission: 0,
			selectedMLeg: 0
		}

	}

	selectMission(index) {
		if (index === this.state.selectedMission) {
			this.setState({
				selectedMission: 0,
				selectedMLeg: 0
			});
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
	}

	addNewMission(e) {
		console.log("add new mission");
		this.props.drawNewMissionFunc();
	}

	deleteMission(missionNumber) {
		// Yet to be implemented on backend
		// this.props.management.deleteMission(missionNumber);
		console.log("Delete Mission " + missionNumber);
	}

	render() {

		var missionList = [];
		var missionLeg = null;

		if (this.props.missions !== null) {

			this.props.missions.forEach((mission, i) => {

				var missionLegList = [];
				mission.forEach((missionLeg, j) => {
					var activeMleg = (this.state.selectedMLeg == j+1) ? "active" : "" ;
					missionLegList.push(<ListGroup.Item action className={activeMleg} onClick={() => this.selectMleg(j+1)}>{missionLeg.taskID.substring(0, missionLeg.taskID.indexOf("MT") + 2)} : {missionLeg.mp.x}, {missionLeg.mp.y}, {missionLeg.mp.z}</ListGroup.Item>);
				});
				missionLegList.push(<ListGroup.Item action > + </ListGroup.Item>);

				var nestedClass = (this.state.selectedMission === (i+1)) ? "show-nested" : "hide-nested";
				var caretDown = (this.state.selectedMission === (i+1)) ? "caret caret-down" : "caret";
				missionList.push(
					<ListGroup.Item><span onClick={() => this.selectMission(i+1)} className={caretDown}>Mission No. {i+1}</span> <FontAwesomeIcon className="deleteMissionBtn" icon={faTrashAlt} onClick={() => this.deleteMission(i+1)} title="Delete Mission"/>
						<ListGroup className={nestedClass}>
							{missionLegList}
						</ListGroup>
					</ListGroup.Item>
				);
			});


			missionLeg = (this.state.selectedMission > 0 && this.state.selectedMLeg > 0) ? this.props.missions[this.state.selectedMission - 1][this.state.selectedMLeg - 1] : null;
			console.log(missionLeg);
		}
		missionList.push(
			<ListGroup.Item onClick={() => this.addNewMission()} className="addMissionBtn"> + </ListGroup.Item>
		);

		return (
			<div>
				<div className={css(styles.missionsContainer)}>
					<ul>
						{missionList}
					</ul>
				</div>
				<MLegInfoComponent missionLeg={missionLeg}/>
			</div>
		);
	}
}

export default CursorPositionComponent;
