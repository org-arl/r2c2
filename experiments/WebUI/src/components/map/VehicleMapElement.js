import React, {PureComponent} from "react";
import {Circle, LayerGroup, Marker, Polyline, Popup} from "react-leaflet";
import {notReadyMarker, readyMarker} from "../../lib/MapIcons";
import CoordSysContext from "./CoordSysContext";
import {checkComponentDidUpdate} from "../../lib/react-debug-utils";

const DEBUG = false;

/**
 * Props: id, status, errorRadius, ready
 */
class VehicleMapElement
    extends PureComponent {

    static contextType = CoordSysContext;

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        const coordSys = this.context;
        if (!coordSys || !this.props.status || !this.props.status.point) {
            return null;
        }
        const status = this.props.status;
        const position = this._toPosition(status.point);

        const bearingInRadians = status.bearing * Math.PI / 180.0;
        const bearingMultiplier = (status.speed * 10.0) + 1.0;
        const bearingPoint = {
            x: status.point.x + (Math.sin(bearingInRadians) * bearingMultiplier),
            y: status.point.y + (Math.cos(bearingInRadians) * bearingMultiplier),
        };
        const bearingLinePositions = [position, this._toPosition(bearingPoint)];

        return (
            <LayerGroup id={this.props.id}>
                <Marker icon={this.props.ready ? readyMarker : notReadyMarker}
                        position={position}>
                    <Popup>
                        Lat: {position[0].toFixed(4)},
                        Long: {position[1].toFixed(4)}
                        <br/>
                        x: {status.point.x.toFixed(2)},
                        y: {status.point.y.toFixed(2)}
                    </Popup>
                </Marker>
                <Circle center={position} radius={this.props.errorRadius}/>
                <Polyline positions={bearingLinePositions} color="orange"/>
            </LayerGroup>
        );
    }

    _toPosition(point) {
        const coordSys = this.context;
        return [coordSys.locy2lat(point.y), coordSys.locx2long(point.x)];
    }
}

export default VehicleMapElement;
