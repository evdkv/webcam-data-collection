var video = null;
var recorder = null;

// This will be empty for the rest of the study.
// Use study.options.datastore to access/mutate info in the data store
const dataStore = new lab.data.Store();

// Define the grid params
const horizontalSections = [
  [0.00001, 0.1],
  [0.1, 0.2],
  [0.2, 0.3],
  [0.3, 0.4],
  [0.4, 0.5],
  [0.5, 0.6],
  [0.6, 0.7],
  [0.7, 0.8],
  [0.8, 0.9],
  [0.9, 0.9999999],
];
const verticalSections = [
  [0.00001, 0.2],
  [0.2, 0.4],
  [0.4, 0.6],
  [0.6, 0.8],
  [0.8, 0.9999999],
];

function getRandomInt(min, max) {
  return Math.random() * (max - min) + min;
}

// TODO: use lab.js built-in randomization tool.
const shuffle = function(array) { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
}; 

const generateCoords = function(horizontalSections, verticalSections) {
  let coordParams = [];

  for (let i = 0; i < verticalSections.length; i++) {
    for (let j = 0; j < horizontalSections.length; j++) {
      coordParams.push({X: getRandomInt(horizontalSections[j][0], horizontalSections[j][1]),
                        Y: getRandomInt(verticalSections[i][0], verticalSections[i][1])});
    }
  }
  console.log(coordParams);
  return shuffle(coordParams);
}

const globalParams = generateCoords(horizontalSections, verticalSections);
const paramCpy = JSON.parse(JSON.stringify(globalParams));

const renderFunction = function(ts, canvas, ctx, obj) {
  var coords = obj.options.parameters.coords;
  // Commit dot_coords to the current component row
  document.getElementById("main-frame").style = "";
  ctx.restore();
  ctx.beginPath();
  ctx.arc(
    canvas.width * coords.X,  // x center
    canvas.height * coords.Y, // y center
    20,                // radius
    0,                   // start angle
    2 * Math.PI          // end angle (in radians)
  );

  ctx.fillStyle = '#010101';
  ctx.fill();
}

const renderGreenDot = function(ts, canvas, ctx, obj) {
  var coords = obj.options.parameters.coords;
  ctx.restore();
  ctx.beginPath();
  ctx.arc(
    canvas.width * coords.X,  // x center
    canvas.height * coords.Y, // y center
    20,                // radius
    0,                   // start angle
    2 * Math.PI          // end angle (in radians)
  );
  ctx.fillStyle = '#09A552';
  ctx.fill();
}

const renderScalingInstructions = function(ts, canvas, ctx, obj) {
  var element = document.getElementById('main-frame');
  var positionInfo = element.getBoundingClientRect();
  var height = positionInfo.height;
  var width = positionInfo.width;
  canvas.width = width;
  canvas.height = height;
  ctx.save()

  document.getElementById("main-frame").style = "border: 5pt solid red";
  canvas.style = "border: 5pt solid orange";
  ctx.font = "20px Verdana"
  ctx.fillText("- Now, we will scale the experiment to your browser window.", 
    canvas.width / 4, 
    canvas.height / 3.7); 
  ctx.fillText("- You should see the orange and the red line creating two bounding boxes.",
    canvas.width / 4,
    canvas.height / 3.2)
  ctx.fillText("- ORANGE box should sit right on top of RED box with NO gaps in between.",
    canvas.width / 4,
    canvas.height / 2.8)
  ctx.fillText("- If what you see is different, please reload the page and do not rescale the browser window.",
    canvas.width / 4,
    canvas.height / 2.5)
}

const canvasFactory = function(params, ix) {
  var coords = globalParams.pop();

  var trialSeq = new lab.flow.Sequence({
    content: [
      new lab.canvas.Screen({
        renderFunction: renderFunction,
        parameters: {
          coords: coords
        },
        timeout: 2000
      }),
      new lab.canvas.Screen({
        renderFunction: renderGreenDot,
        parameters: {
          coords: coords
        },
        responses: {
          "keypress(Space)": "next_dot_press"
        },
      })
    ]
  });
  return trialSeq;
}

const dotLoop = new lab.flow.Loop({
  template: canvasFactory,
  templateParameters: paramCpy
})

// *************************************************** //
// *************  WEB RTC FUNCTIONS  ***************** //
// *************************************************** //

function stopRecordingCallback() {
  video.srcObject = null;
  var blob = recorder.getBlob();
  video.src = URL.createObjectURL(blob);
  recorder.camera.stop();
}

const renderVid = function() {
  video = document.querySelector('video');
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  }).then(async function(stream) {
    video.srcObject = stream;
    recorder = RecordRTC(stream, {
        type: 'video'
    });
    recorder.startRecording();
    recorder.camera = stream;
  });
}

const videoPreview = new lab.html.Screen({
  content: ['<video controls="" autoplay="" playsinline=""></video>'],
  responses: {
    "keypress(Space)": "Space"
  }
});

// videoPreview.on('run', () => renderVid())
// videoPreview.on('end', () => recorder.stopRecording(stopRecordingCallback))


// *************************************************** //
// ****************  STUDY RUNNER  ******************* //
// *************************************************** //

// Define the sequence of components that define the study
const study = new lab.flow.Sequence({
  plugins: [
    new lab.plugins.Debug(),
    new lab.plugins.Metadata()
  ],
  content: [
    new lab.canvas.Screen({
      renderFunction: renderScalingInstructions,
      responses: {
        "keypress(Space)": "Space"
      }
    }),
    // videoPreview,
      dotLoop,
  ],
  datastore: dataStore
});

study.on('end', () => study.options.datastore.download());

// Prepare and run the study
// study.prepare();
study.run();