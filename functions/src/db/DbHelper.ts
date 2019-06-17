import * as admin from 'firebase-admin';
import { Change, EventContext } from 'firebase-functions';
import Album from '../models/Album';
import Discography from '../models/Discography';
import Title from '../models/Title';
import Song from '../models/Song';
import SongAlbum from '../models/SongAlbum';

type DocumentSnapshot = admin.firestore.DocumentSnapshot;
type WriteBatch = admin.firestore.WriteBatch;

/**
 * This method is invoked when an album is updated.
 */
export const onUpdateAlbum = (change: Change<DocumentSnapshot>, context: EventContext) => {
  const after = change.after.data() as Album;
  const before = change.before.data() as Album;

  if (before.type === after.type
    && before.releaseDate === after.releaseDate
    && areTitlesEqual(before.title, after.title)) {
    return; // no changes to make to discography
  }

  // update discography with changed data
  const discoRef = admin.firestore().doc('discos/mayday');
  discoRef.get()
    .then(doc => {
      if (!doc.exists) {
        return;
      }

      const disco = doc.data() as Discography;

      let found = false;
      for (const section of disco.sections) {
        for (const album of section.albums) {
          if (album.id === after.id) {
            album.type = after.type;
            album.releaseDate = after.releaseDate;
            album.title = after.title;

            found = true;
            break;
          }
        }

        if (found) {
          break;
        }
      }

      discoRef.set(disco)
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
};

/**
 * This method is invoked when a song is created.
 */
export const onCreateSong = (snapshot: DocumentSnapshot, context: EventContext) => {
  const song = snapshot.data() as Song;

  updateAlbumSongLists(snapshot.id, song);
};

/**
 * This method is invoked when a song is updated.
 */
export const onUpdateSong = (change: Change<DocumentSnapshot>, context: EventContext) => {
  const after = change.after.data() as Song;
  const before = change.before.data() as Song;

  if (areTitlesEqual(before.title, after.title)) {
    return; // no changes to make to album
  }

  updateAlbumSongLists(change.after.id, after);
};

/**
 * This method is invoked when a song is deleted.
 */
export const onDeleteSong = (snapshot: DocumentSnapshot, context: EventContext) => {
  const songId = snapshot.id;

  // remove song from songAlbums collection
  admin.firestore().doc(`songAlbums/${songId}`).delete()
    .catch(error => console.error(error));
};

/**
 * Updates the song list of albums associated with a song.
 */
function updateAlbumSongLists(songId: string, song: Song) {
  const songAlbumRef = admin.firestore().doc(`songAlbums/${songId}`);
  songAlbumRef.get()
    .then(doc => {
      if (!doc.exists) {
        return;
      }

      const batch = admin.firestore().batch();

      // update albums with changed data
      const updates: Promise<void>[] = [];
      const data = doc.data() as SongAlbum;
      Object.keys(data).forEach(albumId => {
        updates.push(writeSongtoAlbum(albumId, data[albumId], song, batch));
      });

      Promise.all(updates)
        .then(() => batch.commit())
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
}

function areTitlesEqual(title1: Title, title2: Title) {
  return title1.english === title2.english
    && title1.chinese.zht === title2.chinese.zht
    && title1.chinese.zhp === title2.chinese.zhp
    && title1.chinese.eng === title2.chinese.eng
}

/**
 * This method is invoked when a songAlbum is created.
 */
export const onCreateSongAlbum = (snapshot: DocumentSnapshot, context: EventContext) => {
  const songId = snapshot.id;
  const songAlbum = snapshot.data() as SongAlbum;

  const songRef = admin.firestore().doc(`songs/${songId}`);
  songRef.get()
    .then(doc => {
      if (!doc.exists) {
        return;
      }

      const song = doc.data() as Song;
      const batch = admin.firestore().batch();

      // update albums with changed data
      const updates: Promise<void>[] = [];
      Object.keys(songAlbum).forEach(albumId => {
        updates.push(writeSongtoAlbum(albumId, songAlbum[albumId], song, batch));
      });

      Promise.all(updates)
        .then(() => batch.commit())
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
}

/**
 * This method is invoked when a songAlbum is updated.
 */
export const onUpdateSongAlbum = (change: Change<DocumentSnapshot>, context: EventContext) => {
  const after = change.after.data() as SongAlbum;
  const before = change.before.data() as SongAlbum;

  const songRef = admin.firestore().doc(`songs/${change.after.id}`);
  songRef.get()
    .then(doc => {
      if (!doc.exists) {
        return;
      }

      const song = doc.data() as Song;

      const keysAfter = Object.keys(after);
      const keysBefore = Object.keys(before);

      const batch = admin.firestore().batch();
      const changes: Promise<void>[] = [];

      keysAfter.forEach(albumId => {
        if (keysBefore.includes(albumId)) {
          if (after[albumId] !== before[albumId]) {
            // updated track number in the album
            changes.push(updateSongInAlbum(albumId, before[albumId], after[albumId], song, batch));
          }

          // remove album from keysBefore
          const index = keysBefore.indexOf(albumId);
          if (index > -1) {
            keysBefore.splice(index, 1);
          }
        } else {
          // added song to the album
          changes.push(writeSongtoAlbum(albumId, after[albumId], song, batch));
        }
      });

      // deleted song from the albums left in keysBefore
      keysBefore.forEach(albumId => {
        changes.push(removeSongFromAlbum(albumId, before[albumId], song.id, batch));
      });

      Promise.all(changes)
        .then(() => batch.commit())
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
};

/**
 * This method is invoked when a songAlbum is deleted.
 */
export const onDeleteSongAlbum = (snapshot: DocumentSnapshot, context: EventContext) => {
  const songId = snapshot.id;
  const songAlbum = snapshot.data() as SongAlbum;

  const batch = admin.firestore().batch();

  // update albums with changed data
  const updates: Promise<void>[] = [];
  Object.keys(songAlbum).forEach(albumId => {
    updates.push(removeSongFromAlbum(albumId, songAlbum[albumId], songId, batch));
  });

  Promise.all(updates)
    .then(() => batch.commit())
    .catch(error => console.error(error));
};

/**
 * Updates a song's track position in an album, moving it from `oldTrackNum` to `newTrackNum`.
 */
function updateSongInAlbum(albumId: string, oldTrackNum: number, newTrackNum: number, song: Song, batch: WriteBatch) {
  const albumRef = admin.firestore().doc(`albums/${albumId}`);
  return albumRef.get()
    .then(albumDoc => {
      if (!albumDoc.exists) {
        return;
      }

      const album = albumDoc.data() as Album;

      if (!album.songs) {
        album.songs = {};
      }

      // remove song from previous track number
      const existing = album.songs[oldTrackNum];
      if (!!existing && existing.id === song.id) {
        delete album.songs[oldTrackNum];
      }

      // put song at new track number
      if (!album.songs[newTrackNum]) {
        album.songs[newTrackNum] = {} as Song;
      }
      const item = album.songs[newTrackNum];
      item.id = song.id;
      item.title = song.title;

      batch.set(albumRef, album);
    })
    .catch(error => console.error(error));
}

/**
 * Puts a song at `trackNum` position in an album.
 */
function writeSongtoAlbum(albumId: string, trackNum: number, song: Song, batch: WriteBatch) {
  const albumRef = admin.firestore().doc(`albums/${albumId}`);
  return albumRef.get()
    .then(albumDoc => {
      if (!albumDoc.exists) {
        return;
      }

      const album = albumDoc.data() as Album;

      if (!album.songs) {
        album.songs = {};
      }

      if (!album.songs[trackNum]) {
        album.songs[trackNum] = {} as Song;
      }

      // replace song at trackNum
      const item = album.songs[trackNum];
      item.id = song.id;
      item.title = song.title;

      batch.set(albumRef, album);
    })
    .catch(error => console.error(error));
}

/**
 * Removes a song from `trackNum` position in an album.
 */
function removeSongFromAlbum(albumId: string, trackNum: number, songId: string, batch: WriteBatch) {
  const albumRef = admin.firestore().doc(`albums/${albumId}`);
  return albumRef.get()
    .then(albumDoc => {
      if (!albumDoc.exists) {
        return;
      }

      const album = albumDoc.data() as Album;

      if (!album.songs) {
        return;
      }

      if (!album.songs[trackNum]) {
        return;
      }

      // remove only if the song ids match
      const existing = album.songs[trackNum];
      if (existing.id === songId) {
        delete album.songs[trackNum];
      }

      batch.set(albumRef, album);
    })
    .catch(error => console.error(error));
}
