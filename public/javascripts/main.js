myPlayerArray = {};
stopped = true;

var onEvent = function(event) {
	var eventJson = eval("(" + event + ")");
	console.log(eventJson);

	switch(eventJson.event_name) {
		case "parse_result" :
			$("#title").html(eventJson.title);
			$("#details").html(eventJson.text);

			$("#progressBar").progressbar({
				value : 0,
				max : eventJson.length
			});

			break;

		case "audio_ready" :

			$("#players").append('<div id="jquery_jplayer_' + eventJson.index + '" class="jp-jplayer"></div>');

			$("#jquery_jplayer_" + eventJson.index).jPlayer({
				swfPath : "http://www.jplayer.org/2.1.0/js",
				solution : 'html, flash',
				supplied : "wav"
			});

			$("#jquery_jplayer_" + eventJson.index).jPlayer("setMedia", {
				wav : "https://s3.amazonaws.com/com.cloplayer/" + eventJson.id + "/" + eventJson.index + ".wav"
			});

			if (stopped) {
				$(this).jPlayer("pauseOthers");
				$("#jquery_jplayer_" + eventJson.index).jPlayer("play");
				stopped = false;
			}

			myPlayerArray["jquery_jplayer_" + eventJson.index] = eventJson.index;

			$("#jquery_jplayer_" + eventJson.index).bind($.jPlayer.event.ended, function(event) {
				$("#progressBar").progressbar("value", myPlayerArray[$(this).attr('id')] + 1);

				if ($("#jquery_jplayer_" + (myPlayerArray[$(this).attr('id')] + 1)).length > 0) {
					$("#jquery_jplayer_" + (myPlayerArray[$(this).attr('id')] + 1)).jPlayer("play");
				} else {
					stopped = true;
				}

			});

			break;
	}
}
function loadUrl() {
	$.getJSON("/article/parse", {
		url : window.location.hash.substring(1)
	}, function(json) {
		$("#title").html(json.title);
		result = json.text.replace(/\n/g, "<br><br>");
		$("#details").html(result);

		myStringArray = result.split(".");

		playerLength = myStringArray.length;

		$("#progressBar").progressbar({
			value : 0,
			max : playerLength
		});

		/*
		 $("#progressBar").click(function(e) {
		 var maxWidth = $(this).css("width").slice(0, -2);
		 //remove the 'px' from the css-value
		 var clickPos = e.pageX - this.offsetLeft;
		 //where have you clicked in the progressbar?
		 var percentage = clickPos / maxWidth * 100;
		 //convert it to a percentage
		 $("#progressBar").progressbar("value", Math.floor(playerLength * percentage / 100));
		 //set the new value
		 });*/

		myPlayerArray = {};

		for (var i = 0; i < playerLength; i++) {

			$("#players").append('<div id="jquery_jplayer_' + i + '" class="jp-jplayer"></div>');

			$("#jquery_jplayer_" + i).jPlayer({
				swfPath : "http://www.jplayer.org/2.1.0/js",
				solution : 'html, flash',
				supplied : "wav"
			});

			$("#jquery_jplayer_" + i).jPlayer("setMedia", {
				wav : "http://mary.dfki.de:59125/process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&AUDIO=WAVE_FILE&LOCALE=en_US&INPUT_TEXT=" + myStringArray[i]
			});

			myPlayerArray["jquery_jplayer_" + i] = i;

			$("#jquery_jplayer_" + i).bind($.jPlayer.event.ended, function(event) {

				$("#progressBar").progressbar("value", myPlayerArray[$(this).attr('id')] + 1);

				$("#jquery_jplayer_" + (myPlayerArray[$(this).attr('id')] + 1)).jPlayer("play");
			});

			if (i == 0) {
				$(this).jPlayer("pauseOthers");
				$("#jquery_jplayer_0").jPlayer("play");
			}
		}

	});
}

