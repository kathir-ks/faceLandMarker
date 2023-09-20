// eslint-disable-next-line
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
// import * as fs from 'fs';
// import * as path from 'path';
// import { bundleResourceIO } from '@tensorflow/tfjs-core';
import { bundleResourceIO } from "@tensorflow/tfjs";

import * as tf from '@tensorflow/tfjs';
const { FaceLandmarker, FilesetResolver } = vision;
const demosSection = document.getElementById("demos");
const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoWidth = 480;

// Add a global variable to store the blendshapes data
let blendShapesData = [];

const model = await tf.loadLayersModel('https://model-facelandmark.s3.us-west-2.amazonaws.com/model.json');

// const modelURL = "https://drive.google.com/file/d/1-40-dnPLQQRlf0eU7wzqmrua8Vp2yaJO/view?usp=drive_link";
// const model = await tf.loadLayersModel(modelURL);


async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1
  });
  demosSection.classList.remove("invisible");
}
createFaceLandmarker();

const video = document.getElementById("webcam");

const canvasElement = document.getElementById("output_canvas");

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

function enableCam(event) {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;

    videoBlendShapes.innerHTML = "";
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    }
    video.srcObject = null;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";

    // Save the blendShapesData as a JSON file
    if (blendShapesData.length > 0) {
      const jsonData = JSON.stringify(blendShapesData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "blendshapes_data.json";
      a.click();

      // Optionally, you can reset the blendShapesData array after saving
      blendShapesData = [];
    }
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });

    if (blendShapesData.length === 0) {
      blendShapesData = []; // Initialize the blendshapes data array
    }
  }
}

async function predictWebcam() {
  const radio = video.videoHeight / video.videoWidth;
  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * radio + "px";
  canvasElement.style.width = videoWidth + "px";
  canvasElement.style.height = videoWidth * radio + "px";
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: runningMode });
  }

  let startTimeMs = performance.now();
  let lastVideoTime = -1;
  let results = undefined;

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
  }
  // to push the blendshapes data into the array
  if (results.faceBlendshapes) {
    blendShapesData.push(results.faceBlendshapes);
  }

  drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}


function drawBlendShapes(el, blendShapes) {
  if (!blendShapes || !blendShapes.length) {
    return;
  }

  // explain how the below code works by using the comments below

  let htmlMaker = "";
  // eslint-disable-next-line
  blendShapes[0].categories.map((shape) => {
    htmlMaker += `
      <li class="blend-shapes-item">
        <span class="blend-shapes-label">${
          shape.displayName || shape.categoryName
        }</span>
        <span class="blend-shapes-value" style="width: calc(${
          +shape.score * 100
        }% - 120px)">${(+shape.score).toFixed(2)}</span>
      </li>
    `;
  });

  el.innerHTML = htmlMaker;
}



