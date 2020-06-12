import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import MissionTreeViewComponent from './MissionTreeViewComponent';

import '../../assets/MissionPlanner.css';


class MissionPlanner extends React.Component {
	constructor(props, context) {
		super(props, context);

	}


	render() {

		return (
			<div className="MissionPlannerContainer">
				<MissionTreeViewComponent management={this.props.management} selectMissionPointFunc={this.props.selectMissionPointFunc} viewMissionFunc={this.props.viewMissionFunc} missions={this.props.missions} editedMissions={this.props.editedMissions}/>
			</div>
		);
	}
}

export default MissionPlanner;
