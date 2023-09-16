var video = document.querySelector('video');
var recorder;

function captureCamera(callback) {
    navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(function (camera) {
        callback(camera);
    }).catch(function (error) {
        alert('Unable to capture your camera. Please check console logs.');
        console.error(error);
    });
}

function stopRecordingCallback() {
    video.srcObject = null;
    var blob = recorder.getBlob();
    video.src = URL.createObjectURL(blob);
    recorder.camera.stop();
}

document.getElementById('btn-start-recording').onclick = function () {
    this.disabled = true;
    captureCamera(function (camera) {
        video.srcObject = camera;
        recorder = RecordRTC(camera, {
            type: 'video'
        });
        recorder.onStateChanged = function (state) {
            document.getElementById('state').innerHTML = state;
        };
        recorder.startRecording();
        // release camera on stopRecording
        recorder.camera = camera;
        document.getElementById('btn-stop-recording').disabled = false;
        document.getElementById('btn-pause-recording').disabled = false;
    });
};

document.getElementById('btn-stop-recording').onclick = function () {
    this.disabled = true;
    document.getElementById('btn-pause-recording').disabled = true;
    document.getElementById('btn-upload-recording').disabled = false;
    recorder.stopRecording(stopRecordingCallback);
};

document.getElementById('btn-pause-recording').onclick = function () {
    this.disabled = true;
    if (this.innerHTML === 'Pause Recording') {
        recorder.pauseRecording();
        this.innerHTML = 'Resume Recording';
    }
    else {
        recorder.resumeRecording();
        this.innerHTML = 'Pause Recording';
    }
    setTimeout(function () {
        document.getElementById('btn-pause-recording').disabled = false;
    }, 1000);
};

document.getElementById('btn-upload-recording').onclick = function () {
    this.disabled = true;
    let blob = recorder.getBlob();
    jatos.uploadResultFile(blob, "example.video")
        .done(() => { document.getElementById('state').innerHTML = "uploaded" })
        .fail(() => { document.getElementById('state').innerHTML = "upload failed" })
        .always(() => {
            document.getElementById('btn-start-recording').disabled = false;
        });
}

jatos.addAbortButton();