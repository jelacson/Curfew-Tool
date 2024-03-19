const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

const cors = require("cors");

require("dotenv").config({ path: "./config.env" });

const port = process.env.PORT || 8000;

app.use(cors());

app.use(express.json());

const faceRecognitionRouter = require("./routes/faceRecognitionRouter");

// // Get MongoDB driver connection
// const dbo = require("./db/conn");

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

app.use('/api/v1', faceRecognitionRouter)

app.listen(port, () => {
    // Perform a database connection when server starts
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.log('Connected to MongoDB');
    });

    console.log(`Server is running on port: ${port}`);
});