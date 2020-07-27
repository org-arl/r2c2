import React from 'react';
import {Button} from 'react-bootstrap';

import dashboardIcon from '../assets/img/meter.svg';
import diagnosticsIcon from '../assets/img/carDiagnostics.svg';
import scriptControlIcon from '../assets/img/script.svg';
import sentuatorsIcon from '../assets/img/sentuators.svg';

class ToolbarComponent
	extends React.Component {

    render() {
        return (
            <span>
				<Button onClick={(e) => this.props.onClick("Dashboard")}>
					<img title="Dashboard" src={dashboardIcon} height={25} width={25}
						 alt="Dashboard"/>
				</Button>
				<Button onClick={(e) => this.props.onClick("Diagnostics")}>
					<img title="Diagnostics" src={diagnosticsIcon} height={25} width={25}
						 alt="Diagnostics"/>
				</Button>
				<Button onClick={(e) => this.props.onClick("Sentuators")}>
					<img title="Sentuators" src={sentuatorsIcon} height={25} width={25}
						 alt="Sentuators"/>
				</Button>
                <Button onClick={(e) => this.props.onClick("ScriptControl")}>
					<img title="Script Control" src={scriptControlIcon} height={25} width={25}
						 alt="Script Control"/>
                </Button>
			</span>
        );
    }
}

export default ToolbarComponent;
