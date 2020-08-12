import React from 'react';
import * as d3 from "d3";
import '../../assets/gauge.css';

class D3GaugeComponent extends React.Component{

	static defaultProps = {
		size						: 100,
		clipWidth					: 100,
		clipHeight					: 100,
		ringInset					: 20,
		ringWidth					: 3,

		pointerWidth				: 3,
		pointerTailLength			: 5,
		pointerHeadLengthPercent	: 0.9,

		minValue					: 0,
		maxValue					: 10,

		minAngle					: -150,
		maxAngle					: 150,

		transitionMs				: 750,

		majorTicks					: 10,
		labelFormat					: d3.format('d'),
		labelInset					: 10,
		arcColor					: '#000000',
		arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
	}

	constructor(props, context){
		super(props, context)
		this.state = {

		}
		this.range = undefined;
		this.renderD3Gauge = this.renderD3Gauge.bind(this);
		this.deg2rad = this.deg2rad.bind(this);
		this.update = this.update.bind(this);
		this.update2ndPointer = this.update2ndPointer.bind(this);
	}

	componentDidMount() {
		this.renderD3Gauge();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.val !== this.props.val) {
			this.update(this.props.val);
		}
	}

	deg2rad(deg) {
		return deg * Math.PI / 180;
	}

	renderD3Gauge(newValue){
		this.range = this.props.maxAngle - this.props.minAngle;
		const r = this.props.size / 2;
		const pointerHeadLength = Math.round(r * this.props.pointerHeadLengthPercent);

		// a linear scale that maps domain values to a percent from 0..1
		this.scale = d3.scaleLinear()
			.range([0,1])
			.domain([this.props.minValue, this.props.maxValue]);

		const ticks = this.scale.ticks(this.props.majorTicks);//the values depend on the domain and no. of values -> config.majorTicks
		// console.log(this.props.majorTicks);

		const tickData = d3.range(this.props.majorTicks).map(() => {
			return 1/this.props.majorTicks;
		});

		const arc = d3.arc()
			.innerRadius(r - this.props.ringWidth - this.props.ringInset)
			.outerRadius(r - this.props.ringInset)
			.startAngle((d, i) => {
				var ratio = d * i;
				return this.deg2rad(this.props.minAngle + (ratio * this.range));
			})
			.endAngle((d, i) => {
				var ratio = d * (i+1);
				return this.deg2rad(this.props.minAngle + (ratio * this.range));
			});



		const svg = d3.select(this.gaugeDiv)
			.append('svg:svg')
				.attr('class', 'gauge')
				.attr('width', this.props.clipWidth)
				.attr('height', this.props.clipHeight);

		var centerTx = 'translate(' + r + ',' + r + ')';

		var arcs = svg.append('g')
				.attr('class', 'arc')
				.attr('transform', centerTx);

		arcs.selectAll('path')
				.data(tickData)
			.enter().append('path')
				// .attr('fill', (d, i) => {
				// 	return this.props.arcColorFn(d * i);
				// })
				.attr('fill', this.props.arcColor)
				.attr('d', arc);

		var lg = svg.append('g')
				.attr('class', 'label')
				.attr('transform', centerTx);
		lg.selectAll('text')
				.data(ticks)
			.enter().append('text')
				.style("font-size", "10px")
				.attr('transform', (d) => {
					var ratio = this.scale(d);
					var newAngle = this.props.minAngle + (ratio * this.range);
					return 'rotate(' +newAngle +') translate(0,' +(this.props.labelInset - r) +')';
				})
				.text(this.props.labelFormat);

        this.gaugeVal = svg.append('g')
                        .attr('class', 'gaugeVal')
                        .attr('transform', centerTx);
        this.gaugeVal.append('text')
				.style("font-size", "10px")
                .text('0')
                .attr('transform','translate(0, -10)');

		const lineData = [ [this.props.pointerWidth / 2, 0],
						[0, -pointerHeadLength],
						[-(this.props.pointerWidth / 2), 0],
						[0, this.props.pointerTailLength],
						[this.props.pointerWidth / 2, 0] ];
		const pointerLine = d3.line().curve(d3.curveMonotoneX);
		const pg = svg.append('g').data([lineData])
				.attr('class', 'pointer')
				.attr('transform', centerTx);

		this.pointer = pg.append('path')
			.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
			.attr('transform', 'rotate(' + this.props.minAngle +')');


// ************2nd pointer********
        const lineData2 = [ [this.props.pointerWidth / 2, 0],
						[0, -pointerHeadLength],
						[-(this.props.pointerWidth / 2), 0],
						[0, this.props.pointerTailLength],
						[this.props.pointerWidth / 2, 0] ];
		const pointerLine2 = d3.line().curve(d3.curveMonotoneX);
		const pg2 = svg.append('g').data([lineData2])
				.attr('class', 'pointer2')
				.attr('transform', centerTx);

		this.pointer2 = pg2.append('path')
			.attr('d', pointerLine2/*function(d) { return pointerLine(d) +'Z';}*/ )
			.attr('transform', 'rotate(' + this.props.minAngle +')');

		// update((newValue === undefined) ? 0 : newValue);
		this.update(0);
		this.update2ndPointer(0);
	}

	update(newValue) {
		const ratio = this.scale(newValue);
		const newAngle = this.props.minAngle + (ratio * this.range);
		this.pointer.transition()
			.duration(this.props.transitionMs)
			.ease(d3.easeElastic)
			.attr('transform', 'rotate(' +newAngle +')');

		this.gaugeVal.select('text').text(newValue.toFixed(2));
	}

	update2ndPointer(newValue) {
		const ratio = this.scale(newValue);
		const newAngle = this.props.minAngle + (ratio * this.range);
		this.pointer2.transition()
			.duration(300)
			.attr('transform', 'rotate(' + newAngle +')');
	}

	render(){
		const titleStyle = {
			fontWeight: "bold",
			textAlign: "center",
			fontSize: "0.75em",
			marginBottom: "0.5em",
		};
		return(
			<div>
				<div style={titleStyle} ref={(ref) => (this.textDiv = ref)} > {this.props.title} </div>
				<div ref={(ref) => (this.gaugeDiv = ref)} />
			</div>
		);
	}
}

export default D3GaugeComponent;
