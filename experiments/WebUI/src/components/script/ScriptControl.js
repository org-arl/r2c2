import React, {PureComponent} from 'react'

import {faDownload, faPlay, faUpload} from "@fortawesome/free-solid-svg-icons";
import {FjageHelper} from "../../assets/fjageHelper.js";
import {Management} from "../../assets/jc2.js";
import {css, StyleSheet} from 'aphrodite';

import {SplitPane} from "react-collapse-pane";
import {Button, ButtonToolbar, Dropdown, Navbar, ProgressBar} from 'react-bootstrap';
import ReactResizeDetector from 'react-resize-detector';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-perl";
import "ace-builds/src-noconflict/theme-github";

import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const TITLE = "Script Control";

toast.configure();

const TOAST_OPTIONS = {
    position: toast.POSITION.BOTTOM_RIGHT,
    autoClose: true,
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    },
    editorContainer: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
    },
    outputContainer: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        overflowX: "auto",
        overflowY: "auto",
    },
});

class ScriptControl
    extends PureComponent {

    constructor(props, context) {
        super(props, context);

        this.gateway = FjageHelper.getGateway();

        this.state = {
            initialSizes: [3, 1],
            editorWidth: "0px",
            editorHeight: "0px",
            selectedSubroutine: null,
            running: false,
            output: null,
        };

        this.aceEditorRef = React.createRef();
    }

    componentDidMount() {
        document.title = TITLE;

        this.gateway.addConnListener((connected) => {
            if (connected) {
                this.management = new Management(this.gateway);

                this.management.getVehicleId()
                    .then(vehicleId => {
                        this._updateVehicleId(vehicleId);
                    })
                    .catch(reason => {
                        console.log('could not get vehicle ID', reason);
                    });

                this._onLoadScriptRequested();
            }
        });
    }

    componentWillUnmount() {
        this.gateway.close();
    }

    render() {
        return (
            <SplitPane split="horizontal"
                       initialSizes={this.state.initialSizes}>
                <div className={css(styles.container)}>
                    <Navbar bg="light">
                        <Navbar.Brand>Script Control</Navbar.Brand>
                        <Navbar.Collapse className="justify-content-end">
                            <ButtonToolbar>
                                <Button title="Load script from vehicle"
                                        size="sm"
                                        disabled={this.state.running}
                                        onClick={this._onLoadScriptRequested}
                                        className="ml-1">
                                    <FontAwesomeIcon icon={faUpload} color="white"/>
                                </Button>
                                <Button title="Save script to vehicle"
                                        size="sm"
                                        disabled={this.state.running}
                                        onClick={this._onSaveScriptRequested}
                                        className="ml-1">
                                    <FontAwesomeIcon icon={faDownload} color="white"/>
                                </Button>
                                <Dropdown className="ml-1"
                                          title="Select subroutine">
                                    <Dropdown.Toggle disabled={this.state.running}>
                                        {this.state.selectedSubroutine}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {this.state.subroutines && this.state.subroutines.map((subroutine, index) => (
                                            <Dropdown.Item key={index}
                                                           onClick={(e) => this._onSubroutineSelected(subroutine)}>
                                                {subroutine.name}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                                <Button title="Run script"
                                        size="sm"
                                        disabled={!this.state.selectedSubroutine || this.state.running}
                                        onClick={this._onRunScriptRequested}
                                        className="ml-1">
                                    <FontAwesomeIcon icon={faPlay} color="white"/>
                                </Button>
                            </ButtonToolbar>
                        </Navbar.Collapse>
                    </Navbar>
                    <div className={css(styles.editorContainer)}>
                        <AceEditor ref={this.aceEditorRef}
                                   readOnly={this.state.running}
                                   mode="perl"
                                   theme="github"
                                   width={this.state.editorWidth}
                                   height="100%"
                                   onChange={this._onCodeChange}/>
                        <ReactResizeDetector handleWidth handleHeight
                                             onResize={this._onResize}/>
                    </div>
                </div>
                <div className={css(styles.container)}>
                    <div className={css(styles.outputContainer)}>
                        <pre>{this.state.output}</pre>
                    </div>
                    {this.state.running && (
                        <ProgressBar animated now={100}/>
                    )}
                </div>
            </SplitPane>
        );
    }

    // ---- ui event handlers

    _onCodeChange = function (newValue) {
        this._requestSubroutineUpdate(3000);
    }.bind(this);

    _onResize = function (width, height) {
        this.setState({
            editorWidth: width + "px",
            editorHeight: height + "px",
        });
    }.bind(this);

    _onSubroutineSelected(subroutine) {
        this.setState({
            selectedSubroutine: subroutine.name,
        });
        if (this.aceEditorRef.current) {
            this.aceEditorRef.current.editor.gotoLine(subroutine.line, 0, false);
        }
    }

    _onLoadScriptRequested = function () {
        this.management.getScript()
            .then(script => {
                this.aceEditorRef.current.editor.session.getDocument().setValue(script);
                toast.success("Script loaded", TOAST_OPTIONS);
            })
            .catch(reason => {
                toast.error('Failed to load script', TOAST_OPTIONS);
            });
    }.bind(this);

    _onSaveScriptRequested = function () {
        const code = this.aceEditorRef.current.editor.session.getDocument().getValue();
        this.management.putScript(code)
            .then(response => {
                toast.success("Script saved", TOAST_OPTIONS);
            })
            .catch(reason => {
                toast.error('Failed to save script', TOAST_OPTIONS);
            });
    }.bind(this);

    _onRunScriptRequested = function () {
        if (!this.state.selectedSubroutine) {
            return;
        }
        this.management.runScript(this.state.selectedSubroutine)
            .then(id => {
                this.setState({
                    running: true,
                    output: null,
                });
                setTimeout(() => this._pollRunScriptResult(id), 1000);
                toast.info("Running " + this.state.selectedSubroutine + "...", TOAST_OPTIONS);
            })
            .catch(reason => {
                toast.error("Failed to run " + this.state.selectedSubroutine, TOAST_OPTIONS);
            });
    }.bind(this);

    _pollRunScriptResult = function (id) {
        this.management.getScriptRunResult(id)
            .then(response => {
                if (response.completed) {
                    const outputArray = [
                        'exitValue: ' + response.exitValue, '',
                        'stdout:', response.output, '',
                        'stderr:', response.error, '',
                    ];
                    const output = outputArray.join('\n');
                    this.setState({
                        output: output,
                        running: false,
                    });
                    toast.success("Finished running " + this.state.selectedSubroutine, TOAST_OPTIONS);
                } else {
                    setTimeout(() => this._pollRunScriptResult(id), 1000);
                }
            })
            .catch(reason => {
                toast.error("Failed to get script run result", TOAST_OPTIONS);
            });
    }.bind(this);

    // ----

    _requestSubroutineUpdate(timeout) {
        if (this.subroutineUpdateTimeoutHandle) {
            return;
        }
        this.subroutineUpdateTimeoutHandle = setTimeout(this._subroutineUpdater, timeout);
    }

    _subroutineUpdater = function () {
        const code = this.aceEditorRef.current.editor.session.getDocument().getValue();
        const subroutines = this._getSubroutines(code);
        let selectedSubroutine = null;
        for (let i = 0; i < subroutines; i++) {
            const subroutine = subroutines[i];
            if (subroutine.name === this.state.selectedSubroutine) {
                selectedSubroutine = subroutine.name;
                break;
            }
        }
        this.setState({
            subroutines: subroutines,
            selectedSubroutine: selectedSubroutine,
        });
        this.subroutineUpdateTimeoutHandle = null;
    }.bind(this);

    _updateVehicleId(vehicleId) {
        if (vehicleId) {
            document.title = vehicleId + " " + TITLE;
        } else {
            document.title = TITLE;
        }
    }

    _getSubroutines(code) {
        if (!code) {
            return null;
        }
        const subroutines = [];
        const regex = /sub\s+(\w+)\s*{/;
        const lines = code.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const p = line.indexOf('#');
            if (p >= 0) {
                line = line.substring(0, p);
            }
            line = line.trim();
            const result = regex.exec(line);
            if (result) {
                subroutines.push({
                    name: result[1],
                    line: i + 1,
                });
            }
        }
        return subroutines;
    }
}

export default ScriptControl;
