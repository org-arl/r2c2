import React, {PureComponent} from "react";
import {LayerGroup, Polyline} from "react-leaflet";
import CoordSysContext from "./CoordSysContext";
import {checkComponentDidUpdate} from "../../lib/react-debug-utils";

const DEBUG = false;

/**
 * Props: id, color, maxSize, minDistance, hidden
 */
class VehicleTrailMapElement
    extends PureComponent {

    static contextType = CoordSysContext;

    constructor(props, context) {
        super(props, context);

        this.state = {
            positions: [],
            lastPoint: null,
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
        if (this.state.lastPoint && this.props.minDistance) {
            const dx = this.state.lastPoint.x - point.x;
            const dy = this.state.lastPoint.y - point.y;
            const distance = Math.sqrt((dx * dx) + (dy * dy));
            if (distance < this.props.minDistance) {
                return;
            }
        }
        positions.push([coordSys.locy2lat(point.y), coordSys.locx2long(point.x)]);
        const size = positions.length;
        if (size > this.props.maxSize) {
            positions.splice(0, size - this.props.maxSize);
        }
        this.setState({
            positions: [...positions],
            lastPoint: point,
        });
    }
}

export default VehicleTrailMapElement;
