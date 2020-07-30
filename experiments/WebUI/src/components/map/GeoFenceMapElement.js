import React, {PureComponent} from "react";
import {LayerGroup, Polygon} from "react-leaflet";
import CoordSysContext from "./CoordSysContext";

/**
 * Props: id, points, color
 */
class GeoFenceMapElement
    extends PureComponent {

    static contextType = CoordSysContext;

    render() {
        const positions = this._toPositions(this.props.points);
        if (!positions) {
            return null;
        }
        return (
            <LayerGroup id="this.props.id">
                <Polygon positions={positions} color={this.props.color}/>
            </LayerGroup>
        );
    }

    _toPositions(points) {
        const coordSys = this.context;
        if (!points || !coordSys) {
            return null;
        }
        return points.map(point => [
            coordSys.locy2lat(point.y),
            coordSys.locx2long(point.x),
        ]);
    }
}

export default GeoFenceMapElement;
