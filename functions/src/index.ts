import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as DbHelper from './db/DbHelper';

admin.initializeApp();

// Api must be loaded after firebase admin is initialized
import Api from './api/Api';

// api for front-end
export const api = functions.https.onRequest(Api);

export const onUpdateAlbum = functions.firestore.document('albums/{albumId}')
  .onUpdate(DbHelper.onUpdateAlbum);
