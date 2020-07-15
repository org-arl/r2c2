import React from 'react';
import { Row, Container, Button } from 'react-bootstrap';
import { StyleSheet, css } from 'aphrodite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';

import ToolbarComponent from '../ToolbarComponent';

const styles = StyleSheet.create({
    separator: {
        borderTop: '1px solid #DFE0EB',
        marginTop: 16,
        marginBottom: 16,
        opacity: 0.06
    }
});


class SidebarComponent extends React.Component{

	constructor(props) {
		super(props);

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
		return(
			<Container id="sidebarContainer" className={"sidebarContainer_custom"}>
				<Button className={"toggleBtn"} onClick={this.toggleNav}><FontAwesomeIcon icon={faSlidersH} color="#fff" /></Button>
				{/* <Row id="menu" className={"menu_custom"} >
					<MenuItemComponent
						title="Dashboard" icon="path_to_image"
						onClick={() => this.props.onChange('Dashboard')}
						active={this.props.selectedItem === 'Dashboard'}
					/>
					<MenuItemComponent
						title="Diagnostics" icon="path_to_image"
						onClick={() => this.props.onChange('Diagnostics')}
						active={this.props.selectedItem === 'Diagnostics'}
					/>
					<MenuItemComponent
						title="Sentuators" icon="path_to_image"
						onClick={() => this.props.onChange('Sentuators')}
						active={this.props.selectedItem === 'Sentuators'}
					/>
					<MenuItemComponent
						title="Map" icon="path_to_image"
						onClick={() => this.props.onChange('Map')}
						active={this.props.selectedItem === 'Map'}
					/>
					<MenuItemComponent
						title="ScriptControl" icon="path_to_image"
						onClick={() => this.props.onChange('ScriptControl')}
						active={this.props.selectedItem === 'ScriptControl'}
					/>
				</Row> */}
				<span id="menu" className={"menu_custom"}>
					<ToolbarComponent onClick={(clickedItem) => {this.props.onClick(clickedItem)}}/>
				</span>
			</Container>
		);
	}
}

export default SidebarComponent;
