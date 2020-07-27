import React from "react";
import {LayerGroup, Marker, Polyline} from "react-leaflet";

import {mapPin, mapPinSelected} from "../../assets/MapIcons";

import CustomReactComponent, {SECTION_CONTEXT, SECTION_STATE} from "./CustomReactComponent";
import MissionPlannerContext from "./MissionPlanner";

export default class MissionPlannerMapElement
    extends CustomReactComponent {

    static contextType = MissionPlannerContext;

    constructor(props, context) {
        super(props, context);

        this.cacheKeys = {};
        this.cacheKeys[SECTION_STATE] = ['editing', 'points'];
        this.cacheKeys[SECTION_CONTEXT] = ['mission', 'taskIndex'];

        this.state = {
            editing: false,
            points: [],
        };
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return super.checkForChanges(nextProps, nextState, nextContext,
            (section, cacheKey, nextValue, cachedValue) => {
                if ((section === 'context') && (cacheKey === 'mission'))
                    this.setState({
                        points: nextValue ? this._toPoints(nextValue) : [],
                    });
            });
    }

    render() {
        const mission = this.context.mission;
        if (mission === null) {
            return null;
        }
        const taskIndex = this.context.taskIndex;
        const points = this.state.points;
        return (
            <LayerGroup>
                <Polyline positions={points} color="green"/>
                {points.map((point, index) => {
                    const task = mission.tasks[index];
                    return (
                        <Marker position={point}
                                key={index}
                                icon={(index === taskIndex) ? mapPinSelected : mapPin}
                                draggable={true}
                                onClick={(e) => this._onSelect(e, task, index)}
                                onDragStart={(e) => this._handleDrag(e, task, index)}
                                onDrag={(e) => this._handleDrag(e, task, index)}
                                onDragEnd={(e) => this._handleDrag(e, task, index)}/>
                    )
                })}
            </LayerGroup>
        );
    }

    _toPoints(mission) {
        const points = [];
        for (let i = 0; i < mission.tasks.length; i++) {
            const task = mission.tasks[i];
            points.push(this._toLatLng(task.position));
        }
        return points;
    }

    _onSelect(e, task, index) {
        this.context.task = task;
        this.context.taskIndex = index;
    }

    _handleDrag(e, task, index) {
        if (e.type === 'dragstart') {
            const points = this.state.points;
            const point = [e.target._latlng.lat, e.target._latlng.lng];
            points[index] = point;
            this.setState({
                editing: true,
                points: [...points],
            });
        } else if (e.type === 'drag') {
            const points = this.state.points;
            const point = [e.target._latlng.lat, e.target._latlng.lng];
            points[index] = point;
            this.setState({
                points: [...points],
            });
        } else if (e.type === 'dragend') {
            const position = {
                x: parseFloat(this.context.coordSys.long2locx(e.target._latlng.lng).toFixed(2)),
                y: parseFloat(this.context.coordSys.lat2locy(e.target._latlng.lat).toFixed(2)),
                z: task.position.z,
            };
            this.setState({
                editing: false,
            });
            task.position = position;
            const mission = this.context.mission;
            mission.updatedAt = Date.now();
            this.context.mission = {...mission};
            this.context.task = null;
            this.context.taskIndex = null;
        }
    }

    _toLatLng(position) {
        const coordSys = this.context.coordSys;
        return [
            coordSys.locy2lat(position.y),
            coordSys.locx2long(position.x),
        ];
    }
}
