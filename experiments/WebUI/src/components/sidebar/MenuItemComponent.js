import React from 'react';
import { bool, string } from 'prop-types';
import { Row, Container } from 'react-bootstrap';
import { StyleSheet, css } from 'aphrodite';
import { NavLink } from 'react-router-dom';

const styles = StyleSheet.create({
    activeBar: {
        height: 56,
        width: 3,
        backgroundColor: '#DDE2FF',
        position: 'absolute',
        left: 0
    },
    activeContainer: {
        backgroundColor: 'rgba(221,226,255, 0.08)'
    },
    activeTitle: {
        color: '#DDE2FF'
    },
    container: {
        height: 56,
        cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgba(221,226,255, 0.08)'
        },
        paddingLeft: 32,
        paddingRight: 32
    },
    title: {
        margin: 'auto',
        fontSize: 16,
        lineHeight: '20px',
        letterSpacing: '0.2px',
        color: '#A4A6B3',
        marginLeft: 24
    }
});

function MenuItemComponent(props){
	const {active, icon, title, ...otherProps} = props;
	// const Icon = icon;
	return (
        <Container>
            {/*<NavLink to={"/"+title}>*/}
                <Row className={css(styles.container, active && styles.activeContainer)} {...otherProps}>
                    {active && <div className={css(styles.activeBar)}></div>}
                    <div className={css(styles.title, active && styles.activeTitle)}>{title}</div>
                </Row>
            {/*</NavLink>*/}
        </Container>
	);
}

MenuItemComponent.propTypes = {
	active: bool,
	icon: string,
	title: string
};

export default MenuItemComponent;
