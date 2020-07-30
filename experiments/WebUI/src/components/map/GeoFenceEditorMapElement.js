import React, {PureComponent} from "react";
import {LayerGroup, Marker, Polygon, Popup} from "react-leaflet";
import {mapPin, mapPinSelected} from "../../assets/MapIcons";
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
            selectedIndex: -1,
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
                        const selected = (this.state.selectedIndex === index);
                        const lat = position[0];
                        const long = position[1];
                        const x = coordSys.long2locx(long);
                        const y = coordSys.lat2locy(lat);
                        const onClick = function (e) {
                            this.setState({
                                selectedIndex: index,
                            });
                            console.log('selected', index);
                        }.bind(this);
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
                            this._pushToEditStack();
                        }.bind(this);
                        return (
                            <Marker draggable={true}
                                    onClick={onClick}
                                    onDrag={onDrag}
                                    onDragEnd={onDragEnd}
                                    icon={selected ? mapPinSelected : mapPin}
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

    deleteSelectedPoint() {
        if (this.state.selectedIndex >= 0) {
            const positions = this.state.positions;
            positions.splice(this.state.selectedIndex, 1);
            this.setState({
                positions: [...positions],
                selectedIndex: -1,
            });
            this._pushToEditStack();
        }
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
            selectedIndex: -1,
            editStack: [...editStack],
        });
    }

    clear() {
        if (!this.state.positions || !this.state.positions.length) {
            return;
        }
        this.setState({
            positions: [],
            selectedIndex: -1,
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
