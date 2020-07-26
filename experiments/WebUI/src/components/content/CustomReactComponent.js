import React from "react";

export const SECTION_PROPS = 'props';
export const SECTION_STATE = 'state';
export const SECTION_CONTEXT = 'context';

class CustomReactComponent
    extends React.Component {

    checkForChanges(nextProps, nextState, nextContext, callback) {
        const propsChanged = this._handleSection(SECTION_PROPS, nextProps, callback);
        const stateChanged = this._handleSection(SECTION_STATE, nextState, callback);
        const contextChanged = this._handleSection(SECTION_CONTEXT, nextContext, callback);
        return propsChanged || stateChanged || contextChanged;
    }

    _handleSection(section, nextValues, callback) {
        if (!this.cacheKeys || !(section in this.cacheKeys)) {
            return false;
        }
        const cacheKeys = this.cacheKeys[section];
        if ((cacheKeys === null) || (cacheKeys.length === 0)) {
            return false;
        }
        if (!this.cachedValues) {
            this.cachedValues = {};
        }
        if (!(section in this.cachedValues)) {
            this.cachedValues[section] = {};
        }
        const cachedValues = this.cachedValues[section];
        let changed = false;
        for (let i = 0; i < cacheKeys.length; i++) {
            const cacheKey = cacheKeys[i];
            const nextValue = nextValues[cacheKey];
            const cachedValue = cachedValues[cacheKey];
            if (!Object.is(nextValue, cachedValue)) {
                cachedValues[cacheKey] = nextValue;
                changed = true;
                if (callback) {
                    callback(section, cacheKey, nextValue, cachedValue);
                }
            }
        }
        return changed;
    }
}

export default CustomReactComponent;
