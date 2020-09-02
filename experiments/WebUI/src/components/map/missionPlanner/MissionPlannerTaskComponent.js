import React, {Fragment, PureComponent} from 'react';
import {css, StyleSheet} from 'aphrodite';
import {Form, FormControl, ListGroup, Tab, Table} from 'react-bootstrap';

import StarfishMissions, {TYPES} from "../../../lib/StarfishMissions";
import {checkComponentDidUpdate} from "../../../lib/react-debug-utils";

const DEBUG = true;

const styles = StyleSheet.create({
    MissionPlannerTask: {
        position: "fixed",
        zIndex: 1000,
        top: "5rem",
        right: "10px",
        backgroundColor: "white",
        padding: "5px",
        fontSize: "0.9em",
    },
});

function _toForm(task) {
    if (!task) {
        return null;
    }

    const taskDefinition = StarfishMissions.getMissionTaskByType(task.type);

    const form = {
        type: null,
        properties: {},
        parameters: {},
        payloads: {},
        position: {
            x: {
                type: TYPES.FLOAT,
                value: task.position.x,
            },
            y: {
                type: TYPES.FLOAT,
                value: task.position.y,
            },
            z: {
                type: TYPES.FLOAT,
                value: task.position.z,
            },
        },
    };

    if (taskDefinition !== null) {
        form.type = taskDefinition.name;
        taskDefinition.props.forEach((prop) => {
            const value = ('properties' in task) && task.properties && (prop.name in task.properties)
                ? task.properties[prop.name] : '';
            form.properties[prop.name] = {
                type: prop.type,
                value: value,
            }
        });
    }
    StarfishMissions.getParameters().forEach((parameter) => {
        const value = ('parameters' in task) && task.parameters && (parameter.name in task.parameters)
            ? task.parameters[parameter.name] : '';
        form.parameters[parameter.name] = {
            type: parameter.type,
            value: value,
        };
    });
    StarfishMissions.getPayloads().forEach((payload) => {
        const value = ('payloads' in task) && task.payloads && (payload in task.payloads)
            ? task.payloads[payload] : '';
        form.payloads[payload] = {
            type: TYPES.INT,
            value: value,
        };
    });

    return form;
}

/*
 * properties: task, onChange
 */
class MissionPlannerTaskComponent
    extends PureComponent {

    constructor(props, context) {
        super(props, context);

        this.state = {
            task: props.task,
            form: _toForm(props.task),

            prevTask: props.task,
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.task !== state.prevTask) {
            return {
                task: props.task,
                form: _toForm(props.task),

                prevTask: props.task,
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        checkComponentDidUpdate(DEBUG, this, prevProps, prevState);
    }

    render() {
        const form = this.state.form;
        if (!form) {
            return null;
        }

        return (
            <div className={css(styles.MissionPlannerTask)}>
                <Tab.Container id="list-group-tabs-example" defaultActiveKey="#Properties">
                    <ListGroup horizontal>
                        <ListGroup.Item action href="#Properties">Properties</ListGroup.Item>
                        <ListGroup.Item action href="#Parameters">Parameters</ListGroup.Item>
                        <ListGroup.Item action href="#Payloads">Payloads</ListGroup.Item>
                        <ListGroup.Item action href="#Position">Position</ListGroup.Item>
                    </ListGroup>

                    <Tab.Content>
                        <Tab.Pane eventKey="#Properties">
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr key="task.type">
                                    <td>type</td>
                                    <td>
                                        <Form.Control name="type"
                                                      as="select"
                                                      value={form.type}
                                                      onChange={this._onTypeChange}>
                                            {StarfishMissions.getMissionTasks().map((taskDefinition, index) => {
                                                return (
                                                    <option key={index}>{taskDefinition.name}</option>
                                                );
                                            })}
                                        </Form.Control>
                                    </td>
                                </tr>
                                {this._createTableRows(form.properties, this._onPropertyChange)}
                                </tbody>
                            </Table>
                        </Tab.Pane>
                        <Tab.Pane eventKey="#Parameters">
                            {this._createTable(form.parameters, this._onParameterChange)}
                        </Tab.Pane>
                        <Tab.Pane eventKey="#Payloads">
                            {this._createTable(form.payloads, this._onPayloadChange)}
                        </Tab.Pane>
                        <Tab.Pane eventKey="#Position">
                            {this._createTable(form.position, this._onPositionChange)}
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </div>
        );
    }

    // ---- event handlers ----

    _onTypeChange = function (e) {
        const taskDefinition = StarfishMissions.getMissionTaskByName(e.target.value);
        if (taskDefinition === null) {
            return;
        }
        const task = this.props.task;
        task.type = taskDefinition.type;
        this.setState({
            form: _toForm(task),
        });
    }.bind(this);

    _onPropertyChange = function (e) {
        this._handleEvent('properties', e);
    }.bind(this);

    _onParameterChange = function (e) {
        this._handleEvent('parameters', e);
    }.bind(this);

    _onPayloadChange = function (e) {
        this._handleEvent('payloads', e);
    }.bind(this);

    _onPositionChange = function (e) {
        this._handleEvent('position', e);
    }.bind(this);

    _handleEvent(type, e) {
        if (((e.type === 'keyup') && (e.keyCode === 13)) || (e.type === 'blur')) {
            const name = e.target.name;
            const rawValue = e.target.value;
            const field = this.state.form[type][name];
            const value = this._parseValue(field.type, rawValue);
            field.value = (value !== null) ? value : '';
            this.setState({
                form: {...this.state.form},
            });
            const task = this.props.task;
            if (!(type in task)) {
                task[type] = {};
            }
            task[type][name] = value;
            if (this.props.onChange) {
                this.props.onChange(task);
            }
        } else if (e.type === 'change') {
            const name = e.target.name;
            const value = e.target.value;
            const field = this.state.form[type][name];
            field.value = value;
            this.setState({
                form: {...this.state.form},
            });
        }
    }

    _parseValue(type, rawValue) {
        if (type === TYPES.FLOAT) {
            const value = parseFloat(rawValue);
            if (isNaN(value)) {
                return null;
            }
            return value;
        } else if (type === TYPES.INT) {
            const value = parseInt(rawValue);
            if (isNaN(value)) {
                return null;
            }
            return value;
        } else if (type === TYPES.BOOLEAN) {
            return rawValue;
        } else if (type === TYPES.STRING) {
            return rawValue;
        } else {
            return rawValue;
        }
    }

    // ---- ui ----

    _createTable(o, changeFunction) {
        return (
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                </tr>
                </thead>
                <tbody>
                {o && this._createTableRows(o, changeFunction)}
                </tbody>
            </Table>
        );
    }

    _createTableRows(o, changeFunction) {
        if (!o) {
            return <Fragment/>;
        }
        const keys = this._getKeys(o);
        return (
            <Fragment>
                {keys.map((key, index) => {
                    return (
                        <tr key={index}>
                            <td>{key}</td>
                            <td>
                                <FormControl name={key} value={o[key].value}
                                             onChange={changeFunction}
                                             onBlur={changeFunction}
                                             onKeyUp={changeFunction}/>
                            </td>
                        </tr>
                    );
                })}
            </Fragment>
        );
    }

    _getKeys(o) {
        const keys = [];
        for (let key in o) {
            if (o.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys.sort();
        return keys;
    }
}

export default MissionPlannerTaskComponent;
