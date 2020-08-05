export const TYPES = {
    BOOLEAN: 'boolean',
    FLOAT: 'float',
    INT: 'int',
    STRING: 'string',
};

export class Property {

    /**
     * @param {string} name Property name.
     * @param {string} type Property type.
     * @param {string} description Property description.
     */
    constructor(name, type, description) {
        /** @type {string} */
        this.name = name;

        /** @type {string} */
        this.type = type;

        /** @type {string} */
        this.description = description;
    }
}

export class TaskDefinition {

    /**
     * @param {string} name Name.
     * @param {string} type Type.
     * @param {string} description Description.
     * @param {Property[]} props Properties.
     */
    constructor(name, type, description, props) {
        /** @type {string} */
        this.name = name;

        /** @type {string} */
        this.type = type;

        /** @type {Property[]} */
        this.props = props;
    }
}

/** type {TaskDefinition[]} */
export const MISSION_TASKS = [
    new TaskDefinition('BioCastMT', 'org.arl.jc2.mtt.BioCastMT', 'Bio-CAST', [
        new Property('SourceSLevel', TYPES.FLOAT, 'Source mean square sound level.'),
        new Property('mtTime', TYPES.INT, 'Mission task timeout.'),
        new Property('resamplingTime', TYPES.INT, 'Resampling time.'),
        new Property('sourceX', TYPES.FLOAT, 'Source X position.'),
        new Property('sourceY', TYPES.FLOAT, 'Source Y position.'),
    ]),
    new TaskDefinition('LawnMowerMT', 'org.arl.jc2.mtt.LawnMowerMT', 'Lawnmower', [
        new Property('xLength', TYPES.FLOAT, 'X length.'),
        new Property('yLength', TYPES.FLOAT, 'Y length.'),
        new Property('moweWidth', TYPES.FLOAT, 'Mower width.'),
        new Property('moweBearing', TYPES.FLOAT, 'Mower bearing.'),
    ]),
    new TaskDefinition('SimpleMT', 'org.arl.jc2.mtt.SimpleMT', 'Simple', [
        new Property('endHeading', TYPES.FLOAT, 'End heading.'),
    ]),
    new TaskDefinition('StationKeepingMT', 'org.arl.jc2.mtt.StationKeepingMT', 'Station-keeping', [
        new Property('duration', TYPES.FLOAT, 'Duration.'),
    ]),
    new TaskDefinition('SwanArmMT', 'org.arl.jc2.mtt.SwanArmMT', 'Swan arm', [
        new Property('missionTaskTimeout', TYPES.INT, 'Mission task timeout.'),
        new Property('reposeBehavior', TYPES.BOOLEAN, 'Repose behavior.'),
        new Property('armDepth', TYPES.FLOAT, 'Arm depth.'),
    ]),
    new TaskDefinition('TargetLocMT', 'org.arl.jc2.mtt.TargetLocMT', 'Target localization', [
        new Property('mtTimeOut', TYPES.INT, 'Mission task timeout.'),
    ]),
    new TaskDefinition('WaterSampleMT', 'org.arl.jc2.mtt.WaterSampleMT', 'Water sampler', [
        new Property('armDepth', TYPES.FLOAT, 'Arm depth.'),
    ]),
];

/** type {Property[]} */
export const PARAMETERS = [
    new Property('cruisingAltitude', TYPES.FLOAT, 'Cruising altitude.'),
    new Property('cruisingThrust', TYPES.FLOAT, 'Cruising thrust.'),
    new Property('maximumDepth', TYPES.FLOAT, 'Maximum depth.'),
    new Property('minimumAltitude', TYPES.FLOAT, 'Minimum altitude.'),
    new Property('safetyDistance', TYPES.FLOAT, 'Safety distance.'),
    new Property('waypointRadius', TYPES.FLOAT, 'Waypoint radius.'),
];

/** type {string[]} */
export const PAYLOADS = [
    'SIDESCAN',
    'SMARTLEDIF',
    'DTLA',
    'SWAN_ARM',
    'WATER_SAMPLER',
];

export default class StarfishMissions {

    /**
     * @returns {TaskDefinition[]} Mission tasks.
     */
    static getMissionTasks() {
        return MISSION_TASKS;
    }

    /**
     * @param name Mission task name.
     * @returns {null|TaskDefinition} Mission task.
     */
    static getMissionTaskByName(name) {
        for (let i = 0; i < MISSION_TASKS.length; i++) {
            const task = MISSION_TASKS[i];
            if (task.name === name) {
                return task;
            }
        }
        return null;
    }

    /**
     * @param type Mission task type.
     * @returns {null|TaskDefinition} Mission task.
     */
    static getMissionTaskByType(type) {
        for (let i = 0; i < MISSION_TASKS.length; i++) {
            const task = MISSION_TASKS[i];
            if (task.type === type) {
                return task;
            }
        }
        return null;
    }

    /**
     * @returns {Property[]} Parameters.
     */
    static getParameters() {
        return PARAMETERS;
    }

    /**
     * @returns {string[]} Payloads.
     */
    static getPayloads() {
        return PAYLOADS;
    }
};
