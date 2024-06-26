jatos.onLoad(function() {
  const STUDYVERSION = "v3.3-2s-campus";
  const BDOT_DURATION = 2000;
  const GDOT_DURATION = 2000;

  var video = null;
  var recorder = null;

  var jatosMetaData = {};
  jatos.addJatosIds(jatosMetaData);

  jatos.waitSendDataOverlayConfig = {text: "", showImg: false};

  // This will be empty for the rest of the study.
  // Use study.options.datastore to access/set data in the data store
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

  // Add fullscreen toggle
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function fullscreenchanged(event) {
    if (document.fullscreenElement) {
      study.options.datastore.set({ messages: "Participant ENTERED fs" });
      jatos.removeOverlay();
    } else {
      study.options.datastore.set({ messages: "Participant EXITED fs" });
      jatos.showOverlay({
        text: "Please press ENTER to return to fullscreen mode. Exiting fullscreen mode might invalidate study results",
        style: "background:red;color:white;text-align:center;",
        showImg: false,
      });
    }
  }

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter") {
        toggleFullScreen();
      }
    },
    false
  );

  document.addEventListener("fullscreenchange", fullscreenchanged);

  function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
  }

  const generateCoords = function (horizontalSections, verticalSections) {
    let coordParams = [];

    for (let i = 0; i < verticalSections.length; i++) {
      for (let j = 0; j < horizontalSections.length; j++) {
        coordParams.push({
          X: getRandomInt(horizontalSections[j][0], horizontalSections[j][1]),
          Y: getRandomInt(verticalSections[i][0], verticalSections[i][1]),
        });
      }
    }
    for (let i = 0; i < verticalSections.length; i++) {
      for (let j = 0; j < horizontalSections.length; j++) {
        coordParams.push({
          X: getRandomInt(horizontalSections[j][0], horizontalSections[j][1]),
          Y: getRandomInt(verticalSections[i][0], verticalSections[i][1]),
        });
      }
    }
    return random.shuffle(coordParams);
  };

  function endSuccess() {
    var url = new URL(
      "https://richmond.ca1.qualtrics.com/jfe/form/SV_3CqnAJ1nOwFXWjs"
    );

    if (jatosMetaData.batchTitle === "offcampus") {
      url = new URL(
        "https://richmond.ca1.qualtrics.com/jfe/form/SV_6JR6xmahA4eBZDU"
      );
    }
    url.searchParams.append(
      "participant_id",
      jatos.urlQueryParameters.participant_id
    );
    url.searchParams.append("return_status", "data_retrieved");
    url.searchParams.append("study_id", jatosMetaData.studyCode);
    url.searchParams.append("study_pool", jatosMetaData.batchTitle);
    jatos.endStudyAndRedirect(
      url.toString(),
      true,
      "success: " + jatos.urlQueryParameters.participant_id
    );
  }

  function endFail(failType) {
    var url = new URL(
      "https://richmond.ca1.qualtrics.com/jfe/form/SV_3CqnAJ1nOwFXWjs"
    );

    if (jatosMetaData.batchTitle === "offcampus") {
      url = new URL(
        "https://richmond.ca1.qualtrics.com/jfe/form/SV_6JR6xmahA4eBZDU"
      );
    }

    url.searchParams.append(
      "participant_id",
      jatos.urlQueryParameters.participant_id
    );
    url.searchParams.append("return_status", "data_error");
    url.searchParams.append("study_id", jatosMetaData.studyCode);
    url.searchParams.append("study_pool", jatosMetaData.batchTitle);
    jatos.endStudyAndRedirect(
      url.toString(),
      false,
      "data upload error - " +
        failType +
        ": " +
        jatos.urlQueryParameters.participant_id
    );
  }

  function endException(failType) {
    var url = new URL(
      "https://richmond.ca1.qualtrics.com/jfe/form/SV_3CqnAJ1nOwFXWjs"
    );

    if (jatosMetaData.batchTitle === "offcampus") {
      url = new URL(
        "https://richmond.ca1.qualtrics.com/jfe/form/SV_6JR6xmahA4eBZDU"
      );
    }

    url.searchParams.append(
      "participant_id",
      jatos.urlQueryParameters.participant_id
    );
    url.searchParams.append("return_status", "exception_error");
    url.searchParams.append("study_id", jatosMetaData.studyCode);
    url.searchParams.append("study_pool", jatosMetaData.batchTitle);
    jatos.endStudyAndRedirect(
      url.toString(),
      false,
      "exception - " + failType + ": " + jatos.urlQueryParameters.participant_id
    );
  }

  const globalParams = generateCoords(horizontalSections, verticalSections);
  const paramCpy = JSON.parse(JSON.stringify(globalParams));

  // *************************************************** //
  // *************** CANVAS RENDERING ****************** //
  // *************************************************** //

  const renderFunction = function (ts, canvas, ctx, obj) {
    var coords = obj.aggregateParameters.coords;
    // Commit dot_coords to the current component row
    document.getElementById("main-frame").style = "";
    ctx.restore();
    ctx.beginPath();
    ctx.arc(
      canvas.width * coords.X, // x center
      canvas.height * coords.Y, // y center
      13 * (window.devicePixelRatio || 1),
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "#010101";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      canvas.width * coords.X, // x center
      canvas.height * coords.Y, // y center
      3.5 * (window.devicePixelRatio || 1),
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  };

  const renderGreenDot = function (ts, canvas, ctx, obj) {
    var coords = obj.aggregateParameters.coords;
    ctx.restore();
    ctx.beginPath();
    ctx.arc(
      canvas.width * coords.X, // x center
      canvas.height * coords.Y, // y center
      13 * (window.devicePixelRatio || 1), // radius
      0, // start angle
      2 * Math.PI // end angle (in radians)
    );
    ctx.fillStyle = "#09A552";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      canvas.width * coords.X, // x center
      canvas.height * coords.Y, // y center
      3.5 * (window.devicePixelRatio || 1),
      0, // start angle
      2 * Math.PI // end angle (in radians)
    );
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  };

  const renderScalingInstructions = function (ts, canvas, ctx, obj) {
    var element = document.getElementById("main-frame");
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    canvas.width = width;
    canvas.height = height;
    ctx.save();

    document.getElementById("main-frame").style = "border: 5pt solid red";
    canvas.style = "border: 5pt solid orange";
    ctx.font = `${1.1 * window.innerWidth / 100}px Verdana`;
    ctx.textAlign = "center";
    ctx.fillText(
      "- Now, we will scale the experiment to your browser window.",
      canvas.width / 2,
      canvas.height / 3.7
    );
    ctx.fillText(
      "- You should see the orange and the red line creating two bounding boxes.",
      canvas.width / 2,
      canvas.height / 3.2
    );
    ctx.fillText(
      "- ORANGE box should sit right on top of RED box with NO gaps in between.",
      canvas.width / 2,
      canvas.height / 2.8
    );
    ctx.fillText(
      "- You will now proceed to the actual study. Don't forget: you need to stare at the dot until it becomes green, then press SPACE to see the next dot.",
      canvas.width / 2,
      canvas.height / 2.5
    );
    ctx.fillText(
      "- Press SPACE to START THE STUDY.",
      canvas.width / 2,
      canvas.height / 2.2
    );
  };

  // *************************************************** //
  // *************  RECORD RTC FUNCTIONS  ************** //
  // *************************************************** //

  async function stopRecordingAndGetBlob() {
    await new Promise((resolve, reject) => {
      recorder.stopRecording(resolve);
    });
    video.srcObject = null;
    recorder.camera.stop();
    const blob = recorder.getBlob();
    return blob;
  }

  function createBlobChunks(blob, chunkSize) {
    var chunks = [];
    var offset = 0;

    while (offset < blob.size) {
        var chunk = blob.slice(offset, offset + chunkSize);
        chunks.push(chunk);
        offset += chunkSize;
    }

    return chunks;
  }

  const renderVid = function () {
    video = document.querySelector("video");
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      .then(async function (stream) {
        video.srcObject = stream;
        recorder = RecordRTC(stream, {
          type: "video",
          disableLogs: false,
          frameRate: 30,
        });
        recorder.onStateChanged = function (state) {
          study.options.datastore.set({
            rec_state_ch: state,
            rec_state_ch_stamp: study.timer,
          });
        };
        recorder.startRecording();
        recorder.camera = stream;
      })
      .catch((err) => {
        endException("camera permissions");
      });
  };

  // *************************************************** //
  // *************  SCREEN DECLARATIONS  *************** //
  // *************************************************** //

  // Add instruction screens
  const videoPreview = new lab.html.Screen({
    title: "i4",
    content: `<div style="display:flex;flex-direction:column;align-content:center">
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
      </div>`,
    responses: {
      "keypress(v)": "next_screen",
    },
  });

  const fsScreen = new lab.html.Screen({
    title: "i5",
    content: `<div class="text-center">
      <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
      <p>Now, please press <kbd>ENTER</kbd> to enter into the fullscreen mode. At this point, please do not
      exit the fullscreen mode until prompted to do so at the end of the study.</p>
      <p>If after pressing <kbd>ENTER</kbd> nothing happens, please continue while making sure that the browser
      window is maximized on your screen.</p>
      <br>
      <p>press <kbd>m</kbd> to continue</p>
      </div>
      </container>
      `,
    responses: {
      "keypress(m)": "next_screen",
    },
  });

  const instrucSlides = new lab.flow.Sequence({
    title: "instruc_seq",
    content: [
      new lab.html.Screen({
        title: "i1",
        content: `
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
          "keypress(7)": "next_screen",
        },
      }),
      new lab.html.Screen({
        title: "i2",
        content: ` <div class="text-center">
          <h3>Study Information</h3>
          <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
          <p style="margin-left:50px;margin-right:50px">To successfully complete the experiment please follow the directions described below</p>
          <br>
          <ul style="list-style-type:disc;margin-left:50px;margin-right:50px;text-align:left;">
          <li>Make sure you are completing the study on a laptop/desktop with a camera located above the screen</li>
          <li>Ensure that your browser has an access to the webcam</li>
          <li>Close all other tabs in your browser and silence notifications</li>
          <li>Do not resize the browser window during the experiment</li>
          <li>Do not reload the experiment and do not use the back button in the browser</li>
          <li>When prompted, please enter into the fullscreen mode and give webcam permissions</li>
          </ul>
          <p style="margin-left:50px;margin-right:50px">Following directions above will ensure a valid test result. Additionally, make sure
          to complete the study in a quiet distraction-free environment.</p>    
          <br><br>
          <p>press <kbd>a</kbd> to continue</p>
          </div>
          </container>`,
        responses: {
          "keypress(a)": "next_screen",
        },
      }),
      new lab.html.Screen({
        title: "i3",
        content: `<div class="text-center">
          <h3>The Task</h3>
          <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
          <p>With each trial, please look at the <strong>BLACK</strong> dot that appears on the screen. Please stare at the dot until its color 
          turns <strong style="color: green;">GREEN</strong>. After the dot
          became <strong style="color: green;">GREEN</strong>, press <kbd>SPACE</kbd> to see the dot in the next location.</p>
          <br>
          <ul style="list-style-type:disc;margin-left:50px;margin-right:50px;text-align:left;">
          <li>Follow the dot with your eyes, try to not turn your head to follow the dot.</li>
          <li>Make sure there are no other faces in your background (photos or actual people).</li>
          <li>If you are wearing glasses, make sure your eyes are clearly visible through the glasses without glare.</li>
          </ul>
          <p>press <kbd>0</kbd> to continue</p>
          </div>
          </container>
          `,
        responses: {
          "keypress(0)": "next_screen",
        },
      }),
      videoPreview,
      fsScreen,
    ],
  });

  const canvasFactory = function (params, ix) {
    var coords = globalParams.pop();

    var trialSeq = new lab.flow.Sequence({
      title: "dot_seq",
      parameters: {
        coords: coords,
      },
      content: [
        new lab.canvas.Screen({
          title: "bdot_canvas",
          renderFunction: renderFunction,
          timeout: BDOT_DURATION,
        }),
        new lab.canvas.Screen({
          title: "gdot_canvas",
          renderFunction: renderGreenDot,
          timeout: GDOT_DURATION,
          responses: {
            "keypress(Space)": "next_dot_press",
          },
        }),
      ],
    });
    return trialSeq;
  };

  const dotLoop = new lab.flow.Loop({
    title: "dot_loop",
    template: canvasFactory,
    templateParameters: paramCpy,
  });

  const studyWelcome = new lab.html.Screen({
    content:
      '<div style="margin-top:20px;display:flex;flex-direction:column;align-content:center">' +
      '<img src="rlab.png" height="50" width="70" style="display:inline-block;align-self:center;">' +
      "<h3>Webcam Eye Tracking Study</h3>" +
      "<p>press <kbd>SPACE</kbd> to continue</p>" +
      '<p class="text-muted">${ parameters.studyVersion }</p>' +
      "</div>",
    responses: {
      "keypress(Space)": "to_study",
    },
    parameters: {
      studyVersion: STUDYVERSION,
    },
  });

  const redirectScreen = new lab.html.Screen({
    title: "redirect_screen",
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
      "click button#submit": "submit_result",
    },
  });

  const awaitRedirectScreen = new lab.html.Screen({
    title: "redirect_await",
    content: 
      `<div style="margin-top:20px;display:flex;flex-direction:column;align-content:center">
      <div>
        <p>Please press <kbd>Submit</kbd> to submit the study results.
        Do not close any windows until you see a completion message</p>
        </div>
        <div>
        <p><b>Please wait while the results are being submitted. This can take up to 5 minutes.</b></p>
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
  });

  const trialSeqEnd = new lab.html.Screen({
    title: "trial_seq_end",
    content: `
      <div class="text-center">
      <container style="width:60vw;display:inline-flex;align-self:center;flex-direction:column;">
      <p>This is the end of the trial sequence.</p>
      <br>
      <p>press <kbd>q</kbd> to continue</p>
      </div>
      </container>
      `,
    responses: {
      "keypress(q)": "next_screen",
    },
  });

  const scalingInstructions = new lab.canvas.Screen({
    title: "main_seq",
    renderFunction: renderScalingInstructions,
    responses: {
      "keypress(Space)": "next_screen",
    },
    datacommit: false,
  });

  const studySeq = new lab.flow.Sequence({
    title: "main_sequence",
    content: [
      scalingInstructions,
      dotLoop,
      trialSeqEnd,
      redirectScreen,
      awaitRedirectScreen,
    ],
  });

  const mainFrame = new lab.html.Frame({
    el: document.getElementById("main-frame"),
    context: `<main class="content-vertical-center content-horizontal-center" id="inline-main" data-labjs-section="main">
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
    contextSelector: "main",
    content: studySeq,
  });

  const instrucFrame = new lab.html.Frame({
    el: document.getElementById("main-frame"),
    context: `
      <header>
        <h1>Study Instructions</h1>
      </header>
      <main style="align-content:center">
        <!-- this is where stimuli will be inserted -->
      </main>
      <footer class="content-horizontal-center content-vertical-center text-muted">
        <p>Robbins Visual Cognition Lab</p>
      </footer>
    `,
    contextSelector: "main",
    content: instrucSlides,
  });

  const study = new lab.flow.Sequence({
    plugins: [new lab.plugins.Metadata()], // new lab.plugins.Debug()
    content: [studyWelcome, instrucFrame, mainFrame],
    datastore: dataStore,
  });

  // *************************************************** //
  // *************  EVENTS & DATA LOGGING  ************* //
  // *************************************************** //

  videoPreview.on("run", () => renderVid());
  fsScreen.on("run", () => recorder.pauseRecording());
  dotLoop.on("run", () => recorder.resumeRecording());
  dotLoop.on("end", () => recorder.pauseRecording());
  redirectScreen.on("end", () =>
  new Promise((resolve, reject) => {
    const blob = stopRecordingAndGetBlob();
    resolve(blob);
  })
  .then((blob) => {
    var chunkSize = 1024 * 1024 * 10; // 11 MB chunk size
    return createBlobChunks(blob, chunkSize); // Return 'chunks' to the next .then()
  })
    .then((chunks) => {
      for (let i = 0; i < chunks.length; i++) {
        jatos.uploadResultFile(
          chunks[i],
          jatos.urlQueryParameters.participant_id + "_video_" + i + ".webm"
        );
      }
    })
    .then(() => {
      jatos.submitResultData(study.options.datastore.exportJson());
    })
    .then(() => {
      jatos.uploadResultFile(
        study.options.datastore.exportCsv(),
        jatos.urlQueryParameters.participant_id + "_dataset.csv"
      );
    })
    .then(() => {
      endSuccess();
    })
    .catch(() => {
      endFail("dataset");
    })
);

  // *************************************************** //
  // ****************  STUDY RUNNER  ******************* //
  // *************************************************** //

  study.run();

});
