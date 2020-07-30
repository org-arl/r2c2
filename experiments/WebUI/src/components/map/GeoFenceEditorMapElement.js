import React, {PureComponent} from "react";
import {LayerGroup, Marker, Polygon, Popup} from "react-leaflet";
import {mapPin} from "../../assets/MapIcons";
import CoordSysContext from "./CoordSysContext";

/**
 * Props: id, points, color
 */
class GeoFenceEditorMapElement
    extends PureComponent {

    static contextType = CoordSysContext;

    constructor(props, context) {
        super(props, context);

        const positions = this._toPositions(props.points);
        this.state = {
            positions: positions,
            editStack: [this._clonePositions(positions)],
        };
    }

    render() {
        const coordSys = this.context;
        if (!coordSys || !this.state.positions) {
            return null;
        }
        return (
            <LayerGroup id={this.props.id}>
                <Polygon positions={this.state.positions}
                         color={this.props.color}/>
                {this.state.positions.map(
                    (position, index) => {
                        const lat = position[0];
                        const long = position[1];
                        const x = coordSys.long2locx(long);
                        const y = coordSys.lat2locy(lat);
                        const onDrag = function (e) {
                            if (e.latlng) {
                                this.state.positions[index] = [e.latlng.lat, e.latlng.lng];
                                this.setState({
                                    positions: [...this.state.positions],
                                });
                            }
                        }.bind(this);
                        const onDragEnd = function (e) {
                            onDrag(e);
                            this._pushToEditStack();
                        }.bind(this);
                        const onContextMenu = function (e) {
                            // TODO
                        }.bind(this);
                        return (
                            <Marker draggable={true}
                                    onDrag={onDrag}
                                    onDragEnd={onDragEnd}
                                    onContextMenu={onContextMenu}
                                    icon={mapPin}
                                    key={index}
                                    position={position}>
                                <Popup>
                                    <span>Lat: {lat.toFixed(4)}, Long: {long.toFixed(4)}</span>
                                    <br/>
                                    <span>x: {x.toFixed(2)}, y: {y.toFixed(2)}</span>
                                </Popup>
                            </Marker>
                        )
                    }
                )}
            </LayerGroup>
        );
    }

    getPoints() {
        const coordSys = this.context;
        if (!coordSys || !this.state.positions) {
            return null;
        }
        return this.state.positions.map(position => {
            return {
                x: coordSys.long2locx(position[1]),
                y: coordSys.lat2locy(position[0]),
            }
        });
    }

    undo() {
        if (!this.state.editStack || (this.state.editStack.length < 2)) {
            return;
        }
        const editStack = this.state.editStack;
        editStack.pop();
        const oldPositions = this._clonePositions(editStack[editStack.length - 1]);
        this.setState({
            positions: oldPositions,
            editStack: [...editStack],
        });
    }

    clear() {
        if (!this.state.positions || !this.state.positions.length) {
            return;
        }
        this.setState({
            positions: [],
            editStack: [...this.state.editStack, []],
        });
    }

    handleEvent(e) {
        // TODO
        console.log(e);
    }

    _pushToEditStack() {
        this.setState({
            editStack: [...this.state.editStack, this._clonePositions(this.state.positions)],
        });
    }

    _checkCollinear(points, point) {
        // epsilon accounts for the error in checking if a point is collinear.
        // Larger epsilon will result in wider range of points getting accepted as collinear
        // (even those that lie further from the line segment).
        const epsilon = 0.0000005;
        for (let i = 0; i < points.length; i++) {
            const point1 = points[i];
            const point2 = points[(i + 1) % points.length];
            const crossProduct = ((point[1] - point1[1]) * (point2[0] - point1[0]))
                - ((point[0] - point1[0]) * (point2[1] - point1[1]));
            if (Math.abs(crossProduct) < epsilon) {
                const dotProduct = ((point[0] - point1[0]) * (point2[0] - point1[0]))
                    + ((point[1] - point1[1]) * (point2[1] - point1[1]));
                if (dotProduct >= 0) {
                    const squaredLength = ((point2[0] - point1[0]) * (point2[0] - point1[0]))
                        + ((point2[1] - point1[1]) * (point2[1] - point1[1]));
                    if (dotProduct <= squaredLength) {
                        return i; // returns index on first match
                    }
                }
            }
        }
        return -1; //if not collinear
    }

    _toPositions(points) {
        const coordSys = this.context;
        if (!coordSys || !points) {
            return null;
        }
        return points.map(point => [coordSys.locy2lat(point.y), coordSys.locx2long(point.x)]);
    }

    _clonePositions(positions) {
        return positions.map(position => Array.from(position));
    }
}

export default GeoFenceEditorMapElement;
