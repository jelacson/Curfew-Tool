import React from "react";

// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";

// We import all the components we need in our app

import RegisterFace from "./pages/RegisterFace.js";
import FaceRecognition from "./pages/FaceRecognition.js";

const App = () => {
    return (
        <div>
            <Routes>
                <Route exact path="/" element={<FaceRecognition />} />
                <Route exact path="/register" element={<RegisterFace />} />
            </Routes>
        </div>
    );
};

export default App;