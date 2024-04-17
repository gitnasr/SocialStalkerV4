import * as A from './asset';
import * as AI from './ai';
import * as FB from './facebook';
import * as IG from './instagram';
import * as L from './logs';
import * as O from './owner';
import * as T from './tracker';

enum Status {
	'SUCCESS' = 'SUCCESS',
	'FAILURE' = 'FAILURE',
	'PENDING' = 'PENDING',
	'IN_PROGRESS' = 'IN_PROGRESS',
	'CANCELED' = 'CANCELED',
	'TIMEOUT' = 'TIMEOUT',
	'RETRY' = 'RETRY'
}
enum FileType {
	'image' = 'image',
	'video' = 'video',
	'archive' = 'archive'
}
enum FileExtension {
	'png' = 'png',
	'mp4' = 'mp4',
	'zip' = 'zip'
}
enum DownloadTypes {
	'VIDEO' = 'VIDEO',
	'IMAGE' = 'IMAGE',
	'ARCHIVE' = 'ARCHIVE',
	'VIDEO_AS_IMAGE' = 'VIDEO_AS_IMAGE'
}
enum Events {
	'INSTAGRAM_STORY_DOWNLOAD' = 'INSTAGRAM_STORY_DOWNLOAD',
	'INSTAGRAM_HIGHLIGHT_DOWNLOAD' = 'INSTAGRAM_HIGHLIGHT_DOWNLOAD',
	INSTAGRAM_PROFILE_PICTURE_VIEW = 'INSTAGRAM_PROFILE_PICTURE_VIEW',
	INSTAGRAM_POSTS_ARCHIVE = 'INSTAGRAM_POSTS_ARCHIVE',
	INSTAGRAM_POST_DOWNLOAD = 'INSTAGRAM_POST_DOWNLOAD',
	FACEBOOK_STORY_DOWNLOAD = 'FACEBOOK_STORY_DOWNLOAD',
	FACEBOOK_HIGHLIGHTS_DOWNLOAD = 'FACEBOOK_HIGHLIGHTS_DOWNLOAD',
	FACEBOOK_PROFILE_PHOTOS = 'FACEBOOK_PROFILE_PHOTOS',
	FACEBOOK_PROFILE_PICTURE = "FACEBOOK_PROFILE_PICTURE"
}
enum RedisKeys {
	'IG:Cookies' = 'IG:Cookies',
}
export {A, AI, DownloadTypes, Events, FB, FileExtension, FileType, IG, O, Status, T, L,RedisKeys};
