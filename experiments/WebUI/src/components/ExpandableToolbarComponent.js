import React, {Fragment, PureComponent} from "react";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import ToolbarComponent from "./ToolbarComponent";

class ExpandableToolbarComponent
    extends PureComponent {

    constructor(props, context) {
        super(props, context);

        this.state = {
            showToolbar: false,
        };
    }

    render() {
        return (
            <Fragment>
                <Button size="sm" className="mr-2" onClick={this._onToggleToolbar}>
                    <FontAwesomeIcon icon={faBars}/>
                </Button>
                {this.state.showToolbar && (
                    <div className="mr-2">
                        <ToolbarComponent/>
                    </div>
                )}
            </Fragment>
        );
    }

    _onToggleToolbar = function () {
        this.setState({
            showToolbar: !this.state.showToolbar,
        });
    }.bind(this);
}

export default ExpandableToolbarComponent;
