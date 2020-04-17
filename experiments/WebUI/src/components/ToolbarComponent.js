import React from 'react';
import { Button } from 'react-bootstrap';

import dashboardIcon from '../assets/img/meter.svg';
import diagnosticsIcon from '../assets/img/carDiagnostics.svg';

import mapIcon from '../assets/img/map.svg';
import scriptControlIcon from '../assets/img/script.svg';
import sentuatorsIcon from '../assets/img/sentuators.svg';

class ToolbarComponent extends React.Component {
	constructor(props) {
		super(props);
	}


	render(){
		return(
			<span>
				<Button onClick={() => this.props.onClick("Dashboard")}><img title="Dashboard" src={dashboardIcon} height={25} width={25}/></Button>
				<Button onClick={() => this.props.onClick("Diagnostics")}><img title="Diagnostics" src={diagnosticsIcon} height={25} width={25}/></Button>
				<Button onClick={() => this.props.onClick("Sentuators")}><img title="Sentuators" src={sentuatorsIcon} height={25} width={25}/></Button>
				{/* <Button onClick={() => this.props.onClick("Map")}><img title="Map" src={mapIcon} height={25} width={25}/></Button> */}
				<Button onClick={() => this.props.onClick("ScriptControl")}><img title="Script Control" src={scriptControlIcon} height={25} width={25}/></Button>
			</span>
		);
	}
}

export default ToolbarComponent;
