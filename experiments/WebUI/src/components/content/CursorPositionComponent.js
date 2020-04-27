import React from 'react';
import { StyleSheet, css } from 'aphrodite';


const styles = StyleSheet.create({
	cursorPositionContainer: {
		position: "fixed",
		bottom: "0px",
		left: "0px",
		backgroundColor: "#fff",
		padding: "5px",
		fontSize: "0.9em"
	}
});

class CursorPositionComponent extends React.Component {
	constructor(props, context) {
		super(props, context);
	}

	render() {
		return (
			<div className={css(styles.cursorPositionContainer)}>
				Lat: {this.props.position.latitude}, Long: {this.props.position.longitude} <br/>
				X: {this.props.position.x}, Y: {this.props.position.y}
			</div>
		);
	}
}

export default CursorPositionComponent;
