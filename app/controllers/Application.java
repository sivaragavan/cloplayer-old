package controllers;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.URLEncoder;

import models.Article;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONObject;

import play.Logger;
import play.libs.Comet;
import play.mvc.Controller;
import play.mvc.Result;

import com.amazonaws.http.JsonResponseHandler;
import com.google.common.io.ByteStreams;
import com.google.common.io.Closeables;

public class Application extends Controller {

	public static Result index() {
		return ok(views.html.player.render());
	}

	public static Result parse(final String url) {

		return ok(new Comet("parent.onEvent") {
			public void onConnected() {

				HttpClient httpclient = new DefaultHttpClient();
				try {

					Logger.info("Parsing with Diffbot (url): " + url);
					HttpGet httpget = new HttpGet(
							"http://www.diffbot.com/api/article?token=d7d6e5f9c8b26964b45795a74465d809&url="
									+ url);

					ResponseHandler<String> responseHandler = new BasicResponseHandler();
					String responseBody = httpclient.execute(httpget,
							responseHandler);

					Logger.info("Response from Diffbot : " + responseBody);

					responseBody = responseBody.replaceAll("\n", "<br><br>");
					JSONObject jsonRes = new JSONObject(responseBody);
					jsonRes.put("event_name", "parse_result");
					
					String text = jsonRes.getString("text");

					Article a = new Article("http://asdasd.com", "Headline",
							"Detail", 10);
					a.save();

					String[] sentences = text.split("\\.");

					jsonRes.put("id", a.id.toString());
					jsonRes.put("length", sentences.length);
					sendMessage(jsonRes.toString());
					
					for (int i = 0; i < sentences.length; i++) {

						String sentence = sentences[i];

						File file = File
								.createTempFile(a.id.toString(), ".wav");

						Logger.info("Converting with Mary : " + sentence);

						HttpClient client = new DefaultHttpClient();
						HttpGet get = new HttpGet(
								"http://mary.dfki.de:59125/process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&AUDIO=WAVE_FILE&LOCALE=en_US&INPUT_TEXT="
										+ URLEncoder.encode(sentence));
						HttpResponse response = client.execute(get);

						InputStream data = response.getEntity().getContent();
						OutputStream output = new FileOutputStream(file);
						try {
							ByteStreams.copy(data, output);
						} finally {
							Closeables.closeQuietly(output);
						}

						Logger.info("Adding to s3 : " + i + ".wav");

						a.saveAudio(i, file);

						JSONObject tempJSON = new JSONObject();
						tempJSON.put("event_name", "audio_ready");
						tempJSON.put("index", i);
						tempJSON.put("id", a.id.toString());
						sendMessage(tempJSON.toString());

						file.delete();

						Logger.info("Added to s3 : " + i + ".wav");
					}

				} catch (Exception e) {
					Logger.error("Error while parsing", e);
				} finally {
					httpclient.getConnectionManager().shutdown();
					close();
					Logger.info("completed parsing"); 
				}
			}
		});

	}

}