import React, {PureComponent} from "react";
import {LayerGroup, Polyline} from "react-leaflet";
import CoordSysContext from "./CoordSysContext";
import {checkComponentDidUpdate} from "../../lib/react-debug-utils";

const DEBUG = false;

/**
 * Props: id, color, maxSize, hidden
 */
class VehicleTrailMapElement
    extends PureComponent {

    static contextType = CoordSysContext;

    constructor(props, context) {
        super(props, context);

        this.state = {
            positions: [],
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        if (this.props.hidden || !this.state.positions) {
            return null;
        }
        return (
            <LayerGroup id={this.props.id}>
                <Polyline positions={this.state.positions} color={this.props.color}/>
            </LayerGroup>
        );
    }

    // ----

    addPoint(point) {
        const coordSys = this.context;
        if (!coordSys || !point) {
            return;
        }
        const positions = this.state.positions;
        positions.push([coordSys.locy2lat(point.y), coordSys.locx2long(point.x)]);
        // TODO Improve point culling
        if (positions.length > this.props.maxSize) {
            positions.splice(0, positions.length - this.props.maxSize);
        }
        this.setState({
            positions: [...positions],
        });
    }
}

export default VehicleTrailMapElement;
