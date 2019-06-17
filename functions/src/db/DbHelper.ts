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

  if (before.albumId === after.albumId
    && before.type === after.type
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
          if (album.albumId === before.albumId) {
            album.albumId = after.albumId;
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

  updateAlbumSongLists(song.songId, song);
};

/**
 * This method is invoked when a song is updated.
 */
export const onUpdateSong = (change: Change<DocumentSnapshot>, context: EventContext) => {
  const after = change.after.data() as Song;
  const before = change.before.data() as Song;

  if (before.songId === after.songId
    && areTitlesEqual(before.title, after.title)) {
    return; // no changes to make to album
  }

  updateAlbumSongLists(before.songId, after);
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
        changes.push(removeSongFromAlbum(albumId, before[albumId], song.songId, batch));
      });

      Promise.all(changes)
        .then(() => batch.commit())
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
};

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

      const existing = album.songs[oldTrackNum];
      if (!!existing && existing.songId === song.songId) {
        delete album.songs[oldTrackNum];
      }

      if (!album.songs[newTrackNum]) {
        album.songs[newTrackNum] = {} as Song;
      }
      const item = album.songs[newTrackNum];
      item.songId = song.songId;
      item.title = song.title;

      batch.set(albumRef, album);
    })
    .catch(error => console.error(error));
}

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
      const item = album.songs[trackNum];
      item.songId = song.songId;
      item.title = song.title;

      batch.set(albumRef, album);
    })
    .catch(error => console.error(error));
}

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
      if (existing.songId === songId) {
        delete album.songs[trackNum];
      }

      batch.set(albumRef, album);
    })
    .catch(error => console.error(error));
}
