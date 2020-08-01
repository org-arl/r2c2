import React, {Fragment, PureComponent} from 'react';
import {css, StyleSheet} from 'aphrodite';
import CoordSysContext from "./CoordSysContext";
import {checkComponentDidUpdate} from "../../lib/react-debug-utils";

const styles = StyleSheet.create({
    cursorPositionContainer: {
        position: "fixed",
        bottom: "0px",
        left: "0px",
        backgroundColor: "#fff",
        padding: "5px",
        fontSize: "0.9em",
        zIndex: 1000,
    }
});

const DEBUG = false;

/**
 * Props: position
 */
class CursorPositionComponent
    extends PureComponent {

    static contextType = CoordSysContext;

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        if (!this.props.position) {
            return null;
        }
        const point = this._toPoint(this.props.position);
        return (
            <div className={css(styles.cursorPositionContainer)}>
                Lat: {this.props.position.latitude.toFixed(6)}, Long: {this.props.position.longitude.toFixed(6)}
                {point && (
                    <Fragment>
                        <br/>
                        X: {point.x.toFixed(3)}, Y: {point.y.toFixed(3)}
                    </Fragment>
                )}
            </div>
        );
    }

    _toPoint(position) {
        const coordSys = this.context;
        if (!coordSys || !position) {
            return null;
        }
        return {
            x: coordSys.long2locx(position.longitude),
            y: coordSys.lat2locy(position.latitude),
        };
    }
}

export default CursorPositionComponent;
