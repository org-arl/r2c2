import React from 'react';
import '../assets/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import DashboardComponent from './dashboard/DashboardComponent';
import DiagnosticsComponent from './diagnostics/DiagnosticsComponent';
import MapComponent from './map/MapComponent';
import ScriptControl from './script/ScriptControl';
import SentuatorsComponent from './sentuators/SentuatorsComponent';

import {HashRouter, Route, Switch} from 'react-router-dom';

class App
    extends React.Component {

    constructor(props) {
        super(props);

        this.href = window.location.href;
        this.currentTab = this.href.substring(this.href.lastIndexOf('/') + 1);

        this.state = {
            selectedItem: this.currentTab,
        };
    }

    render() {
        const {selectedItem} = this.state;

        return (
            <HashRouter>
                <Switch>
                    <Route path="/Dashboard"
                           component={() => <DashboardComponent title={selectedItem}/>}/>
                    <Route path="/Diagnostics"
                           component={() => <DiagnosticsComponent/>}/>
                    <Route path="/Sentuators"
                           component={() => <SentuatorsComponent/>}/>
                    <Route path="/ScriptControl"
                           component={() => <ScriptControl/>}/>
                    <Route path="*"
                           component={() => <MapComponent/>}/>
                </Switch>
            </HashRouter>
        );
    }
}

export default App;
