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