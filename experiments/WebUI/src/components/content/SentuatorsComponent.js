import React from 'react'
import { Row, Container, ListGroup } from 'react-bootstrap';
import { FjageHelper } from "../../assets/fjageHelper.js";
import { Management } from "../../assets/jc2.js";

import Select from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

class SentuatorsComponent extends React.Component {
	constructor(props) {
		super(props);
		this.gateway = FjageHelper.getGateway();

		this.state = {
			Sentuators : [],
			selectedOption: null,
			actuators: [],
			sensors: [],
			sentuatorValue: []
		};
	}

	componentDidMount() {
		this.gateway.addConnListener((connected) => {
			if (connected) {
				this.management = new Management(this.gateway);

				this.management.getVehicleId()
					.then(vehicleId => {
						console.log('vehicleId', vehicleId);
						this.vehicleId = vehicleId;
					})
					.catch(reason => {
						console.log('could not get vehicle ID', reason);
					});

				this.management.getSentuators()
				.then(response => {
					// console.log(response);
					this.setState({
						Sentuators: response
					});
				})
				.catch(reason => {
					console.log('could not get sentuators', reason);
				});
			}
		});
	}

	handleChange = selectedOption => {
		this.setState({ selectedOption: selectedOption });
		// console.log(`Option selected:`, selectedOption);
		this.management.getSentuatorHealth(selectedOption.value)
		.then(response => {
			// console.log(response);
			this.setState({
				actuators: response.actuators,
				sensors: response.sensors
			});
		})
		.catch(reason => {
			console.log(reason);
		})
	};

	sentuatorClicked = (sentuatorType) => {
		this.management.getMeasurement(this.state.selectedOption.value, sentuatorType, 1.0)
		.then(response => {
			// console.log(response);
			if (response) {
				var value = [];
				response.items.forEach((item, i) => {
					value.push(item.type + " : " + item.value);
				});
			} else {
				value = [];
			}
			this.setState({
				sentuatorValue: value
			});

		})
		.catch(reason => {
			console.log(reason);
		})
	}

	render() {
		if (this.vehicleId) {
			document.title = this.vehicleId + " Sentuators";
		} else {
			document.title = "Sentuators";
		}
		var selectOptions = [];

		const tick = <FontAwesomeIcon icon={faCheck} color="green" />;
		const cross = <FontAwesomeIcon icon={faTimes} color="red" />;

		this.state.Sentuators.forEach((node, i) => {
			selectOptions.push({ value: node.name, label: node.name });
		});
		// console.log(this.state.sensors);
		var actuatorRows = [];
		this.state.actuators.forEach((actuatorObject, i) => {
			const health = (actuatorObject.health === "HEALTHY") ? tick : cross;
			actuatorRows.push(
				<ListGroup.Item key={i} action onClick={() => {this.sentuatorClicked(actuatorObject.actuator.type)}}>
					{health}  {actuatorObject.actuator.name}
				</ListGroup.Item>
			);
		});

		var sensorRows = [];
		this.state.sensors.forEach((sensorObject, i) => {
			const health = (sensorObject.health === "HEALTHY") ? tick : cross;
			sensorRows.push(
				<ListGroup.Item key={i} action onClick={() => {this.sentuatorClicked(sensorObject.sensor.type)}}>
					{health}  {sensorObject.sensor.name}
				</ListGroup.Item>
			);
		});

		const { selectedOption } = this.state;

		return(
			<Container>
				<Row><h3>Sentuators</h3></Row>
				<Row>
					<Select
						value={selectedOption}
						onChange={this.handleChange}
						options={selectOptions}
						autoFocus
						className={'select_styles'}
					/>
				</Row>
				<Row>
					<div className="sentuator_container">
						<h6>Actuators:</h6>
						<div className="sentuator_list">
							<ListGroup>
								{actuatorRows}
							</ListGroup>
						</div>
					</div>
					<div className="sentuator_container">
						<h6>Sensors:</h6>
						<div className="sentuator_list">
							<ListGroup>
								{sensorRows}
							</ListGroup>
						</div>
					</div>
				</Row>
				<Row>
					<div>
						<h6>Sentuator Value:</h6>
						<div><ul>{this.state.sentuatorValue.map(value => <li key={value}>{value}</li>)}</ul></div>
					</div>
				</Row>
			</Container>
		);
	}
}

export default SentuatorsComponent;
