jatos.onLoad(function() {
  var video = null;
  var recorder = null;

  var jatosMetaData = {};
  jatos.addJatosIds(jatosMetaData);

  // This will be empty for the rest of the study.
  // Use study.options.datastore to access/mutate info in the data store
  const dataStore = new lab.data.Store();
  const random = new lab.util.Random();

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

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  function fullscreenchanged(event) {
  // document.fullscreenElement will point to the element that
  // is in fullscreen mode if there is one. If not, the value
  // of the property is null.
  if (document.fullscreenElement) {
    study.options.datastore.set({messages : 'Participant ENTERED fs'});
    jatos.removeOverlay();
  } else {
    study.options.datastore.set({messages : 'Participant EXITED fs'});
    jatos.showOverlay({
      text: "Please press ENTER to return to fullscreen mode. Exiting fullscreen mode might invalidate study results",
      style: "background:red;color:white;text-align:center;",
      showImg: false
    });
  }
  };

  document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter") {
          toggleFullScreen();
        }
      },
      false,
  );
    

  document.addEventListener("fullscreenchange", fullscreenchanged);

  function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
  }

  // TODO: use lab.js built-in randomization tool.
  // const shuffle = function(array) { 
  //   for (let i = array.length - 1; i > 0; i--) { 
  //     const j = Math.floor(Math.random() * (i + 1)); 
  //     [array[i], array[j]] = [array[j], array[i]]; 
  //   } 
  //   return array; 
  // }; 

  const generateCoords = function(horizontalSections, verticalSections) {
    let coordParams = [];

    for (let i = 0; i < verticalSections.length; i++) {
      for (let j = 0; j < horizontalSections.length; j++) {
        coordParams.push({X: getRandomInt(horizontalSections[j][0], horizontalSections[j][1]),
                          Y: getRandomInt(verticalSections[i][0], verticalSections[i][1])});
      }
    }
    console.log(coordParams);
    return random.shuffle(coordParams);
  }

  function endSuccess() {
    var url = new URL("https://richmond.ca1.qualtrics.com/jfe/form/SV_3CqnAJ1nOwFXWjs");
    url.searchParams.append("participant_id", jatos.urlQueryParameters.participant_id);
    url.searchParams.append("return_status", "data_retrieved");
    url.searchParams.append("study_id", jatosMetaData.studyCode);
    url.searchParams.append("study_pool", jatosMetaData.batchTitle);
    jatos.endStudyAndRedirect(url.toString(), true, "success: " + jatos.urlQueryParameters.participant_id);
  }

  function endFail(failType) {
    var url = new URL("https://richmond.ca1.qualtrics.com/jfe/form/SV_3CqnAJ1nOwFXWjs");
    url.searchParams.append("participant_id", jatos.urlQueryParameters.participant_id);
    url.searchParams.append("return_status", "data_error");
    url.searchParams.append("study_id", jatosMetaData.studyCode);
    url.searchParams.append("study_pool", jatosMetaData.batchTitle);
    jatos.endStudyAndRedirect(url.toString(), false, "data upload error - " + failType + ": " + jatos.urlQueryParameters.participant_id);
  }

  function endException(failType) {
    var url = new URL("https://richmond.ca1.qualtrics.com/jfe/form/SV_3CqnAJ1nOwFXWjs");
    url.searchParams.append("participant_id", jatos.urlQueryParameters.participant_id);
    url.searchParams.append("return_status", "exception_error");
    url.searchParams.append("study_id", jatosMetaData.studyCode);
    url.searchParams.append("study_pool", jatosMetaData.batchTitle);
    jatos.endStudyAndRedirect(url.toString(), false, "exception - " + failType + ": " + jatos.urlQueryParameters.participant_id);
  }

  const globalParams = generateCoords(horizontalSections, verticalSections);
  const paramCpy = JSON.parse(JSON.stringify(globalParams));

  const renderFunction = function(ts, canvas, ctx, obj) {
    var coords = obj.aggregateParameters.coords;
    // Commit dot_coords to the current component row
    document.getElementById("main-frame").style = "";
    ctx.restore();
    ctx.beginPath();
    ctx.arc(
      canvas.width * coords.X,  // x center
      canvas.height * coords.Y, // y center
      13 * (canvas.width / canvas.height),                // radius
      0,                   // start angle
      2 * Math.PI          // end angle (in radians)
    );

    ctx.fillStyle = '#010101';
    ctx.fill();
  }

  const renderGreenDot = function(ts, canvas, ctx, obj) {
    var coords = obj.aggregateParameters.coords;
    ctx.restore();
    ctx.beginPath();
    ctx.arc(
      canvas.width * coords.X,  // x center
      canvas.height * coords.Y, // y center
      13 * (canvas.width / canvas.height),                // radius
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
      title: "dot_seq",
      parameters: {
        coords: coords
      },
      content: [
        new lab.canvas.Screen({
          title: "bdot_canvas",
          renderFunction: renderFunction,
          timeout: 10
        }),
        new lab.canvas.Screen({
          title: "gdot_canvas",
          renderFunction: renderGreenDot,
          responses: {
            "keypress(Space)": "next_dot_press"
          }
        })
      ]
    });
    return trialSeq;
  }

  const dotLoop = new lab.flow.Loop({
    title: "dot_loop",
    template: canvasFactory,
    templateParameters: paramCpy,
  })

  const studyInfo = new lab.html.Screen({
    content:'<p>Study ID: ${ parameters.study }<br>Study version: ${ parameters.name }<br>Participant ID: ${ parameters.worker }<br>Pool: ${ parameters.pool }</p><br>',
    parameters: {
      study: jatosMetaData.studyCode,
      name: jatosMetaData.studyTitle,
      worker: jatosMetaData.workerId,
      pool: jatosMetaData.batchTitle
    },
    responses: {
      "keypress(Space)": "to_study"
    },
    datacommit: false
  })

  const redirectScreen = new lab.html.Screen({
    title: 'redirect_screen',
    content: `<div style="margin-top:20px;display:flex;flex-direction:column;align-content:center">
              <div>
                <p>Please press <kbd>Submit</kbd> to to submit the study results.
              Do not close any windows until you see a completion message</p>
              </div>
              <div>
              <button id='submit'><b>Submit</b></button>
              </div>
              </div>
               `,
    responses: {
      "click button#submit": "submit_result"
    }
  })

  const awaitRedirectScreen = new lab.html.Screen({
    title: 'redirect_await',
    content: `<div style="margin-top:20px;display:flex;flex-direction:column;align-content:center">
              <div>
                <p>Please press <kbd>Submit</kbd> to submit the study results.
               Do not close any windows until you see a completion message</p>
               </div>
               <div>
               <p><b>Please wait while the results are being submitted.</b></p>
               </div>
               <div class="content-horizontal-center
               content-vertical-center" style="display:flex;align-content:center;margin-top:30px">
               <div class="spinner">
                 <div></div>
                 <div></div>
                 <div></div>
                 <div></div>
                 <div></div>
                 <div></div>
               </div>
               </div>
              </div>
               `,
    timeout: 3000
  })

  // *************************************************** //
  // *************  WEB RTC FUNCTIONS  ***************** //
  // *************************************************** //

  function stopRecordingCallback() {
    video.srcObject = null;
    // video.src = URL.createObjectURL(blob);
    recorder.camera.stop();
    let blob = recorder.getBlob();
    jatos.uploadResultFile(blob, jatos.urlQueryParameters.participant_id + "_" + "video.webm")
         .catch(() => endFail("video"));
  }

  const renderVid = function() {
    video = document.querySelector('video');
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then(async function(stream) {
      video.srcObject = stream;
      recorder = RecordRTC(stream, {
          type: 'video',
          disableLogs: false,
          frameRate: 30,
          // onTimeStamp: function(timestamp, timestamps) {
          //   study.options.datastore.set({rec_state: recorder.getState(), 
          //     rec_state_stamp: new Date().getTime()});
          // },
        }
      );
      recorder.onStateChanged = function(state) {
        study.options.datastore.set({rec_state_ch: state, 
          rec_state_ch_stamp: study.timer});
      };
      recorder.startRecording();
      study.options.datastore.set({rec_state_ch: 'started', 
        rec_state_ch_stamp: study.timer});
      recorder.camera = stream;
    }).catch((err) => {
      endException("camera permissions");
    });
  };

  const videoPreview = new lab.html.Screen({
    content: [`<div style="display:flex;flex-direction:column;align-content:center">
    <h3>Camera Check</h3>
    <div><video controls="" autoplay="" playsinline=""></video></div>
    <div><p>Camera Instructions will go here</p></div>
    <div><p>press <kbd>v</kbd> to continue</p></div>
    </div>`],
    responses: {
      "keypress(v)": "next_screen"
    }
  });

  const instrucSlides = new lab.flow.Sequence({
    title: "instruc_seq",
    content: [
      new lab.html.Screen({
        title: "i1",
        content: 
        `
        <div class="text-center">
        <h3>Study Information</h3>
        <p style="margin-left:50px;margin-right:50px">The purpose of this study is to collect a large eye movement dataset to improve
        the performance of webcam eye tracking models. As a part of the task you will be asked to look at dots
        on the screen appearing in various locations while your eye movements are recorded using a webcam on your personal
        computer.</p> <br><br>
        <p>press <kbd>7</kbd> to continue</p>
        </div>
        `,
        responses: {
          "keypress(7)": "next_screen"
        }
      }),
      new lab.html.Screen({
        title: "i2",
        content: 
        `
        <div class="text-center">
        <h3>Study Information</h3>
        <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
        <p style="margin-left:50px;margin-right:50px">To successfully complete the experiment please follow the directions described below</p>
        <br>
        <ul style="list-style-type:disc;margin-left:50px;margin-right:50px;text-align:left;">
        <li>Do not resize the browser window during the experiment</li>
        <li>Do not reload the experiment and do not use the back button in the browser</li>
        <li>Pleaese enter into the fullscreen mode and give webcam permissions when prompted</li>
        </ul>
        <p style="margin-left:50px;margin-right:50px">Following directions above will ensure a valid test result. Additionally, make sure
        to complete the study in a quiet distraction-free environment.</p>    
        <br><br>
        <p>press <kbd>a</kbd> to continue</p>
        </div>
        </container>
        `,
        responses: {
          "keypress(a)": "next_screen"
        }
      }),
      new lab.html.Screen({
        title: "i3",
        content: 
        `
        <div class="text-center">
        <h3>The Task</h3>
        <p>Information about the task</p> <br><br>
        <p>press <kbd>0</kbd> to continue</p>
        </div>
        `,
        responses: {
          "keypress(0)": "next_screen"
        }
      }),
      videoPreview
    ]
  });

  const studySeq = new lab.flow.Sequence({
    title: "main_sequence",
    content: [
      // dotLoop,
      redirectScreen,
      awaitRedirectScreen
    ]
  })

  const mainFrame = new lab.html.Frame({
    el: document.getElementById('main-frame'),
    context:
      `<main class="content-vertical-center content-horizontal-center" id="inline-main" data-labjs-section="main">
      <div>
        <div class="spinner">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </main>`,
    contextSelector: 'main',
    content: studySeq

  });

  const instrucFrame = new lab.html.Frame({
    el: document.getElementById('main-frame'),
    context: `
      <header>
        <h1>Study Instructions</h1>
      </header>
      <main style="align-content:center">
        <!-- this is where stimuli will be inserted -->
      </main>
      <footer class="content-horizontal-center content-vertical-center text-muted">
        Robbins Visual Cognition Lab
      </footer>
    `,
    contextSelector: 'main',
    content: instrucSlides, 
  })


  // Define the sequence of components that define the study
  const study = new lab.flow.Sequence({
    plugins: [
      new lab.plugins.Debug(),
      new lab.plugins.Metadata(),
      // new lab.plugins.Fullscreen() // Skip it for now
    ],
    content: [
      studyInfo,
      new lab.canvas.Screen({
        title: "main_seq",
        renderFunction: renderScalingInstructions,
        responses: {
          "keypress(Space)": "next_screen"
        }
      }),
        instrucFrame,
        mainFrame
    ],
    datastore: dataStore
  });

  videoPreview.on('run', () => renderVid());
  videoPreview.on('end', () => recorder.pauseRecording());
  dotLoop.on('run', () => recorder.resumeRecording());
  dotLoop.on('end', () => recorder.stopRecording(stopRecordingCallback));
  study.on('end', () => jatos.submitResultData(study.options.datastore.exportJson())
                             .then(() => endSuccess()
                             .catch(() => endFail("dataset"))));
  // study.on('end', () => study.options.datastore.download());

  // *************************************************** //
  // ****************  STUDY RUNNER  ******************* //
  // *************************************************** //

  // Prepare and run the study
  // study.prepare();
  study.run();
});