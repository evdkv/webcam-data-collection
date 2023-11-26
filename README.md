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
There are multiple problems with the file uploads. First, the limis per submission and per upload were insufficient 
on the JATOS server, so I changed them and restarted our JATOS container. This is only a part of the issue. Another
challenge is the fact that uploading large videos takes longer and dataset uploads that happen after the video uploads are
most likely clashing during the study runtime. This means that neither are properly uploaded. This is not a problem for shorter
video files since they can get uploaded by the time participant reaches the dataset upload event.

One way to deal with this is to upload everything at the end of the study and set up promises to ensure that data are uploaded
sequentially. Currently, I am trying to figure out how to set them up in a way that would work.

TO-DOs
--------------------------
- [ ] Set up upload promises
- [ ] Add detailed documentation to the study.js script
- [ ] Switch the text size units to rem and test on screens with various scaling ratios
- [ ] Log the square coordinates in the dataset (or maybe add them back in at post processing?)
- [X] Change the HTTP POST timeout in the JATOS server configuration
- [X] Change the max allowed upload file size in the JATOS server configuration
- [X] Clean up study.js and separate screens into separate variables
- [X] Fix typos in the instructions
- [X] Adjust the dot radius to be flexible based on the viewport
- [X] Add a small white dot in the middle of each dot
- [X] Adjust timeouts and make dot from each square uppear 2 times
- [X] Make sure to have a start time of the recording to appear in the dataset