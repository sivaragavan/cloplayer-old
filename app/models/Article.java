package models;

import java.io.File;
import java.util.List;
import java.util.UUID;

import javax.persistence.Entity;
import javax.persistence.Id;

import play.Logger;
import play.data.validation.Constraints.Required;
import play.db.ebean.Model;
import plugins.S3Plugin;

import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.PutObjectRequest;

@Entity
public class Article extends Model {

    @Id
    public UUID id;

	@Required
	public String url;
	public String headline;
	public String detail;
	public Integer totalLength;

	public Integer downloadLength;

	public static Finder<Long, Article> find = new Finder(Long.class,
			Article.class);

	public Article(String url, String headline, String detail,
			Integer totalLength) {
		this.url = url;
		this.headline = headline;
		this.detail = detail;
		this.totalLength = totalLength;
	}

	public static void create(Article Article) {
		Article.save();
	}

	public static Integer updateStatus(Long articleId, Integer newLength) {
		Article article = find.ref(articleId);
		article.downloadLength = newLength;
		article.update();
		return newLength;
	}

	public static void delete(Long id) {
		find.ref(id).delete();
	}

	public static List<Article> all() {
		return find.all();
	}

	public String getFileName(int index) {
		return id + "/" + index + ".wav";
	}
	
    public void saveAudio(int index, File file) {
        if (S3Plugin.amazonS3 == null) {
            Logger.error("Could not save because amazonS3 was null");
            throw new RuntimeException("Could not save");
        }
        else {
            PutObjectRequest putObjectRequest = new PutObjectRequest(S3Plugin.s3Bucket, getFileName(index), file);
            putObjectRequest.withCannedAcl(CannedAccessControlList.PublicRead); // public for all
            S3Plugin.amazonS3.putObject(putObjectRequest); // upload file
        }
    }
}
