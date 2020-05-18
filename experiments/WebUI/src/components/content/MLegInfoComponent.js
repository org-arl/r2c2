import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Table, ListGroup, Tab } from 'react-bootstrap';


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
			activeSegment: "Parameters"
		}
	}


	render() {
		var tableRows = [];
		var payloadObject = {};
		if (this.props.missionLeg !== null) {
			// console.log(this.props.missionLeg);
			var params = this.props.missionLeg.mp.params;
			for (var key in params) {
				if (params.hasOwnProperty(key)) {
					tableRows.push
					(
						<tr>
							<td>{key}</td>
							<td>{params[key]}</td>
						</tr>
					);
				}
			}

			payloadObject = this.props.missionLeg.payload;
		}
		const Parameters =
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					{tableRows}
				</tbody>
			</Table>;

		const Payload =
			<div>
				{JSON.stringify(payloadObject, null, 4)}
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

						</Tab.Pane>
						<Tab.Pane eventKey="#Parameters">
							{Parameters}
						</Tab.Pane>
						<Tab.Pane eventKey="#Payload">
							{Payload}
						</Tab.Pane>
					</Tab.Content>
				</Tab.Container>
			</div>
		);
	}
}

export default MLegInfoComponent;
