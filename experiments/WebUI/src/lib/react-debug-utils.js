export function checkComponentDidUpdate(debug, component, prevProps, prevState) {
    if (!debug) {
        return;
    }
    const propsChanged = [];
    const stateChanged = [];
    Object.entries(component.props).forEach(([key, val]) =>
        (prevProps[key] !== val) && propsChanged.push(key)
    );
    if (component.state) {
        Object.entries(component.state).forEach(([key, val]) =>
            (prevState[key] !== val) && stateChanged.push(key)
        );
    }
    if ((propsChanged.length > 0) || (stateChanged.length > 0)) {
        console.log(component.constructor.name,
            (propsChanged.length > 0) ? propsChanged : null,
            (stateChanged.length > 0) ? stateChanged : null);
    }
}
