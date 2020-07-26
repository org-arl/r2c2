import React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {Button, ListGroup, Modal} from 'react-bootstrap';

import MLegInfoComponent from './MLegInfoComponent';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSave, faTimes, faTrashAlt} from '@fortawesome/free-solid-svg-icons'
import MissionViewComponent from "./MissionViewComponent";
import MissionPlannerContext from "./MissionPlanner";

const styles = StyleSheet.create({
    missionsContainer: {
        position: "fixed",
        height: "50%",
        width: "300px",
        overflowY: "scroll",
        // top: "0px",
        // marginTop: "30px",
        left: "0px",
        backgroundColor: "#fff",
        padding: "5px",
        fontSize: "0.9em"
    }
});

class MissionTreeViewComponent
    extends React.Component {

    static contextType = MissionPlannerContext;

    constructor(props, context) {
        super(props, context);

        this.state = {
            missions: this._clone(this.props.missions),
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
        return (
            <div>
                <div className={css(styles.missionsContainer)}>
                    <ul>
                        {this.state.missions.map((mission, index) => {
                            const isSelected = (this.context.missionIndex === index);
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
                                        {isModified && (
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
                                        <MissionViewComponent ref={this.missionViewRef}/>
                                    )}
                                </ListGroup.Item>
                            );
                        })}
                        <ListGroup.Item
                            onClick={() => this.addNewMission()}
                            key="newMission"
                            className="addMissionBtn">
                            +
                        </ListGroup.Item>
                    </ul>
                </div>

                <MLegInfoComponent missionLeg={this.context.task}
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
            </div>
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
    }

    _onDiscardChangesCancelled(e) {
        this.setState({
            showDiscardChangesDialog: false,
            discardChangesMissionIndex: -1,
        });
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
        this.setState({
            showSaveChangesDialog: false,
            saveChangesMissionIndex: -1,
        });

        // TODO
    }

    _onSaveChangesCancelled(e) {
        this.setState({
            showSaveChangesDialog: false,
            saveChangesMissionIndex: -1,
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
        this.setState({
            showDeleteMissionDialog: false,
            deleteMissionIndex: -1,
        });

        // TODO
    }

    _onDeleteMissionCancelled(e) {
        this.setState({
            showDeleteMissionDialog: false,
            deleteMissionIndex: -1,
        });
    }

    // ----

    addNewMission(e) {
        console.log("add new mission");
        var missionsArr = this.state.missions;
        if (missionsArr === null) {
            missionsArr = [];
        }

        missionsArr.push([]);

        this.setState({
            missions: missionsArr,
            selectedMLeg: 0
        });
        this.props.viewMissionFunc(missionsArr.length - 1);
    }

    saveChanges(missionNumber) {
        console.log("Saving changes for Mission " + missionNumber);

        this.props.management.updateMission(this.state.missions[missionNumber - 1], missionNumber)
            .then(response => {
                console.log(response);
            })
            .catch(reason => {
                console.log('Error: could not save mission to the vehicle', reason);
            });
    }

    _clone(o) {
        return JSON.parse(JSON.stringify(o));
    }
}

export default MissionTreeViewComponent;
