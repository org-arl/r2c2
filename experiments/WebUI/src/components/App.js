import React from 'react';
import '../assets/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Row, Container, Button } from 'react-bootstrap';
import { StyleSheet, css } from 'aphrodite';
import SidebarComponent from './sidebar/SidebarComponent';
import DashboardComponent from './content/DashboardComponent';
import DiagnosticsComponent from './content/DiagnosticsComponent';
import MapComponent from './map/MapComponent';
import ScriptControl from './content/ScriptControl';
import SentuatorsComponent from './content/SentuatorsComponent';

import { Route, Switch, HashRouter } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';

const styles = StyleSheet.create({
    container_styles: {
    	margin: 0,
    	padding: 0,
    	maxWidth: '100%',
        height: '100vh',
        overflowX: "hidden"
    },
    content_styles: {

    },
    mainBlock_styles: {
        backgroundColor: '#F7F8FC',
        padding: 30,
        height: "100vh",
        overflowY: 'scroll',
        paddingLeft: 0
    },
    row_styles: {

    }

});

class App
	extends React.Component {

	constructor(props) {
		super(props);

		this.href = window.location.href;
		this.currentTab = this.href.substring(this.href.lastIndexOf('/') + 1);

		this.state = { selectedItem: this.currentTab };

		this.openNewWindow = this.openNewWindow.bind(this);
		// this.openToolbar = this.openToolbar.bind(this);
		this.toggleNav = this.toggleNav.bind(this);
	}

	openNewWindow(parentWindow, tab) {
		// parentWindow.document.getElementById("root").innerHTML = "hello";
		const href = window.location.href;
		const url = href.substring(0, href.lastIndexOf('/') + 1) + tab;
		var w = parentWindow.open(url, tab, "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1");
		// Hack used to bring focus to child window opened from another child window (close and reopen)
		w.close();
		w = parentWindow.open(url, tab, "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1");

	}

	toggleNav() {
		var sidebar = document.getElementById("sidebar");
		var mainBlock = document.getElementById("mainBlock");
		var menu = document.getElementById("menu");

		if (sidebar.classList.contains('sidebarActive')) {
			sidebar.classList.remove('sidebarActive');
			mainBlock.classList.remove("mainBlockPushRight");
			menu.classList.add("menu_custom");
		} else {
			sidebar.classList.add('sidebarActive');
			mainBlock.classList.add("mainBlockPushRight");
			menu.classList.remove("menu_custom");
		}
	}

	render() {
		const { selectedItem } = this.state;

		const href = window.location.href;
		const route = href.substring(href.lastIndexOf('/') + 1);
		// console.log(route);
		var menu = null;
		var menuBtn = null;
		if(route ===  'Dashboard' || route ===  'Diagnostics' || route ===  'Map' || route ===  'ScriptControl' || route === 'Sentuators') {
			menu = <div id="sidebar" className={'sidebar_custom'}>
				<SidebarComponent selectedItem={selectedItem} onClick={
					(clickedItem) => {
						// this.setState({selectedItem});

						this.openNewWindow(window.opener, clickedItem);
					}
				}/>
			</div>;
			// ToDo: not working for map, button gets hidden behind leaflet
			menuBtn = <Button className={"toggleBtn"} onClick={this.toggleNav}><FontAwesomeIcon icon={faSlidersH} color="#fff" /></Button>;
		}

		return (
				<HashRouter>
					<Container className={css(styles.container_styles)}>
						<Row className={css(styles.row_styles)}>

							<div id="mainBlock" className={css(styles.mainBlock_styles)} className={'mainBlock_custom'}>
									<div className={css(styles.content_styles)}>
										{/* {menuBtn} */}
										{menu}
										<Switch>
											<Route path="/Dashboard" component={() => <DashboardComponent title={selectedItem} />} />
											<Route path="/Diagnostics" component={() => <DiagnosticsComponent/>}/>
											<Route path="/Sentuators" component={() => <SentuatorsComponent/>}/>
											<Route path="/ScriptControl" component={() => <ScriptControl/>}/>
											<Route path="*" component={() => <MapComponent/>}/>
											{/* <Route path="*" component={() => <Main onClick={() => {this.openToolbar()}}/>}/> */}
										</Switch>
									</div>
							</div>
						</Row>
					</Container>
				</HashRouter>
		);
	}
}

export default App;
