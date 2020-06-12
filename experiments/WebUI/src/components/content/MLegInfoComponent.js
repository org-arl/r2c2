import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Table, ListGroup, Tab, FormControl, Button } from 'react-bootstrap';


const styles = StyleSheet.create({
	MLegInfoContainer: {
		position: "fixed",
		// bottom: "0px",

		right: "0px",
		backgroundColor: "#fff",
		padding: "5px",
		fontSize: "0.9em"
	}
});

class MLegInfoComponent extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			missionLeg: this.props.missionLeg,
			editedMissions: this.props.editedMissions
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.missionLeg !== this.props.missionLeg) {

			this.setState({
				missionLeg: this.props.missionLeg,
			});
		}
	}

	modifyEditedMissionsArr(){
		var editedMissions = this.state.editedMissions;
		editedMissions[this.props.missionIndex - 1] = 1;
		this.setState({
			editedMissions: editedMissions
		});
	}

	onPropertyChange(e) {
		var missionLeg = this.state.missionLeg;
		// console.log(e.target.value);
		var value = e.target.value;
		if (value === "") {
			value = 0;
		}
		missionLeg.mp[e.target.name] = parseFloat(value);
		this.setState({
			missionLeg: missionLeg
		});

		this.modifyEditedMissionsArr();
		this.props.refreshMissionMarkersFunc(this.props.missionIndex-1);
	}

	onParamChange(e) {
		var missionLeg = this.state.missionLeg;
		missionLeg.mp.params[e.target.name] = e.target.value;
		this.setState({
			missionLeg: missionLeg
		});
		this.modifyEditedMissionsArr();
	}

	onPayloadChange(e) {
		var missionLeg = this.state.missionLeg;
		missionLeg.payload = e.target.value;
		this.setState({
			missionLeg: missionLeg
		});
		this.modifyEditedMissionsArr();
	}

	render() {
		var propertyTableRows = [];
		var paramTableRows = [];
		var payloadObject = {};
		// var actionButtons = null;
		if (this.state.missionLeg !== null) {

			//Property table - TODO currently hard coded, find better way to do this.
			propertyTableRows.push(
				<tr>
					<td>x</td>
					<td><FormControl name="x" onChange={(e) => this.onPropertyChange(e)} value={this.state.missionLeg.mp.x}></FormControl></td>
				</tr>
			);
			propertyTableRows.push(
				<tr>
					<td>y</td>
					<td><FormControl name="y" onChange={(e) => this.onPropertyChange(e)} value={this.state.missionLeg.mp.y}></FormControl></td>
				</tr>
			);
			propertyTableRows.push(
				<tr>
					<td>z</td>
					<td><FormControl name="z" onChange={(e) => this.onPropertyChange(e)} value={this.state.missionLeg.mp.z}></FormControl></td>
				</tr>
			);

			// console.log(this.state.missionLeg);
			var params = this.state.missionLeg.mp.params;
			for (var key in params) {
				if (params.hasOwnProperty(key)) {
					paramTableRows.push
					(
						<tr key={key}>
							<td>{key}</td>
							<td><FormControl name={key} onChange={(e) => this.onParamChange(e)} value={params[key]}></FormControl></td>
						</tr>
					);
				}
			}

			payloadObject = this.state.missionLeg.payload;
		}

		const Properties =
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					{propertyTableRows}
				</tbody>
			</Table>;

		const Parameters =
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					{paramTableRows}
				</tbody>
			</Table>;

		const Payload =
			<div>
				<FormControl onChange={(e) => this.onPayloadChange(e)} value={JSON.stringify(payloadObject, null, 0)}></FormControl>
			</div>;
		return (
			<div className={css(styles.MLegInfoContainer)}>
				<Tab.Container id="list-group-tabs-example" defaultActiveKey="#Parameters">
					<ListGroup horizontal>
						<ListGroup.Item action href="#Property">Property</ListGroup.Item>
						<ListGroup.Item action href="#Parameters">Parameters</ListGroup.Item>
						<ListGroup.Item action href="#Payload">Payload</ListGroup.Item>
					</ListGroup>

					<Tab.Content>
						<Tab.Pane eventKey="#Property">
							{Properties}
						</Tab.Pane>
						<Tab.Pane eventKey="#Parameters">
							{Parameters}
						</Tab.Pane>
						<Tab.Pane eventKey="#Payload">
							{Payload}
						</Tab.Pane>
					</Tab.Content>
				</Tab.Container>
				{/* {actionButtons} */}
			</div>
		);
	}
}

export default MLegInfoComponent;
