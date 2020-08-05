import React, {PureComponent} from "react";
import {LayerGroup, Marker, Polyline} from "react-leaflet";
import {mapPin, mapPinSelected} from "../../../assets/MapIcons";
import {checkComponentDidUpdate} from "../../../lib/react-debug-utils";

const DEBUG = true;

function _toPositions(mission, coordSys) {
    if (!coordSys || !mission) {
        return null;
    }
    return mission.tasks.map(task => [coordSys.locy2lat(task.position.y), coordSys.locx2long(task.position.x)]);
}

/**
 * props: id, coordSys, mission, selectedTaskIndex, color, onTaskSelected, onTaskMoved
 *
 * NOTE not using CoordSysContext due to derived state.
 */
class MissionPlannerMapElement
    extends PureComponent {

    constructor(props, context) {
        super(props, context);

        this.state = {
            positions: _toPositions(props.mission, props.coordSys),

            prevMission: props.mission,
            prevCoordSys: props.coordSys,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if ((props.mission !== state.prevMission) || (props.coordSys !== state.prevCoordSys)) {
            if (props.mission && props.coordSys) {
                return {
                    positions: _toPositions(props.mission, props.coordSys),

                    prevMission: props.mission,
                    prevCoordSys: props.coordSys,
                };
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        if (!this.state.positions) {
            return null;
        }
        return (
            <LayerGroup id={this.props.id}>
                <Polyline positions={this.state.positions} color={this.props.color}/>
                {this.state.positions.map((position, index) => (
                    <Marker position={position}
                            key={index}
                            icon={(index === this.props.selectedTaskIndex) ? mapPinSelected : mapPin}
                            draggable={true}
                            onClick={(e) => this._onSelect(e, index)}
                            onDrag={(e) => this._handleDrag(e, index)}
                            onDragEnd={(e) => this._handleDrag(e, index)}/>
                ))}
            </LayerGroup>
        );
    }

    _onSelect(e, index) {
        if (this.props.onTaskSelected) {
            this.props.onTaskSelected(index);
        }
    }

    _handleDrag(e, index) {
        const newPosition = [e.target._latlng.lat, e.target._latlng.lng];
        if (e.type === 'drag') {
            this._updatePosition(newPosition, index);
        } else if (e.type === 'dragend') {
            this._updatePosition(newPosition, index);
            if (this.props.onTaskMoved && this.props.coordSys) {
                const newPoint = {
                    x: this.props.coordSys.long2locx(newPosition[1]),
                    y: this.props.coordSys.lat2locy(newPosition[0]),
                    z: 0,
                };
                this.props.onTaskMoved(index, newPoint);
            }
        }
    }

    _updatePosition(newPosition, index) {
        const positions = this.state.positions;
        positions[index] = newPosition;
        this.setState({
            positions: [...positions],
        });
    }
}

export default MissionPlannerMapElement;
