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
    ctx.font = "17px Verdana";
    ctx.textAlign = "center"; 
    ctx.fillText("- Now, we will scale the experiment to your browser window.", 
      canvas.width / 2, 
      canvas.height / 3.7); 
    ctx.fillText("- You should see the orange and the red line creating two bounding boxes.",
      canvas.width / 2,
      canvas.height / 3.2)
    ctx.fillText("- ORANGE box should sit right on top of RED box with NO gaps in between.",
      canvas.width / 2,
      canvas.height / 2.8)
    ctx.fillText("- You will now proceed to the actual study. Don't forget: you need to stare at the dot until it becomes green, then press SPACE to see the next dot.",
      canvas.width / 2,
      canvas.height / 2.5)
    ctx.fillText("- Press SPACE to START THE STUDY.",
      canvas.width / 2,
      canvas.height / 2.2)
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
    content:`
    <div style="margin-top:20px;display:flex;flex-direction:column;align-content:center">
    <img src="rlab.png" height="50" width="70" style="display:inline-block;align-self:center;">
    <h3>Webcam Eye Tracking Study</h3>
    <p>press <kbd>SPACE</kbd> to continue</p>
    </div>
    `,
    responses: {
      "keypress(Space)": "to_study"
    },
    datacommit: false
  })

  const redirectScreen = new lab.html.Screen({
    title: 'redirect_screen',
    content: `<div style="margin-top:20px;display:flex;flex-direction:column;align-content:center">
              <div>
                <p>Please press <kbd>Submit</kbd> to submit the study results.
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
    <div><video style="height:30vh;" controls="" autoplay="" playsinline=""></video></div>
    <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
    <div><p>Make sure to check for the following:</p></div>
    <ul style="list-style-type:disc;margin-left:50px;margin-right:50px;text-align:left;">
    <li>Your face and eyes are fully visible to the webcam.</li>
    <li>There are no other faces in the background.</li>
    <li>If you are wearing glasses, make sure there is no glare that obstructs the eyes.</li>
    </ul>
    </container>
    <p>press <kbd>v</kbd> to continue</p>
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
        <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
        <p style="margin-left:50px;margin-right:50px">The purpose of this study is to collect a large eye movement dataset to improve
        the performance of webcam eye tracking models. As a part of the task you will be asked to look at dots
        on the screen appearing in various locations while your eye movements are recorded using a webcam on your personal
        computer.</p> <br><br>
        <p>press <kbd>7</kbd> to continue</p>
        </div>
        </container>
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
        <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
        <p>With each trial, please look at the BLACK dot that appears on the screen. Please stare at the dot until its color turns GREEN. After the dot
        became GREEN, press <kbd>SPACE</kbd> to see the dot in the next location.</p>
        <br>
        <ul style="list-style-type:disc;margin-left:50px;margin-right:50px;text-align:left;">
        <li>Follow the dot with your eyes, please do NOT turn your head to follow the dot.</li>
        <li>Make sure there are no other faces in your background (photos or actual people).</li>
        <li>If you are wearing glasses, make sure your eyes are clearly visible through the glasses.</li>
        </ul>
        <p>press <kbd>0</kbd> to continue</p>
        </div>
        </container>
        `,
        responses: {
          "keypress(0)": "next_screen"
        }
      }),
      videoPreview,
      new lab.html.Screen({
        title: "i4",
        content: 
        `
        <div class="text-center">
        <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
        <p>Now, please press <kbd>ENTER</kbd> to enter into the fullscreen mode. At this point, please do not
        exit the fullscreen mode until prompted to do so at the end of the study.</p>
        <br>
        <p>press <kbd>m</kbd> to continue</p>
        </div>
        </container>
        `,
        responses: {
          "keypress(m)": "next_screen"
        }
      }),
    ]
  });

  const studySeq = new lab.flow.Sequence({
    title: "main_sequence",
    content: [
      new lab.canvas.Screen({
        title: "main_seq",
        renderFunction: renderScalingInstructions,
        responses: {
          "keypress(Space)": "next_screen"
        }
      }),
      dotLoop,
      new lab.html.Screen({
        title: "exit_fs_slide",
        content: 
        `
        <div class="text-center">
        <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
        <p>Now press <kbd>ENTER</kbd> to exit the fullscreen mode</p>
        <br>
        <p>press <kbd>SPACE</kbd> to continue</p>
        </div>
        </container>
        `,
        responses: {
          "keypress(Space)": "next_screen"
        }
      }),
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