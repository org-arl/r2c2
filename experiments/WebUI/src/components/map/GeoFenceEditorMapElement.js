import React, {PureComponent} from "react";
import {LayerGroup, Marker, Polygon, Popup} from "react-leaflet";
import {mapPin} from "../../assets/MapIcons";
import CoordSysContext from "./CoordSysContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";

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
                                const positions = this.state.positions;
                                positions[index] = [e.latlng.lat, e.latlng.lng];
                                this.setState({
                                    positions: [...positions],
                                });
                            }
                        }.bind(this);
                        const onDragEnd = function (e) {
                            onDrag(e);
                            this.setState({
                                editStack: [...this.state.editStack, this._clonePositions(this.state.positions)],
                            });
                        }.bind(this);
                        const onDeletePoint = function (e) {
                            this._deletePoint(index);
                        }.bind(this);
                        return (
                            <Marker draggable={true}
                                    onDrag={onDrag}
                                    onDragEnd={onDragEnd}
                                    icon={mapPin}
                                    key={index}
                                    position={position}>
                                <Popup>
                                    <div>
                                        <span>Lat: {lat.toFixed(4)}, Long: {long.toFixed(4)}</span>
                                    </div>
                                    <div>
                                        <span>x: {x.toFixed(2)}, y: {y.toFixed(2)}</span>
                                    </div>
                                    <div class="text-right">
                                        <Button size="sm"
                                                variant="danger"
                                                title="Delete point"
                                                onClick={onDeletePoint}>
                                            <FontAwesomeIcon icon={faTrashAlt} color="#fff"/>
                                        </Button>
                                    </div>
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
        const newPosition = [e.latlng.lat, e.latlng.lng];
        const positions = this.state.positions ? this.state.positions : [];
        if (positions.length < 3) {
            positions.push(newPosition);
        } else {
            const index = this._findNearestLine(newPosition);
            positions.splice(index + 1, 0, newPosition);
        }
        this.setState({
            positions: [...positions],
            editStack: [...this.state.editStack, this._clonePositions(positions)],
        });
    }

    _findNearestLine(position) {
        const positions = this.state.positions;
        let matchedIndex = -1;
        let matchedDistanceSquared = NaN;
        for (let i = 0; i < positions.length; i++) {
            const index1 = i;
            const index2 = ((i + 1) % positions.length);
            const position1 = positions[index1];
            const position2 = positions[index2];
            const midPoint = [(position1[0] + position2[0]) / 2, (position1[1] + position2[1]) / 2];
            const d0 = midPoint[0] - position[0];
            const d1 = midPoint[1] - position[1];
            const distanceSquared = (d0 * d0) + (d1 * d1);
            if (isNaN(matchedDistanceSquared) || (distanceSquared < matchedDistanceSquared)) {
                matchedIndex = i;
                matchedDistanceSquared = distanceSquared;
            }
        }
        return matchedIndex;
    }

    _deletePoint(index) {
        const positions = this.state.positions;
        if (!positions || (index < 0) || (index >= positions.length)) {
            return;
        }
        positions.splice(index, 1);
        this.setState({
            positions: [...positions],
            editStack: [...this.state.editStack, this._clonePositions(positions)],
        });
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
