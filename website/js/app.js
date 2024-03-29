//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

var predictRecord = document.getElementById("predictRecord");
var predictStop = document.getElementById("predictStop");
var predictPause = document.getElementById("predictPause");


//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

predictRecord.addEventListener("click", startPredictRecording);
predictStop.addEventListener("click", stopPredictRecording);
predictPause.addEventListener("click", pausePredictRecording);


function startRecording() {
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		//update the format 
		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true
	});
}

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="Pause";

	}
}

function stopRecording() {
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause";
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);

}
function startPredictRecording() {
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	predictRecord.disabled = true;
	predictStop.disabled = false;
	predictPause.disabled = false

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		//update the format 
		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
		predictRecord.disabled = false;
		predictStop.disabled = true;
    	predictPause.disabled = true
	});
}

function pausePredictRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		predictPause.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		predictPause.innerHTML="Pause";

	}
}

function stopPredictRecording() {
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	predictStop.disabled = true;
	predictRecord.disabled = false;
	predictPause.disabled = true;

	//reset button just in case the recording is stopped while paused
	predictPause.innerHTML="Pause";
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createPredictDownloadLink);

}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
function hideShowImage(){
	if ($('#stroke_type').is(':checked')) {
		document.getElementById("letter").style.visibility = "hidden";
	}
	else{
		document.getElementById("letter").style.visibility = "visible";
	}
}
function switchImage() {
	var selectedImage = $('#letters').val();
	document.letter.src = 'img/' +selectedImage + ".png";
}



function createDownloadLink(blob) {
	console.log(blob)
	var data = new FormData();
	for (var channel = 0; channel < blob.length; channel++) {
		
		console.log('123')
		var url = URL.createObjectURL(blob[channel]);
		
		var au = document.createElement('audio');
		var li = document.createElement('li');
		var link = document.createElement('a');
		var d = new Date(),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) 
			month = '0' + month;
		if (day.length < 2) 
			day = '0' + day;

		today = [year, month, day].join('-');
		//name of .wav file to use during upload and download (without extension)

		var filename = today + '-' + $('#letters').val() + '-' + $('#phone').val()

		//add controls to the <audio> element
		au.controls = true;
		au.src = url;

		//save to disk link
		link.href = url;
		link.download = filename + ".wav"; //download forces the browser to download the file using the  filename
		link.innerHTML = "Save to disk";

		//add the new audio element to li
		li.appendChild(au);
		
		//add the filename to the li
		li.appendChild(document.createTextNode(filename+".wav "))

		//add the save to disk link to li
		li.appendChild(link);
		
		//upload link
		var upload = document.createElement('a');
		upload.href="#";
		upload.innerHTML = "Upload";
		
		li.appendChild(document.createTextNode (" "))//add a space in between
		li.appendChild(upload)//add the upload link to li

		
		
		data.append("audio_data",blob[channel], filename);
		upload.addEventListener("click", function(event){
			var xhr=new XMLHttpRequest();
			xhr.onload=function(e) {
				if(this.readyState === 4) {
					console.log("Server returned: ",e.target.responseText);
				}
			};
		
			$.ajax({
				url: 'https://3xh44nvori.execute-api.eu-central-1.amazonaws.com/prod/upload',
				data: data,
				processData: false,
				contentType: false,
				enctype: "multipart/form-data",
				type: 'POST',
				success: function ( data ) {
					li.appendChild(document.createTextNode("\nSuccessfully uploaded"))
				},
				error:function ( data ) {
					li.appendChild(document.createTextNode("\nFailed to upload"))
				}
			});
		})
		//add the li element to the ol
		recordingsList.appendChild(li);
	}
	
}


function createPredictDownloadLink(blob) {
	console.log(blob)
	var data = new FormData();
	for (var channel = 0; channel < blob.length; channel++) {
		
		console.log('123')
		var url = URL.createObjectURL(blob[channel]);
		
		var au = document.createElement('audio');
		var li = document.createElement('li');
		var link = document.createElement('a');
		var d = new Date(),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) 
			month = '0' + month;
		if (day.length < 2) 
			day = '0' + day;

		today = [year, month, day].join('-');
		//name of .wav file to use during upload and download (without extension)

		var filename = today + '-' + $('#letters').val() + '-' + $('#phone').val()

		//add controls to the <audio> element
		au.controls = true;
		au.src = url;

		//add the new audio element to li
		li.appendChild(au);
		
		//add the filename to the li
		li.appendChild(document.createTextNode(filename+".wav "))


		
		//upload link
		var upload = document.createElement('a');
		upload.href="#";
		upload.innerHTML = "Predict";
		
		li.appendChild(document.createTextNode (" "))//add a space in between
		li.appendChild(upload)//add the upload link to li

		
		
		data.append("audio_data",blob[channel], filename);
		upload.addEventListener("click", function(event){
			var xhr=new XMLHttpRequest();
			xhr.onload=function(e) {
				if(this.readyState === 4) {
					console.log("Server returned: ",e.target.responseText);
				}
			};
		
			$.ajax({
				url: 'https://3xh44nvori.execute-api.eu-central-1.amazonaws.com/prod/prediction',
				data: data,
				processData: false,
				contentType: false,
				enctype: "multipart/form-data",
				type: 'POST',
				success: function ( data ) {
					console.log(data)
					var br = document.createElement("br");
					li.appendChild(br);
					li.appendChild(document.createTextNode(String(data["body"]["prediction"])))
				},
				error:function ( data ) {
					li.appendChild(document.createTextNode("\nFailed to upload"))
				}
			});
		})
		//add the li element to the ol
		predictRecordingsList.appendChild(li);
	}
	
}