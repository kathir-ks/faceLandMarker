// eslint-disable-next-line
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
import main from "./createFaceLandmarker";

import * as tf from '@tensorflow/tfjs';
// const fs = require("fs");
// const { PDFDocument, rgb } = require("pdf-lib");

main();

// // import {PDFDocument, rgb} from "pdf-lib";
// const { FaceLandmarker, FilesetResolver } = vision;
// const demosSection = document.getElementById("demos");
// const videoBlendShapes = document.getElementById("video-blend-shapes");

// let faceLandmarker;
// let runningMode = "IMAGE";
// let enableWebcamButton;
// let webcamRunning = false;
// const videoWidth = 480;

// const classFrequencies = [0, 0, 0, 0, 0, 0, 0, 0];

// // Add a global variable to store the blendshapes data
// let blendShapesData = [];

// const model = await tf.loadLayersModel('https://model-facelandmark.s3.us-west-2.amazonaws.com/model.json');
// console.log("Success");

// async function createFaceLandmarker() {
//   const filesetResolver = await FilesetResolver.forVisionTasks(
//     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
//   );
//   faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
//     baseOptions: {
//       modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
//       delegate: "GPU"
//     },
//     outputFaceBlendshapes: true,
//     runningMode,
//     numFaces: 1
//   });
//   demosSection.classList.remove("invisible");
// }
// createFaceLandmarker();

// const video = document.getElementById("webcam");

// const canvasElement = document.getElementById("output_canvas");

// function hasGetUserMedia() {
//   return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
// }

// if (hasGetUserMedia()) {
//   enableWebcamButton = document.getElementById("webcamButton");
//   enableWebcamButton.addEventListener("click", enableCam);
// } else {
//   console.warn("getUserMedia() is not supported by your browser");
// }

// // to save the classFrequencies as json file
// // Function to save class frequencies as a JSON file
// function saveClassFrequenciesAsJSON() {
//   const classLabels = ["Angry", "Contempt", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"];
//   const classFrequenciesWithLabels = {};

//   for (let i = 0; i < classLabels.length; i++) {
//     const label = classLabels[i];
//     classFrequenciesWithLabels[label] = classFrequencies[i];
//   }

//   const jsonData = JSON.stringify(classFrequenciesWithLabels, null, 2);
//   const blob = new Blob([jsonData], { type: "application/json" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "class_frequencies.json";
//   a.click();
// }

// function enableCam(event) {
//   if (!faceLandmarker) {
//     console.log("Wait! faceLandmarker not loaded yet.");
//     return;
//   }

//   if (webcamRunning === true) {
//     webcamRunning = false;

//     videoBlendShapes.innerHTML = "";
//     if (video.srcObject) {
//       const tracks = video.srcObject.getTracks();
//       tracks.forEach((track) => {
//         track.stop();
//       });
//     }
//     video.srcObject = null;
//     enableWebcamButton.innerText = "ENABLE PREDICTIONS";

//     // Save the blendShapesData as a JSON file
//     // Save the blendShapesData as a JSON file
// if (blendShapesData.length > 0) {
//   console.log(classFrequencies);
//   const jsonData = JSON.stringify(blendShapesData, null, 2);
//   const blob = new Blob([jsonData], { type: "application/json" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "blendshapes_data.json";
//   a.click();

//   saveClassFrequenciesAsJSON();

// }
//   } else {
//     webcamRunning = true;
//     enableWebcamButton.innerText = "DISABLE PREDICTIONS";
//     navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
//       video.srcObject = stream;
//       video.addEventListener("loadeddata", predictWebcam);
//     });

//     if (blendShapesData.length === 0) {
//       blendShapesData = []; // Initialize the blendshapes data array
//     }
//   }
// }

// async function predictWebcam() {
//   const radio = video.videoHeight / video.videoWidth;
//   video.style.width = videoWidth + "px";
//   video.style.height = videoWidth * radio + "px";
//   canvasElement.style.width = videoWidth + "px";
//   canvasElement.style.height = videoWidth * radio + "px";
//   canvasElement.width = video.videoWidth;
//   canvasElement.height = video.videoHeight;

//   if (runningMode === "IMAGE") {
//     runningMode = "VIDEO";
//     await faceLandmarker.setOptions({ runningMode: runningMode });
//   }

//   let startTimeMs = performance.now();
//   let lastVideoTime = -1;
//   let results = undefined;

//   if (lastVideoTime !== video.currentTime) {
//     lastVideoTime = video.currentTime;
//     results = faceLandmarker.detectForVideo(video, startTimeMs);
//   }
//   // to push the blendshapes data into the array
//   if (results.faceBlendshapes) {
//     // console.log(results.faceBlendshapes[0]);
    
//     let scores = [];
//     const inputJSON = results.faceBlendshapes[0];
//     // console.log(inputJSON);
//     if(inputJSON){
//     const categoryScores = inputJSON.categories.map(category => category.score);
//     // console.log(categoryScores);
//     scores = categoryScores;
//   }
//     if(scores.length!==0){
//       const input = tf.tensor(scores, [1,52]);
//       const output = model.predict(input);
//       const softmax = tf.softmax(output);
//       const probabilities = softmax.arraySync()[0];
//       const maxProbabilityIndex = probabilities.indexOf(Math.max(...probabilities));
//       classFrequencies[maxProbabilityIndex]++;
//       console.log(maxProbabilityIndex);
//       // console.log(softmax);
//     }
//     blendShapesData.push(results.faceBlendshapes);
//   }

//   drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

//   if (webcamRunning === true) {
//     window.requestAnimationFrame(predictWebcam);
//   }
// }


// function drawBlendShapes(el, blendShapes) {
//   if (!blendShapes || !blendShapes.length) {
//     return;
//   }

//   // explain how the below code works by using the comments below

//   let htmlMaker = "";
//   // eslint-disable-next-line
//   blendShapes[0].categories.map((shape) => {
//     htmlMaker += `
//       <li class="blend-shapes-item">
//         <span class="blend-shapes-label">${
//           shape.displayName || shape.categoryName
//         }</span>
//         <span class="blend-shapes-value" style="width: calc(${
//           +shape.score * 100
//         }% - 120px)">${(+shape.score).toFixed(2)}</span>
//       </li>
//     `;
//   });

//   el.innerHTML = htmlMaker;
// }