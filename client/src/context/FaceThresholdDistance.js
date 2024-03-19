import React, { createContext, useState } from 'react';
import { maxDescriptorDistance } from "../global/faceAPI";

const FaceThresholdDistanceContext = createContext();

const FaceThresholdDistanceProvider = (props) => {
    const [threshold, SetThreshold] = useState(maxDescriptorDistance);
    function setFaceThresholdDistance(value) {
        SetThreshold(value);
    }
    return (
        <FaceThresholdDistanceContext.Provider value={{ threshold, setFaceThresholdDistance }} {...props} />
    );
};

export { FaceThresholdDistanceContext, FaceThresholdDistanceProvider };