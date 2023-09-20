// // eslint-disable-next-line
// import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
// const { FaceLandmarker, FilesetResolver } = vision;
// const demosSection = document.getElementById("demos");
// const videoBlendShapes = document.getElementById("video-blend-shapes");

// let faceLandmarker;
// let runningMode = "IMAGE";
// let enableWebcamButton;
// let webcamRunning = false;
// const videoWidth = 640;

// // Add a global variable to store the blendshapes data
// let blendShapesData = [];

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
//     if (blendShapesData.length > 0) {
//       const jsonData = JSON.stringify(blendShapesData, null, 2);
//       const blob = new Blob([jsonData], { type: "application/json" });
//       const url = URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "blendshapes_data.json";
//       a.click();

//       // Optionally, you can reset the blendShapesData array after saving
//       blendShapesData = [];
//     }
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





// eslint-disable-next-line
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver } = vision;

const videoBlendShapes = document.getElementById("video-blend-shapes");
const tableContainer = document.getElementById("blendshapes-table-container");

let faceLandmarker;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoWidth = 640;

// Add a global variable to store the blendshapes data
let blendShapesData = [];

// Define the 2D array for storing blendshapes frequency
let blendShapesFrequency = [];

// Initialize the 2D array
for (let i = 0; i < 52; i++) {
    blendShapesFrequency[i] = Array(10).fill(0);
}

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
    document.getElementById("demos").classList.remove("invisible");
}
createFaceLandmarker();

const video = document.createElement("video");
video.id = "webcam";

const canvasElement = document.createElement("canvas");
canvasElement.id = "output_canvas";
document.body.appendChild(video);
document.body.appendChild(canvasElement);

function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}

// Function to create a dynamic table
function createBlendShapesTable() {
    const table = document.createElement("table");
    table.classList.add("blendshapes-table");

    // Create table header
    const header = table.createTHead();
    const headerRow = header.insertRow();
    for (let i = 0; i < 10; i++) {
        const cell = headerRow.insertCell();
        cell.innerText = `0.${i}-${0}.${i + 1}`;
    }

    // Create table body
    for (let i = 0; i < 52; i++) {
        const row = table.insertRow();
        for (let j = 0; j < 10; j++) {
            const cell = row.insertCell();
            cell.innerText = "0";
        }
    }

    tableContainer.appendChild(table);
}

createBlendShapesTable();

// Function to update the blendshapes frequency in the 2D array
function updateBlendShapesFrequency(blendShapes) {
    if (!blendShapes || !blendShapes.length) {
        return;
    }

    blendShapes[0].categories.forEach((shape) => {
        // Calculate the frequency class based on the shape's score
        const frequencyClass = Math.floor(shape.score * 10);
        const rowIndex = blendShapes[0].categories.indexOf(shape);
        if (rowIndex >= 0 && rowIndex < 52 && frequencyClass >= 0 && frequencyClass < 10) {
            blendShapesFrequency[rowIndex][frequencyClass]++;
        }
    });
}

// Function to save the blendshapes frequency in JSON format
function saveBlendShapesFrequencyAsJSON() {
    const jsonData = JSON.stringify(blendShapesFrequency);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "blendshapes_frequency.json";
    a.click();
}

// Function to enable or disable the camera
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
            saveBlendShapesFrequencyAsJSON();
            blendShapesData = []; // Optionally, reset the blendshapes data array
            blendShapesFrequency = []; // Optionally, reset the blendshapes frequency array
            for (let i = 0; i < 52; i++) {
                blendShapesFrequency[i] = Array(10).fill(0);
            }
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

// Function to draw blendshapes
function drawBlendShapes(el, blendShapes) {
    if (!blendShapes || !blendShapes.length) {
        return;
    }

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

// Modify the predictWebcam function to call updateBlendShapesFrequency
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
        updateBlendShapesFrequency(results.faceBlendshapes);
    }

    drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
