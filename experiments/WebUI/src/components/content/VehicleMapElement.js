import {Circle, LayerGroup, Marker, Popup} from "react-leaflet";
import React from "react";
import {notReadyMarker, readyMarker} from "../../assets/MapIcons";

export default class VehicleMapElement
    extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            position: props.position,
            positionError: props.positionError,
            ready: props.ready,
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.position !== prevProps.position) {
            this.setState({
                position: this.props.position,
            });
        }
        if (this.props.positionError !== prevProps.positionError) {
            this.setState({
                positionError: this.props.positionError,
            });
        }
        if (this.props.ready !== prevProps.ready) {
            this.setState({
                ready: this.props.ready,
            });
        }
    }

    render() {
        const point = [this.state.position.latitude, this.state.position.longitude];
        return (
            <LayerGroup>
                <Marker icon={this.state.ready ? readyMarker : notReadyMarker}
                        position={point}>
                    <Popup>
                        Lat: {this.state.position.latitude.toFixed(4)},
                        Long: {this.state.position.longitude.toFixed(4)}
                        <br/>
                        x: {this.state.position.x.toFixed(2)},
                        y: {this.state.position.y.toFixed(2)}
                    </Popup>
                </Marker>,
                <Circle center={point} radius={this.state.positionError}/>
            </LayerGroup>
        );
    }
}