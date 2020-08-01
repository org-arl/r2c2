import React, {PureComponent} from "react";
import {LayerGroup, Marker, Polyline, Popup} from "react-leaflet";
import {mapPin} from "../../assets/MapIcons";
import CoordSysContext from "./CoordSysContext";
import {checkComponentDidUpdate} from "../../lib/react-debug-utils";

const DEBUG = true;

/**
 * Props: id, mission, color
 */
class MissionMapElement
    extends PureComponent {

    static contextType = CoordSysContext;

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        const coordSys = this.context;
        if (!coordSys || !this.props.mission) {
            return null;
        }
        const positions = this.props.mission.tasks.map(task =>
            [coordSys.locy2lat(task.position.y), coordSys.locx2long(task.position.x)]);
        return (
            <LayerGroup>
                <Polyline positions={positions} color="green"/>
                {positions.map((position, index) => {
                    const task = this.props.mission.tasks[index];
                    return (
                        <Marker icon={mapPin}
                                key={index}
                                position={position}>
                            <Popup>
                                [#{index + 1}]
                                Lat: {position[0].toFixed(4)},
                                Long: {position[1].toFixed(4)}
                                <br/>
                                x: {task.position.x.toFixed(2)},
                                y: {task.position.y.toFixed(2)}
                            </Popup>
                        </Marker>
                    );
                })}
            </LayerGroup>
        );
    }
}

export default MissionMapElement;
