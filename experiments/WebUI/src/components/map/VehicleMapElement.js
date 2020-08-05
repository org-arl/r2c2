import React, {PureComponent} from "react";
import {Circle, LayerGroup, Marker, Popup} from "react-leaflet";
import {notReadyMarker, readyMarker} from "../../assets/MapIcons";
import CoordSysContext from "./CoordSysContext";
import {checkComponentDidUpdate} from "../../lib/react-debug-utils";

const DEBUG = false;

/**
 * Props: id, point, errorRadius, ready
 */
class VehicleMapElement
    extends PureComponent {

    static contextType = CoordSysContext;

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        const coordSys = this.context;
        if (!coordSys || !this.props.point) {
            return null;
        }
        const position = [coordSys.locy2lat(this.props.point.y), coordSys.locx2long(this.props.point.x)];
        return (
            <LayerGroup id={this.props.id}>
                <Marker icon={this.props.ready ? readyMarker : notReadyMarker}
                        position={position}>
                    <Popup>
                        Lat: {position[0].toFixed(4)},
                        Long: {position[1].toFixed(4)}
                        <br/>
                        x: {this.props.point.x.toFixed(2)},
                        y: {this.props.point.y.toFixed(2)}
                    </Popup>
                </Marker>
                <Circle center={position} radius={this.props.errorRadius}/>
            </LayerGroup>
        );
    }
}

export default VehicleMapElement;
