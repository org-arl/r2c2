import React from 'react';
import {Container, Row} from 'react-bootstrap';
import GaugeDashboard from './GaugeDashboard';

class DashboardComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

    }

    render() {
        return (
            <Container>
				<Row><h3>Dashboard</h3></Row>
                <Row>
                    <GaugeDashboard ref=""/>
                </Row>
            </Container>
        );
    }
}

export default DashboardComponent;
