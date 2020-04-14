import React from 'react'
import { Table } from 'react-bootstrap';

import { FjageHelper } from "../../assets/fjageHelper.js";
import { Management } from "../../assets/jc2.js";
import { StyleSheet, css } from 'aphrodite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import {Container, Row} from 'react-bootstrap';

const styles = StyleSheet.create({
    table_styles: {
    	fontSize: "0.75em"
    },
    errorRow: {
    	backgroundColor: "#ffbfba"
    }
});

class DiagnosticsComponent extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.gateway = FjageHelper.getGateway();

		this.state = {
			diagnostics: []

		};

	}

	componentDidMount() {

		this.gateway.addConnListener((connected) => {
			if (connected) {
				this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.VEHICLESTATUS'));
				this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.MISSIONSTATUS'));

				const management = new Management(this.gateway);

				management.getHealth()
				.then(response => {
					// console.log(response);
					this.setState({
						diagnostics: response
					});
				})
				.catch(reason => {
					console.log('could not get health', reason);
				});
			}
		});


	}

	componentDidUpdate() {


	}

	componentWillUnmount() {
		this.gateway.close();
	}

	render() {
		document.title = "Diagnostics";
		// console.log(this.state.diagnostics);
		var diagnosticsRows = [];
		for (var i = 0; i < this.state.diagnostics.length; i++) {
			var status = [];
			const tick = <FontAwesomeIcon icon={faCheck} color="green" />;
			const cross = <FontAwesomeIcon icon={faTimes} color="red" />;
			const errorClass = css(styles.errorRow);
			var addClass = null;
			switch(this.state.diagnostics[i].health){
				case "OFFLINE":
					addClass = errorClass;
					status = [cross,,];
					break;
				case "MALFUNCTION":
					addClass = errorClass;
					status = [tick,cross,];
					break;
				case "UNAVAILABLE":
					addClass = errorClass;
					status = [tick,tick,cross];
					break;
				case "HEALTHY":
					status = [tick,tick,tick];
					break;
			}
			diagnosticsRows.push(
				<tr key={i} className={addClass}>
					<td>{i+1}</td>
					<td>{this.state.diagnostics[i].name}</td>
					<td>{status[0]}</td>
					<td>{status[1]}</td>
					<td>{status[2]}</td>
				</tr>
			);
		}

		return (
			<Container>
				<Row>
					<h3>Diagnostics</h3>
				</Row>
				<Row>
					<Table striped bordered hover size="sm" className={css(styles.table_styles)}>
						<thead>
							<tr>
								<th>#</th>
								<th>Name</th>
								<th>Online</th>
								<th>Healthy</th>
								<th>Data</th>
							</tr>
						</thead>
						<tbody>
							{diagnosticsRows}
						</tbody>
					</Table>
				</Row>
			</Container>


		);
	}
}

export default DiagnosticsComponent;
