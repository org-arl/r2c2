import React, {PureComponent} from "react";
import {ListGroup} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {Group, Line} from "pts";
import StarfishMissions from "../../../lib/StarfishMissions";
import CoordSysContext from "../CoordSysContext";
import {checkComponentDidUpdate} from "../../../lib/react-debug-utils";
import {css, StyleSheet} from "aphrodite";

const styles = StyleSheet.create({
    addTaskComment: {
        fontSize: "0.75em",
        color: "#666",
    },
});

const DEBUG = true;

/**
 * props: mission, selectedTaskIndex, onTaskSelected, onTaskAdded, onTaskDeleted
 */
class MissionPlannerMissionComponent
    extends PureComponent {

    static contextType = CoordSysContext;

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        const mission = this.props.mission;
        const selectedTaskIndex = this.props.selectedTaskIndex;

        if (!mission) {
            return null;
        }
        return (
            <ListGroup>
                {mission.tasks.map((task, index) => {
                    return (
                        <ListGroup.Item action
                                        className={(index === selectedTaskIndex) ? 'active' : ''}
                                        onClick={(e) => this._onSelect(task, index)}
                                        key={index}>
                            <div className="d-flex justify-content-between">
                                <div>
                                    {this._getType(task)}: {this._toPositionString(task.position)}
                                </div>
                                <div>
                                    <div className="btn btn-danger btn-sm"
                                         onClick={(e) => this._onDelete(e, task, index)}>
                                        <FontAwesomeIcon color="white"
                                                         icon={faTrashAlt}
                                                         onClick={(e) => this._onDelete(e, task, index)}
                                                         title="Delete task"/>
                                    </div>
                                </div>
                            </div>
                        </ListGroup.Item>
                    );
                })}
                <ListGroup.Item className={css(styles.addTaskComment)} key="newTask">
                    Right-click on map to add a new task
                </ListGroup.Item>
            </ListGroup>
        );
    }

    // ---- custom public methods ----

    handleEvent(e) {
        const mission = this.props.mission;
        const coordSys = this.context;
        if (!mission || !coordSys) {
            return;
        }

        const distanceThreshold = 10;
        const point = [coordSys.long2locx(e.latlng.lng), coordSys.lat2locy(e.latlng.lat)];
        const points = mission.tasks.map((task) => [task.position.x, task.position.y]);
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
        const newTask = this._createNewTask(point);
        if (matchedIndex >= 0) {
            this._fireOnTaskAdded(newTask, matchedIndex + 1);
        } else {
            if (points.length > 1) {
                const distanceSquared1 = this._getDistanceSquared(point, points[0]);
                const distanceSquared2 = this._getDistanceSquared(point, points[points.length - 1]);
                if (distanceSquared2 <= distanceSquared1) {
                    this._fireOnTaskAdded(newTask, points.length);
                } else {
                    this._fireOnTaskAdded(newTask, 0);
                }
            } else {
                this._fireOnTaskAdded(newTask, points.length);
            }
        }
    }

    // ---- event handlers ----

    _onSelect(task, index) {
        if (this.props.onTaskSelected) {
            this.props.onTaskSelected(index);
        }
    }

    _onDelete(e, task, index) {
        e.stopPropagation();

        this._fireOnTaskDeleted(task, index);
    }

    // ----

    _fireOnTaskAdded(task, index) {
        if (this.props.onTaskAdded) {
            this.props.onTaskAdded(task, index);
        }
    }

    _fireOnTaskDeleted(task, index) {
        if (this.props.onTaskDeleted) {
            this.props.onTaskDeleted(task, index);
        }
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
