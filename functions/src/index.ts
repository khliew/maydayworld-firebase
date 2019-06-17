import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as DbHelper from './db/DbHelper';

admin.initializeApp();

// Api must be loaded after firebase admin is initialized
import Api from './api/Api';

// api for front-end
export const api = functions.https.onRequest(Api);

export const onCreateAlbum = functions.firestore.document('albums/{albumId}')
  .onCreate(DbHelper.onCreateAlbum);

export const onUpdateAlbum = functions.firestore.document('albums/{albumId}')
  .onUpdate(DbHelper.onUpdateAlbum);

export const onUpdateSong = functions.firestore.document('songs/{songId}')
  .onUpdate(DbHelper.onUpdateSong);

export const onCreateSong = functions.firestore.document('songs/{songId}')
  .onCreate(DbHelper.onCreateSong);

export const onDeleteSong = functions.firestore.document('songs/{songId}')
  .onDelete(DbHelper.onDeleteSong);

export const onCreateSongAlbum = functions.firestore.document('songAlbums/{songId}')
  .onCreate(DbHelper.onCreateSongAlbum);

export const onUpdateSongAlbum = functions.firestore.document('songAlbums/{songId}')
  .onUpdate(DbHelper.onUpdateSongAlbum);

export const onDeleteSongAlbum = functions.firestore.document('songAlbums/{songId}')
.onDelete(DbHelper.onDeleteSongAlbum);
