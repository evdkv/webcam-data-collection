Webcam Data Collection Task
==========================

Description
--------------------------
The stimuli presentation is built with lab.js and the data collection/study hosting is implemented
with JATOS. There is also an ID exchange pipeline with Qualtrics built in thorugh URL search parameters 
(but the survey URL is hard-coded for now).

The stimuli for the study are the dots generated with coordinates in a predetermined grid. The study also
records a media stream from the webcam and time-stamps it in the local experiment time system for future parsing.

![study-flow](/study-flow.png)

Current Challenges
--------------------------
None for now. File upload errors were resolved.

TO-DOs
--------------------------
Before campus run:
- [ ] New ID assignment in Qualtrics
- [ ] Add the tab closing instructions
- [ ] Add the full screen notice
- [ ] Change the study version
- [ ] Remove debugger console logs and comments

Done:
- [X] Change the study version
- [X] Fix the data upload overlay
- [X] Double check instructions wording
- [X] Reset the droplet (add more initialization flags?)
- [X] Erase Qualtrics responses
- [X] Add demographics and consent to Qualtrics
- [X] Add detailed documentation to the study.js script
- [X] Refactor exception handling to match the new promise logic
- [X] Switch the text size units to rem and test on screens with various scaling ratios
- [X] Set up upload promises
- [X] Change the HTTP POST timeout in the JATOS server configuration
- [X] Change the max allowed upload file size in the JATOS server configuration
- [X] Clean up study.js and separate screens into separate variables
- [X] Fix typos in the instructions
- [X] Adjust the dot radius to be flexible based on the viewport
- [X] Add a small white dot in the middle of each dot
- [X] Adjust timeouts and make dot from each square uppear 2 times
- [X] Make sure to have a start time of the recording to appear in the dataset