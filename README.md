Webcam Data Collection Task
==========================

Description
--------------------------
The stimuli presentation is built with lab.js and the data collection/study hosting is implemented
with JATOS. There is also an ID exchange pipeline with Qualtrics built in thorugh URL search parameters 
(but the survey URL is hard-coded for now).

The stimuli for the study are the dots generated with coordinates in a predetermined grid. The study also
records a media stream from the webcam and time-stamps it in the local experiment time system for future parsing.

Current Challenges
--------------------------
None for now. File upload errors were resolved.

TO-DOs
--------------------------
- [ ] Refactor exception handling to match the new promise logic
- [ ] Remove debugger console logs and comments
- [ ] Add detailed documentation to the study.js script
- [ ] Switch the text size units to rem and test on screens with various scaling ratios
- [X] Set up upload promises
- [X] Change the HTTP POST timeout in the JATOS server configuration
- [X] Change the max allowed upload file size in the JATOS server configuration
- [X] Clean up study.js and separate screens into separate variables
- [X] Fix typos in the instructions
- [X] Adjust the dot radius to be flexible based on the viewport
- [X] Add a small white dot in the middle of each dot
- [X] Adjust timeouts and make dot from each square uppear 2 times
- [X] Make sure to have a start time of the recording to appear in the dataset