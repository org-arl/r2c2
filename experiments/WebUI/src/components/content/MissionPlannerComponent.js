import React, {Fragment} from 'react';
import {Button, ListGroup, Modal} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusCircle, faSave, faTimes, faTrashAlt} from '@fortawesome/free-solid-svg-icons'
import {toast, ToastContainer} from "react-toastify";

import MissionPlannerContext from "./MissionPlanner";
import MissionPlannerMissionComponent from "./MissionPlannerMissionComponent";
import MissionPlannerTaskComponent from "./MissionPlannerTaskComponent";

class MissionPlannerComponent
    extends React.Component {

    static contextType = MissionPlannerContext;

    constructor(props, context) {
        super(props, context);

        this.state = {
            missionDefinitions: this._clone(this.props.missionDefinitions),
        };

        this.missionViewRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.missions !== this.props.missions) {
            this.setState({
                missions: this._clone(this.props.missions),
            });
        }
    }

    render() {
        const missions = this.state.missionDefinitions.missions;
        return (
            <Fragment>
                <div>
                    <ul>
                        {missions.map((mission, index) => {
                            const isSelected = (this.context.missionIndex === index);
                            const isNew = mission.createdAt;
                            const isModified = mission.updatedAt;
                            return (
                                <ListGroup.Item key={index}>
                                    <div onClick={(e) => this._onMissionSelected(e, mission, index)}
                                         className={isSelected ? 'caret caret-down' : 'caret'}>
                                        {isModified && (
                                            <span className="editedMission">*</span>
                                        )}
                                        <span>Mission #{index + 1}</span>
                                        {isModified && (
                                            <FontAwesomeIcon className="saveChangesBtn"
                                                             icon={faSave}
                                                             onClick={(e) => this._onSaveChangesRequested(e, mission, index)}
                                                             title="Save changes"/>
                                        )}
                                        {isModified && !isNew && (
                                            <FontAwesomeIcon className="discardChangesBtn"
                                                             icon={faTimes}
                                                             onClick={(e) => this._onDiscardChangesRequested(e, mission, index)}
                                                             title="Discard changes"/>
                                        )}
                                        <FontAwesomeIcon className="deleteMissionBtn"
                                                         icon={faTrashAlt}
                                                         onClick={(e) => this._onDeleteMissionRequested(e, mission, index)}
                                                         title="Delete mission"/>
                                    </div>
                                    {isSelected && (
                                        <MissionPlannerMissionComponent ref={this.missionViewRef}/>
                                    )}
                                </ListGroup.Item>
                            );
                        })}
                        <ListGroup.Item onClick={(e) => this._onAddMission(e)}
                                        key="newMission"
                                        className="addMissionBtn">
                            <FontAwesomeIcon icon={faPlusCircle} title="New mission"/>
                        </ListGroup.Item>
                    </ul>
                </div>

                <MissionPlannerTaskComponent missionLeg={this.context.task}
                                             onChange={(task) => this._onTaskChanged(task)}/>

                <Modal
                    show={this.state.showSaveChangesDialog}
                    backdrop="static"
                    keyboard={false}>
                    <Modal.Header>
                        <Modal.Title>Save changes</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to save changes to mission #{this.state.saveChangesMissionIndex + 1}?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary"
                                onClick={(e) => this._onSaveChangesCancelled(e)}>
                            Cancel
                        </Button>
                        <Button variant="primary"
                                onClick={(e) => this._onSaveChangesConfirmed(e)}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={this.state.showDiscardChangesDialog}
                    backdrop="static"
                    keyboard={false}>
                    <Modal.Header>
                        <Modal.Title>Discard changes</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to discard changes to mission #{this.state.discardChangesMissionIndex + 1}?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary"
                                onClick={(e) => this._onDiscardChangesCancelled(e)}>
                            Cancel
                        </Button>
                        <Button variant="primary"
                                onClick={(e) => this._onDiscardChangesConfirmed(e)}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={this.state.showDeleteMissionDialog}
                    backdrop="static"
                    keyboard={false}>
                    <Modal.Header>
                        <Modal.Title>Delete mission</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete mission #{this.state.deleteMissionIndex + 1}?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary"
                                onClick={(e) => this._onDeleteMissionCancelled(e)}>
                            Cancel
                        </Button>
                        <Button variant="primary"
                                onClick={(e) => this._onDeleteMissionConfirmed(e)}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>

                <ToastContainer/>
            </Fragment>
        );
    }

    // ---- public methods ----

    handleEvent(e) {
        if (this.missionViewRef.current) {
            this.missionViewRef.current.handleEvent(e);
        }
    }

    // ---- ui events ----

    _onMissionSelected(e, mission, index) {
        this.context.mission = mission;
        this.context.missionIndex = index;
        this.context.task = null;
        this.context.taskIndex = -1;
    }

    _onTaskChanged(task) {
        const mission = this.context.mission;
        mission.updatedAt = Date.now();
        this.context.mission = {...mission};
    }

    _onSaveChangesRequested(e, mission, index) {
        e.stopPropagation();

        if (!this.context.mission.updatedAt) {
            return;
        }

        this.setState({
            showSaveChangesDialog: true,
            saveChangesMissionIndex: index,
        });
    }

    _onSaveChangesConfirmed(e) {
        const index = this.state.saveChangesMissionIndex;

        this.setState({
            showSaveChangesDialog: false,
            saveChangesMissionIndex: -1,
        });

        const missions = this.state.missions;
        const mission = missions[index];
        delete (mission.updatedAt);
        this.props.management.updateMission(mission, index)
            .then(response => {
                console.log(response);
                toast.success('Changes to mission #' + (index + 1) + ' saved.');

                this.setState({
                    missions: [...missions],
                });
                this.context.mission = mission;
                this.context.task = null;
                this.context.taskIndex = -1;

                if (this.props.onMissionUpdated) {
                    this.props.onMissionUpdated(mission, index);
                }
            })
            .catch(reason => {
                console.log('Error: could not save mission', reason);
                toast.error('Failed to save changes to mission #' + (index + 1) + '.');
            });
    }

    _onSaveChangesCancelled(e) {
        this.setState({
            showSaveChangesDialog: false,
            saveChangesMissionIndex: -1,
        });
    }

    _onDiscardChangesRequested(e, mission, index) {
        e.stopPropagation();

        if (!this.context.mission.updatedAt) {
            return;
        }

        this.setState({
            showDiscardChangesDialog: true,
            discardChangesMissionIndex: index,
        });
    }

    _onDiscardChangesConfirmed(e) {
        const index = this.state.discardChangesMissionIndex;
        const missions = this.state.missions;
        const clonedOriginalMission = this._clone(this.props.missions[index]);
        missions[index] = clonedOriginalMission;
        this.setState({
            showDiscardChangesDialog: false,
            missions: [...missions],
        });
        this.context.mission = clonedOriginalMission;
        this.context.task = null;
        this.context.taskIndex = -1;

        toast.success('Changes to mission #' + (index + 1) + ' discarded.');
    }

    _onDiscardChangesCancelled(e) {
        this.setState({
            showDiscardChangesDialog: false,
            discardChangesMissionIndex: -1,
        });
    }

    _onDeleteMissionRequested(e, mission, index) {
        e.stopPropagation();

        this.setState({
            showDeleteMissionDialog: true,
            deleteMissionIndex: index,
        });
    }

    _onDeleteMissionConfirmed(e) {
        const index = this.state.deleteMissionIndex;

        this.setState({
            showDeleteMissionDialog: false,
            deleteMissionIndex: -1,
        });

        const missions = this.state.missions;
        const mission = this.state.missions[index];
        if (mission.createdAt) {
            missions.splice(index, 1);
            this.setState({
                missions: [...missions],
            });
            this.context.mission = null;
            this.context.missionIndex = -1;
            this.context.task = null;
            this.context.taskIndex = -1;
        } else {
            this.props.management.deleteMission(index)
                .then(response => {
                    console.log(response);
                    toast.success('Mission #' + (index + 1) + ' deleted.');

                    missions.splice(index, 1);
                    this.setState({
                        missions: [...missions],
                    });
                    this.context.mission = null;
                    this.context.missionIndex = -1;
                    this.context.task = null;
                    this.context.taskIndex = -1;

                    if (this.props.onMissionDeleted) {
                        this.props.onMissionDeleted(index);
                    }
                })
                .catch(reason => {
                    console.log('Error: could not delete mission', reason);
                    toast.error('Failed to delete mission #' + (index + 1) + '.');
                });
        }
    }

    _onDeleteMissionCancelled(e) {
        this.setState({
            showDeleteMissionDialog: false,
            deleteMissionIndex: -1,
        });
    }

    _onAddMission(e) {
        const mission = {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tasks: [],
        };
        const missions = this.state.missions;
        missions.push(mission);
        this.setState({
            missions: [...missions],
        });
        this.context.mission = mission;
        this.context.missionIndex = missions.length - 1;
        this.context.task = null;
        this.context.taskIndex = -1;
    }

    _clone(o) {
        return JSON.parse(JSON.stringify(o));
    }
}

export default MissionPlannerComponent;
