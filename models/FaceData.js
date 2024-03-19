const mongoose = require('mongoose');

const faceDataSchema = new mongoose.Schema({
    studentId: String,
    faceDescriptor: String,
});

const FaceData = mongoose.model('FaceData', faceDataSchema);

module.exports = FaceData;
