const express = require("express");

const {
    registerFaceData, fetchFaceData
} = require('../controllers/faceRecognitionController')

const router = express.Router();

router.post("/register-face", registerFaceData);
router.get("/fetch-desc", fetchFaceData)

module.exports = router;
