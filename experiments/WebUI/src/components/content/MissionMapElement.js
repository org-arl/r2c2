import React from "react";
import {LayerGroup, Marker, Polyline, Popup} from "react-leaflet";
import {mapPin} from "../../assets/MapIcons";

export default class MissionMapElement
    extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            points: this._toPoints(this.props.mission),
            positions: this._toPositions(this.props.mission),
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.mission !== prevProps.mission) {
            this.setState({
                points: this._toPoints(this.props.mission),
                positions: this._toPositions(this.props.mission),
            });
        }
    }

    render() {
        return (
            <LayerGroup>
                <Polyline positions={this.state.points} color="green"/>
                {this.state.points.map((point, index) => {
                    const position = this.state.positions[index];
                    return (
                        <Marker icon={mapPin}
                                key={index}
                                position={point}>
                            <Popup>
                                Lat: {point[1].toFixed(4)},
                                Long: {point[0].toFixed(4)}
                                <br/>
                                x: {position.x.toFixed(2)},
                                y: {position.y.toFixed(2)}
                            </Popup>
                        </Marker>
                    );
                })}
            </LayerGroup>
        );
    }

    _toPoints(mission) {
        return mission.tasks.map((task) => [
            this.props.coordSys.locy2lat(task.position.y),
            this.props.coordSys.locx2long(task.position.x),
        ]);
    }

    _toPositions(mission) {
        return mission.tasks.map((task) => task.position);
    }
}
