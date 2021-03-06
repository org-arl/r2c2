import React, {Fragment, PureComponent} from 'react';
import {Accordion, Button, ButtonToolbar, Card, Modal} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronDown, faChevronUp, faSave, faTimes, faTrashAlt} from '@fortawesome/free-solid-svg-icons'
import {toast} from "react-toastify";

import MissionPlannerMissionComponent from "./MissionPlannerMissionComponent";
import MissionPlannerTaskComponent from "./MissionPlannerTaskComponent";
import {checkComponentDidUpdate} from "../../../lib/react-debug-utils";
import CoordSysContext from "../CoordSysContext";

const TOAST_AUTOCLOSE = {
    position: toast.POSITION.BOTTOM_RIGHT,
    autoClose: true,
};

const DEBUG = true;

/**
 * props:
 * - missionDefinitions, selectedMissionIndex, selectedTaskIndex,
 * - onMissionSelected, onRevertMissionRequested, onSaveMissionRequested, onDeleteMissionRequested,
 * - onTaskSelected, onTaskChanged, onTaskAdded, onTaskDeleted,
 */
class MissionPlannerComponent
    extends PureComponent {

    static contextType = CoordSysContext;

    constructor(props, context) {
        super(props, context);

        this.state = {};

        this.missionViewRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        const missions = this.props.missionDefinitions.missions;
        const selectedMission =
            (this.props.selectedMissionIndex >= 0) && (this.props.selectedMissionIndex < missions.length)
                ? missions[this.props.selectedMissionIndex] : null;
        const selectedTask =
            selectedMission && (this.props.selectedTaskIndex >= 0) && (this.props.selectedTaskIndex < selectedMission.tasks.length)
                ? selectedMission.tasks[this.props.selectedTaskIndex] : null;
        return (
            <Fragment>
                <Accordion defaultActiveKey={-1}
                           activeKey={this.props.selectedMissionIndex + 1}
                           onSelect={this._onMissionSelected}>
                    {missions.map((mission, index) => {
                        const isSelected = (this.props.selectedMissionIndex === index);
                        const isNew = mission.createdAt;
                        const isModified = mission.updatedAt;
                        return (
                            <Card key={index}>
                                <Accordion.Toggle as={Card.Header}
                                                  eventKey={index + 1}
                                                  className="d-flex justify-content-between">
                                    <h5>
                                        {isModified && (
                                            <span>* </span>
                                        )}
                                        <span>#{index + 1}</span>
                                    </h5>
                                    <ButtonToolbar className="justify-content-end">
                                        {isModified && (
                                            <Button size="sm"
                                                    className="ml-1"
                                                    onClick={(e) => this._onSaveChangesRequested(e, mission, index)}>
                                                <FontAwesomeIcon color="white"
                                                                 icon={faSave}
                                                                 title="Save changes"/>
                                            </Button>
                                        )}
                                        {isModified && !isNew && (
                                            <Button size="sm"
                                                    className="ml-1"
                                                    variant="warning"
                                                    onClick={(e) => this._onDiscardChangesRequested(e, mission, index)}>
                                                <FontAwesomeIcon color="white"
                                                                 icon={faTimes}
                                                                 title="Discard changes"/>
                                            </Button>
                                        )}
                                        <Button size="sm"
                                                className="ml-1"
                                                variant="danger"
                                                onClick={(e) => this._onDeleteMissionRequested(e, mission, index)}>
                                            <FontAwesomeIcon color="white"
                                                             icon={faTrashAlt}
                                                             title="Delete mission"/>
                                        </Button>
                                        <div className="mt-1 mb-1 ml-3">
                                            <FontAwesomeIcon icon={isSelected ? faChevronUp : faChevronDown}/>
                                        </div>
                                    </ButtonToolbar>
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey={index + 1}>
                                    <Card.Body>
                                        {isSelected && (
                                            <MissionPlannerMissionComponent ref={this.missionViewRef}
                                                                            mission={mission}
                                                                            selectedTaskIndex={this.props.selectedTaskIndex}

                                                                            onTaskSelected={this.props.onTaskSelected}
                                                                            onTaskAdded={this.props.onTaskAdded}
                                                                            onTaskDeleted={this.props.onTaskDeleted}/>
                                        )}
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        );
                    })}
                </Accordion>

                <MissionPlannerTaskComponent task={selectedTask}
                                             onChange={this._onTaskChanged}/>

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

    _onMissionSelected = function (index) {
        if (this.props.onMissionSelected) {
            this.props.onMissionSelected(index - 1);
        }
    }.bind(this);

    _onTaskChanged = function (task) {
        if (this.props.onTaskChanged) {
            this.props.onTaskChanged(task);
        }
    }.bind(this);

    _onSaveChangesRequested(e, mission, index) {
        e.stopPropagation();

        if (!mission.updatedAt) {
            return;
        }

        this.setState({
            showSaveChangesDialog: true,
            saveChangesMissionIndex: index,
        });
    }

    _onSaveChangesConfirmed(e) {
        if (this.props.onSaveMissionRequested) {
            const index = this.state.saveChangesMissionIndex;
            const mission = this.props.missionDefinitions.missions[index];
            this.props.onSaveMissionRequested(index, mission);
        }
        this.setState({
            showSaveChangesDialog: false,
            saveChangesMissionIndex: -1,
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

        if (!mission.updatedAt) {
            return;
        }

        this.setState({
            showDiscardChangesDialog: true,
            discardChangesMissionIndex: index,
        });
    }

    _onDiscardChangesConfirmed(e) {
        if (this.props.onRevertMissionRequested) {
            const index = this.state.discardChangesMissionIndex;
            if (this.props.onRevertMissionRequested(index)) {
                toast.success('Changes to mission #' + (index + 1) + ' discarded.', TOAST_AUTOCLOSE);
            }
        }
        this.setState({
            showDiscardChangesDialog: false,
            discardChangesMissionIndex: -1,
        });
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
        if (this.props.onDeleteMissionRequested) {
            const index = this.state.deleteMissionIndex;
            this.props.onDeleteMissionRequested(index);
        }
        this.setState({
            showDeleteMissionDialog: false,
            deleteMissionIndex: -1,
        });
    }

    _onDeleteMissionCancelled(e) {
        this.setState({
            showDeleteMissionDialog: false,
            deleteMissionIndex: -1,
        });
    }
}

export default MissionPlannerComponent;
