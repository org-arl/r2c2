import React from 'react';
import * as d3 from "d3";
import { Button } from 'react-bootstrap';


class D3BarComponent extends React.Component{

	static defaultProps = {
		width 						: 150,
		height 						: 200,
		lowerLimit 					: -30,
		upperLimit 					: 60,
		transitionMS				: 100,
		majorTicks					: 10
	}

	constructor(props, context){
		super(props, context);
		this.state = {
			temp: this.props.lowerLimit
		};
		

		this.renderThermometer = this.renderThermometer.bind(this);
		this.updateTemperature = this.updateTemperature.bind(this);
		this.update = this.update.bind(this);
		this.update2 = this.update2.bind(this);
	}

	componentDidMount() {
		this.renderThermometer();
	}

	componentDidUpdate() {
		// this.updateTemperature(this.state.temp);
	}

	/*
	 *  Draw the thermometer with width/height/transform attributes
	 *  that are relative to the size of the viewport.
	 *
	 *  Set and label the thermometer scalre
	 *
	 */
	renderThermometer() {

		// Append rect to be used as thermometer to the svg
		this.svg = d3.select(this.barDiv)
						.append("svg")
						.attr("width", this.props.width)
						.attr("height", this.props.height);

		const meter = this.svg.append("rect").classed("thermometer",true);

		/* Scale for thermometer
		*  input domain is the Celsius scale (-30°C to 60°C)
		*  output range extend is the height of the rect.thermometer
		*/
		this.scale = d3.scaleLinear().domain([this.props.lowerLimit,this.props.upperLimit]).range([0,this.props.height/1.1]);

		// Scale for yAxis label for rect.thermometer
		this.yAxis = d3.scaleLinear().domain([this.props.lowerLimit,this.props.upperLimit]).range([this.props.height/1.1,0]);

		meter.attr("width", this.props.width/8)
			.attr("height", this.props.height/1.1)
			.attr("rx", this.props.width/16)
			.attr("ry", this.props.width/16)
			.attr("transform", "translate(" + this.props.width/2 + ",10)")
			.attr("stroke-width", "2")
			.attr("stroke", "#34495E")
			.attr("fill", "#ffffff");


		this.svg.append("g").classed("bulbLabels",true)
			.attr("stroke", "#34495E")
			.attr("fill", "#ffffff")
			.attr("transform", "translate(" +  this.props.width/10  + ",10)")
			.call(d3.axisRight(this.yAxis).ticks(this.props.majorTicks));

		d3.selectAll("text")
			.attr("stroke-width", "0")
			.attr("fill", "#34495E");

		this.updateTemperature(this.props.lowerLimit);


	}


	/*
	 *  Animate the mercury
	 *  representing that temperature.
	 */
	updateTemperature(temp) {

		const temperature = this.scale(temp);

		const mercury = this.svg.selectAll("rect.mercury");


		this.svg.append("rect")
			.classed("mercury",true)
			.attr("y", this.props.height/1.1 + temperature + 10)
			.attr("height", - this.props.height/1.1)
			.attr("x", this.props.width/1.99)
			.attr("rx", this.props.width/16.5)
			.attr("ry", this.props.width/16.5)
			.attr("width", this.props.width/8.5)
			.attr("stroke-width", "2")
			.attr("stroke", "#c0392b")
			.attr("fill", "#E74C3C");

		mercury
			.exit().remove();

		mercury
			.transition()
			.attr("y", this.props.height/1.1 - temperature + 10)
			.attr("height", temperature)
			.duration(this.props.transitionMS);

		this.textDiv.innerHTML = "Temperature: " + temp;

	}

	update(){
		this.updateTemperature(20);
	}

	update2(){
		this.updateTemperature(10);
	}

	render(){
		return(
			<div>
			<div ref={(ref) => (this.barDiv = ref)} />
			<div ref={(ref) => (this.textDiv = ref)} />
			{/*<Button variant="outline-danger" onClick={this.update}>Cancel</Button>
			<Button variant="outline-danger" onClick={this.update2}>Cancel2</Button>*/}
			</div>
		);
	}
}

export default D3BarComponent;