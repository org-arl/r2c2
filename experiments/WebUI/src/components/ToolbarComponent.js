import React, {PureComponent} from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';

import dashboardIcon from '../assets/img/meter.svg';
import diagnosticsIcon from '../assets/img/carDiagnostics.svg';
import scriptControlIcon from '../assets/img/script.svg';
import sentuatorsIcon from '../assets/img/sentuators.svg';
import WindowManager from "../lib/WindowManager";

class ToolbarComponent
    extends PureComponent {

    render() {
        return (
            <ButtonGroup>
                <Button onClick={(e) => this._onClick("Dashboard")}>
                    <img title="Dashboard" src={dashboardIcon} height={25} width={25} alt="Dashboard"/>
                </Button>
                <Button onClick={(e) => this._onClick("Diagnostics")}>
                    <img title="Diagnostics" src={diagnosticsIcon} height={25} width={25} alt="Diagnostics"/>
                </Button>
                <Button onClick={(e) => this._onClick("Sentuators")}>
                    <img title="Sentuators" src={sentuatorsIcon} height={25} width={25} alt="Sentuators"/>
                </Button>
                <Button onClick={(e) => this._onClick("ScriptControl")}>
                    <img title="Script Control" src={scriptControlIcon} height={25} width={25} alt="Script Control"/>
                </Button>
            </ButtonGroup>
        );
    }

    _onClick(routeName) {
        WindowManager.openWindow(routeName);
    }
}

export default ToolbarComponent;
