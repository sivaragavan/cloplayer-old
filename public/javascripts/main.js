myPlayerArray = {};
stopped = true;
paused = false;

function onLoad() {
	$("#jquery_jplayer_intro").jPlayer({
		ready : function(event) {
			$(this).jPlayer("setMedia", {
				wav : "/assets/images/intro.wav"
			});
			$(this).jPlayer("play");
		},
		swfPath : "http://www.jplayer.org/2.1.0/js",
		solution : 'html, flash',
		supplied : "wav"
	});

	$("#comet-container").html('<iframe id="comet" src="/article/parse?url=' + window.location.hash.substring(1) + '"></iframe>');

	$("#play").click(function() {
		if (!paused) {
			$("#play").text(">");
			pause();
		} else {
			$("#play").text("||");
			play(current);
		}
	});
}

var onEvent = function(event) {
	var eventJson = eval("(" + event + ")");
	console.log(eventJson);

	switch(eventJson.event_name) {
		case "parse_result" :
			$("#title").html(eventJson.title);
			$("#details").html(eventJson.text);

			$("#progressBar").progressbar({
				value : 0,
				max : eventJson.totalLength
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

			if (stopped && !paused) {
				play(eventJson.index);
			}

			myPlayerArray["jquery_jplayer_" + eventJson.index] = eventJson.index;

			$("#jquery_jplayer_" + eventJson.index).bind($.jPlayer.event.ended, function(event) {
				$("#progressBar").progressbar("value", myPlayerArray[$(this).attr('id')] + 1);
				if ($("#jquery_jplayer_" + (myPlayerArray[$(this).attr('id')] + 1)).length > 0 && !paused) {
					play(myPlayerArray[$(this).attr('id')] + 1);
				} else {
					stop();
				}
			});

			break;
	}
}
function play(playerId) {
	current = playerId;
	$("#jquery_jplayer_" + current).jPlayer("play");
	stopped = false;
	paused = false;
}

function stop() {
	stopped = true;
}

function pause() {
	$("#jquery_jplayer_" + current).jPlayer("stop");
	paused = true;
}