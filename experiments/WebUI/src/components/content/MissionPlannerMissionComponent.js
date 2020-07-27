import React from "react";
import {ListGroup} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {Group, Line} from "pts";

import CustomReactComponent, {SECTION_CONTEXT} from "./CustomReactComponent";
import StarfishMissions from "../../lib/StarfishMissions";
import MissionPlannerContext from "./MissionPlanner";

class MissionPlannerMissionComponent
    extends CustomReactComponent {

    static contextType = MissionPlannerContext;

    constructor(props, context) {
        super(props, context);

        this.cacheKeys = {};
        this.cacheKeys[SECTION_CONTEXT] = ['mission', 'taskIndex'];
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return super.checkForChanges(nextProps, nextState, nextContext);
    }

    render() {
        const mission = this.context.mission;
        const taskIndex = this.context.taskIndex;

        if (mission === null) {
            return null;
        }
        return (
            <ListGroup>
                {mission.tasks.map((task, index) => {
                    return (
                        <ListGroup.Item action
                                        className={(index === taskIndex) ? 'active' : ''}
                                        onClick={(e) => this._onSelect(e, task, index)}
                                        key={index}>
                            <span>
                                {this._getType(task)}: {this._toPositionString(task.position)}
                            </span>
                            <FontAwesomeIcon className="deleteMissionBtn"
                                             icon={faTrashAlt}
                                             onClick={(e) => this._onDelete(e, task, index)}
                                             title="Delete task"/>
                        </ListGroup.Item>
                    );
                })}
                <ListGroup.Item className="AddMissionPointComment" key="newTask">
                    Right-click on map to add mission point
                </ListGroup.Item>
            </ListGroup>
        );
    }

    // ---- custom public methods ----

    handleEvent(e) {
        const distanceThreshold = 10;
        const mission = this.context.mission;
        if (mission !== null) {
            const point = [
                this.context.coordSys.long2locx(e.latlng.lng),
                this.context.coordSys.lat2locy(e.latlng.lat),
            ];
            const points = this.context.mission.tasks.map((task) => [task.position.x, task.position.y]);
            let matchedIndex = -1;
            let matchedDistance = NaN;
            for (let i = 0; i < (points.length - 1); i++) {
                const point1 = points[i];
                const point2 = points[i + 1];
                if (this._isInRectangle(point1, point2, point)) {
                    const line = Group.fromArray([point1, point2]);
                    const distance = Line.distanceFromPt(line, point);
                    if (distance <= distanceThreshold) {
                        if ((matchedIndex === -1) || (distance < matchedDistance)) {
                            matchedIndex = i;
                            matchedDistance = distance;
                        }
                    }
                }
            }
            if (matchedIndex >= 0) {
                mission.tasks.splice(matchedIndex + 1, 0, this._createNewTask(point));
                this._fireMissionUpdated(mission);
            } else {
                if (points.length > 1) {
                    const distanceSquared1 = this._getDistanceSquared(point, points[0]);
                    const distanceSquared2 = this._getDistanceSquared(point, points[points.length - 1]);
                    if (distanceSquared2 <= distanceSquared1) {
                        mission.tasks.push(this._createNewTask(point));
                        this._fireMissionUpdated(mission);
                    } else {
                        mission.tasks.splice(0, 0, this._createNewTask(point));
                        this._fireMissionUpdated(mission);
                    }
                } else {
                    mission.tasks.push(this._createNewTask(point));
                    this._fireMissionUpdated(mission);
                }
            }
        }
    }

    // ---- event handlers ----

    _onSelect(e, task, index) {
        this.context.task = task;
        this.context.taskIndex = index;
    }

    _onDelete(e, task, index) {
        e.stopPropagation();

        const mission = this.context.mission;
        mission.tasks.splice(index, 1);
        this._fireMissionUpdated(mission);
    }

    // ----

    _fireMissionUpdated(mission) {
        mission.updatedAt = Date.now();
        this.context.mission = {...mission};
        this.context.task = null;
        this.context.taskIndex = -1;
    }

    _isInRectangle(point1, point2, point) {
        for (let i = 0; i < 2; i++) {
            const coord = point[i];
            const coord1 = Math.min(point1[i], point2[i]);
            const coord2 = Math.max(point1[i], point2[i]);
            if ((coord < coord1) || (coord > coord2)) {
                return false;
            }
        }
        return true;
    }

    _getDistanceSquared(point1, point2) {
        const dx = (point1[0] - point2[0]);
        const dy = (point1[1] - point2[1]);
        return (dx * dx) + (dy * dy);
    }

    _createNewTask(point) {
        return {
            type: 'org.arl.jc2.mtt.SimpleMT',
            position: {
                x: point[0],
                y: point[1],
                z: 0,
            },
        };
    }

    _toPositionString(position) {
        return [
            position.x.toFixed(2),
            position.y.toFixed(2),
            position.z.toFixed(2),
        ].join(", ");
    }

    _getType(task) {
        const taskDefinition = StarfishMissions.getMissionTaskByType(task.type);
        if (taskDefinition !== null) {
            return taskDefinition.name;
        } else {
            const p = task.type.lastIndexOf('.');
            return (p >= 0) ? task.type.substring(p + 1) : task.type;
        }
    }
}

export default MissionPlannerMissionComponent;
