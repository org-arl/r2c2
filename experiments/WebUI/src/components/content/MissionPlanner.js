import React from "react";

const MissionPlannerContext = React.createContext({
    coordSys: null,
    missionIndex: -1,
    mission: null,
    taskIndex: -1,
    task: null,
});

export default MissionPlannerContext;
