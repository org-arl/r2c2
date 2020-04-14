import React from 'react';
import { Button } from 'react-bootstrap';


class Main extends React.Component {
	constructor(props) {
		super(props);
	}

	render(){
		return(
			<div><Button onClick={() => this.props.onClick()}>Open Toolbar</Button></div>
		);
	}
}

export default Main;
