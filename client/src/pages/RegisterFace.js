import { Input, Button, Card, Form, Col, message, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
    getFullFaceDescription,
    isFaceDetectionModelLoaded,
    isFacialLandmarkDetectionModelLoaded,
    isFeatureExtractionModelLoaded,
    loadModels,
} from "../utils/faceUtil";
import {
    DEFAULT_WEBCAM_RESOLUTION,
    webcamResolutionType,
} from "../global/webcam";
import {
    inputSize
} from "../global/faceAPI";
// import { CheckError } from "../../../utils/ErrorHandling";
import { drawFaceRect } from "../utils/drawFaceRect";
import ModelLoading from "../utils/ModelLoading";
import ModelStatus from "../utils/ModelStatus";

const { Option } = Select;

const RegisterFace = ({
    addFacePhotoCallback,
    galleryRefetch,
    countRefetch,
    loading,
}) => {
    const [camWidth, setCamWidth] = useState(DEFAULT_WEBCAM_RESOLUTION.width);
    const [camHeight, setCamHeight] = useState(DEFAULT_WEBCAM_RESOLUTION.height);
    const [inputDevices, setInputDevices] = useState([]);
    const [selectedWebcam, setSelectedWebcam] = useState();

    const [fullDesc, setFullDesc] = useState(null);

    const [faceDescriptor, setFaceDescriptor] = useState([]);

    const [detectionCount, setDetectionCount] = useState(0);
    const [previewImage, setPreviewImage] = useState("");

    const [isAllModelLoaded, setIsAllModelLoaded] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [loadingMessageError, setLoadingMessageError] = useState("");

    const [waitText, setWaitText] = useState("");
    const [studentID, setStudentID] = useState('');

    const webcamRef = useRef();
    const canvasRef = useRef();

    const handleSelectWebcam = (value) => {
        setSelectedWebcam(value);
    };

    const handleWebcamResolution = (value) => {
        webcamResolutionType.map((type) => {
            if (value === type.label) {
                setCamWidth(type.width);
                setCamHeight(type.height);
            }
        });
    };

    const handleStudentIDChange = (event) => {
        setStudentID(event.target.value);
    };

    useEffect(() => {
        async function loadingtheModel() {
            await loadModels(setLoadingMessage, setLoadingMessageError);
            setIsAllModelLoaded(true);
        }
        if (
            !!isFaceDetectionModelLoaded() &&
            !!isFacialLandmarkDetectionModelLoaded() &&
            !!isFeatureExtractionModelLoaded()) {
            setIsAllModelLoaded(true);
            return;
        }

        loadingtheModel();
    }, [isAllModelLoaded]);

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(async (devices) => {
            let inputDevice = await devices.filter(
                (device) => device.kind === "videoinput"
            );
            setInputDevices({ ...inputDevices, inputDevice });
        });
    }, []);

    useEffect(() => {
        function capture() {
            if (
                typeof webcamRef.current !== "undefined" &&
                webcamRef.current !== null &&
                webcamRef.current.video.readyState === 4
            ) {
                setPreviewImage(webcamRef.current.getScreenshot());

                const videoWidth = webcamRef.current.video.videoWidth;
                const videoHeight = webcamRef.current.video.videoHeight;

                // Set canvas height and width
                canvasRef.current.width = videoWidth;
                canvasRef.current.height = videoHeight;

                // 4. TODO - Make Detections
                // e.g. const obj = await net.detect(video);

                // Draw mesh
                getFullFaceDescription(webcamRef.current.getScreenshot(), inputSize)
                    .then((data) => {
                        setFullDesc(data);
                        setFaceDescriptor(data[0]?.descriptor);
                        setWaitText("");
                    })
                    .catch((err) => {
                        setWaitText(
                            "Preparing face matcher and device setup, please wait..."
                        );
                    });
                const ctx = canvasRef.current.getContext("2d");

                drawFaceRect(fullDesc, ctx);
            }
        }

        let interval = setInterval(() => {
            capture();
        }, 200);

        return () => clearInterval(interval);
    });

    const handleSubmit = async () => {
        setStudentID('');

        const requestBody = {
            studentId: studentID,
            faceDescriptor: faceDescriptor.toString(),
        };

        try {
            const response = await fetch('http://localhost:8000/api/v1/register-face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Add Face Data Success!', data);
            } else {
                console.error('Adding Face Data unsuccessful!');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <Card>
            <Card title="Model Load">
                <ModelStatus errorMessage={loadingMessageError} />
            </Card>
            <br />
            {!isAllModelLoaded ? (
                <ModelLoading loadingMessage={loadingMessage} />
            ) : loadingMessageError ? (
                <div className="error">{loadingMessageError}</div>
            ) : (
                isAllModelLoaded &&
                loadingMessageError.length === 0 && (
                    <div>
                        <Form>
                            <Form.Item label="Webcam">
                                <Select
                                    defaultValue="Select Webcam"
                                    style={{ width: 500 }}
                                    onChange={handleSelectWebcam}
                                >
                                    {inputDevices?.inputDevice?.map((device) => (
                                        <Option key={device.deviceId} value={device.deviceId}>
                                            {device.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Webcam Size">
                                <Select
                                    defaultValue={DEFAULT_WEBCAM_RESOLUTION.label}
                                    style={{ width: 200 }}
                                    onChange={handleWebcamResolution}
                                >
                                    {webcamResolutionType.map((type) => (
                                        <Option key={type.label} value={type.label}>
                                            {type.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Form>
                        <p style={{ fontSize: "18px" }}>{waitText}</p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Webcam
                                muted={true}
                                ref={webcamRef}
                                audio={false}
                                width={camWidth}
                                height={camHeight}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                    deviceId: selectedWebcam,
                                }}
                                mirrored
                            />
                            <canvas
                                ref={canvasRef}
                                style={{
                                    position: "absolute",
                                    textAlign: "center",
                                    zindex: 8,
                                    width: camWidth,
                                    height: camHeight,
                                }}
                            />
                        </div>
                        {previewImage && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <h3>Previous Capture: </h3>
                                <img
                                    src={previewImage}
                                    alt="Capture"
                                    style={{ width: "200px", height: "200px" }}
                                />
                                <div style={{ marginTop: "10px" }}>
                                    <Button
                                        type="primary"
                                        onClick={handleSubmit}
                                        disabled={
                                            loading ||
                                            (fullDesc && fullDesc.length !== 1) ||
                                            (faceDescriptor && faceDescriptor.length !== 128)
                                        }
                                        loading={loading}
                                    >
                                        Save
                                    </Button>
                                    <Input
                                        type="text"
                                        placeholder="Enter your student ID"
                                        value={studentID}
                                        onChange={handleStudentIDChange}
                                    >

                                    </Input>
                                </div>
                            </div>
                        )}

                        <div>
                            <p>
                                Number of detection: {fullDesc ? fullDesc.length : 0}{" "}
                                {fullDesc && fullDesc.length > 1 && (
                                    <span className="alert">Cannot more than 2</span>
                                )}
                            </p>
                            Face Descriptors:{" "}
                            {fullDesc &&
                                fullDesc.map((desc, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            wordBreak: "break-all",
                                            marginBottom: "10px",
                                            backgroundColor: "lightblue",
                                        }}
                                    >
                                        <strong style={{ fontSize: "20px", color: "red" }}>
                                            Face #{index}:{" "}
                                        </strong>
                                        {desc.descriptor.toString()}
                                    </div>
                                ))}
                        </div>
                    </div>))}
        </Card>
    );
};


export default RegisterFace;