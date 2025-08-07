let selectedCamera = '';
let multiCamMode = false;
let cameraList = [];
let ptzInterval;

function fetchCameras() {
    fetch('http://localhost:5000/cameras')
        .then(res => res.json())
        .then(cameras => {
            cameraList = cameras;
            renderCameraButtons();
        });
}

function renderCameraButtons() {
    const container = document.getElementById('camera-buttons');
    container.innerHTML = '';
    cameraList.forEach(cam => {
        const btn = document.createElement('button');
        btn.textContent = cam;
        btn.onclick = () => switchCamera(cam);
        container.appendChild(btn);
    });
    const multiBtn = document.createElement('button');
    multiBtn.textContent = 'Multi View';
    multiBtn.onclick = () => switchMultiCam();
    container.appendChild(multiBtn);
    const itBtn = document.createElement('button');
    itBtn.textContent = 'IT Closets';
    itBtn.onclick = () => itCamera();
    container.appendChild(itBtn);
}

function switchCamera(cameraKey) {
    selectedCamera = cameraKey;
    multiCamMode = false;
    const imgHtml = `<img class="camera-stream-img" src="http://localhost:5000/camera-stream/${cameraKey}">`;
    document.getElementById('camera-stream').innerHTML = imgHtml;
    document.getElementById('camera-stream').classList.remove('multi-view-grid'); // Remove grid class
    updatePtzControls(true);
}

function switchMultiCam() {
    multiCamMode = true;
    const container = document.getElementById('camera-stream');
    container.innerHTML = ''; // Clear any existing content
    
    // Create a new div for the grid
    const gridDiv = document.createElement('div');
    gridDiv.className = 'multi-view-grid'; // Add the class for multi-view grid
    
    cameraList.forEach(cam => {
        const img = document.createElement('img');
        img.className = 'multi-stream-img';
        img.src = `http://localhost:5000/camera-stream/${cam}`;
        img.onclick = () => switchCamera(cam); // Click to select PTZ control
        gridDiv.appendChild(img);
    });
    
    // Append the grid to the container
    container.appendChild(gridDiv);

    updatePtzControls(false); // Disable PTZ controls as no specific camera is selected
}

function itCamera() {
    multiCamMode = false;
    const imgHtml = `<div>
                        <button id="itbutton">400</button>
                        <button id="itbutton">401</button>
                        <button id="itbutton">402</button>
                        <button id="itbutton">403</button>
                        <button id="itbutton">404</button>
                        <button id="itbutton">405</button>
                        <button id="itbutton">406</button>
                        <button id="itbutton">407</button>
                        <button id="itbutton">408</button>
                        <button id="itbutton">409</button>
                        <button id="itbutton">410</button>
                        <button id="itbutton">411</button>
                        <button id="itbutton">412</button>
                    </div>`;
    document.getElementById('camera-stream').innerHTML = imgHtml;
    document.getElementById('camera-stream').classList.remove('multi-view-grid'); // Remove grid class
    updatePtzControls(false);
}

async function ptzCommand(direction, value) {
    fetch(`http://localhost:5000/ptz/${selectedCamera}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, value })
    });
}

function startPtzCommand(direction, value) {
    ptzCommand(direction, value);
    ptzInterval = setInterval(() => ptzCommand(direction, value), 100);
}

function stopPtzCommand() {
    clearInterval(ptzInterval);
}

function attachPtzEventListeners(button, direction, value) {
    button.onmousedown = () => startPtzCommand(direction, value);
    button.onmouseup = stopPtzCommand;
    button.onmouseleave = stopPtzCommand;
}

function updatePtzControls(isCameraSelected) {
    const ptzControls = document.getElementById('ptz-controls');
    if (isCameraSelected) {
        ptzControls.innerHTML = `
            <button class="buttonptz">PTZ: </button>
            <button id="pan-left">Left</button>
            <button id="pan-right">Right</button>
            <button id="tilt-up">Up</button>
            <button id="tilt-down">Down</button>
            <button id="zoom-in">Zoom In</button>
            <button id="zoom-out">Zoom Out</button>
        `;
        
        attachPtzEventListeners(document.getElementById('pan-left'), 'rpan', -2);
        attachPtzEventListeners(document.getElementById('pan-right'), 'rpan', 2);
        attachPtzEventListeners(document.getElementById('tilt-up'), 'rtilt', 2);
        attachPtzEventListeners(document.getElementById('tilt-down'), 'rtilt', -2);
        attachPtzEventListeners(document.getElementById('zoom-in'), 'rzoom', 250);
        attachPtzEventListeners(document.getElementById('zoom-out'), 'rzoom', -250);
    } else {
        ptzControls.innerHTML = `
            <button class="buttonptz">Select a Camera for PTZ controls</button>
        `;
    }
}

fetchCameras();
updatePtzControls(false);