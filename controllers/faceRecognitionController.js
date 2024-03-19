const FaceData = require('../models/FaceData')

const registerFaceData = async (req, res) => {
    const { studentId, faceDescriptor } = req.body;

    try {
        const newFaceData = new FaceData({
            studentId: studentId,
            faceDescriptor: faceDescriptor,
        });

        const savedFaceData = newFaceData.save();

        res.status(200).json(savedFaceData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add face data to the database' });
    }
}


const fetchFaceData = async (req, res) => {
    try {
        const allFaceData = await FaceData.find();

        if (!allFaceData || allFaceData.length === 0) {
            res.status(404).json({ error: "No face data found" });
        } else {
            res.status(200).json(allFaceData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve face data from the database' });
    }
}

module.exports = { registerFaceData, fetchFaceData }