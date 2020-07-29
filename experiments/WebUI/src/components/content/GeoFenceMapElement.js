import React from "react";
import {LayerGroup, Polygon} from "react-leaflet";

/**
 * Props: points, coordSys, color
 */
class GeoFenceMapElement
    extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            positions: this._toPositions(props.points),
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if ((this.props.points !== prevProps.points) || (this.props.coordSys !== prevProps.coordSys)) {
            this.setState({
                positions: this._toPositions(this.props.points),
            });
        }
    }

    render() {
        return (
            <LayerGroup>
                <Polygon positions={this.state.positions} color={this.props.color}/>
            </LayerGroup>
        );
    }

    _toPositions(points) {
        return points.map(point => [
            this.props.coordSys.locy2lat(point.y),
            this.props.coordSys.locx2long(point.x),
        ]);
    }
}

export default GeoFenceMapElement;
