import * as admin from 'firebase-admin';
import { Change, EventContext } from 'firebase-functions';
import Album from '../models/Album';
import Discography from '../models/Discography';
import Song from '../models/Song';
import SongAlbum from '../models/SongAlbum';
import Title from '../models/Title';
import SongMetadata from '../models/SongMetadata';
import Track from '../models/Track';

type DocumentSnapshot = admin.firestore.DocumentSnapshot;
type WriteBatch = admin.firestore.WriteBatch;

/**
 * This method is invoked when an album is created.
 */
export const onCreateAlbum = (snapshot: DocumentSnapshot, context: EventContext) => {
  const album = snapshot.data() as Album;

  if (!album.type) {
    return; // no section to put album in
  }

  // get discography and add album into it
  const discoRef = admin.firestore().doc('discos/mayday');
  discoRef.get()
    .then(doc => {
      if (!doc.exists) {
        return;
      }

      const disco = doc.data() as Discography;

      // create sections array if needed
      if (!disco.sections) {
        disco.sections = [];
      }

      // find the correct section, creating it if necessary
      let section = disco.sections.find(item => item.type === album.type);
      if (!section) {
        section = { type: album.type, albums: [] };
        disco.sections.push(section);
      }

      // add album
      section.albums.push({
        id: album.id,
        title: album.title,
        releaseDate: album.releaseDate,
        disabled: album.disabled
      });

      // save
      discoRef.set(disco)
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
};

/**
 * This method is invoked when an album is updated.
 */
export const onUpdateAlbum = (change: Change<DocumentSnapshot>, context: EventContext) => {
  const after = change.after.data() as Album;
  const before = change.before.data() as Album;

  if (before.type === after.type
    && before.releaseDate === after.releaseDate
    && before.disabled === after.disabled
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

      // create sections array if needed
      if (!disco.sections) {
        disco.sections = [];
      }

      // remove album from old section
      if (before.type !== after.type) {
        const oldSection = disco.sections.find(item => item.type === before.type);
        if (!!oldSection && !!oldSection.albums) {
          const oldIndex = oldSection.albums.findIndex(item => item.id === before.id);
          if (oldIndex > -1) {
            oldSection.albums.splice(oldIndex, 1);
          }
        }
      }

      // find new section, creating it if necessary
      let section = disco.sections.find(item => item.type === after.type);
      if (!section) {
        section = { type: after.type, albums: [] };
        disco.sections.push(section);
      }

      // add or update album in new section
      const index = section.albums.findIndex(item => item.id === after.id);
      if (index > -1) {
        const album = section.albums[index];
        album.id = after.id;
        album.title = after.title;
        album.releaseDate = after.releaseDate;
        if (typeof album.disabled !== "undefined") {
          album.disabled = after.disabled;
        }
      } else {
        section.albums.push({
          id: after.id,
          title: after.title,
          releaseDate: after.releaseDate,
          disabled: after.disabled
        });
      }

      // save
      discoRef.set(disco)
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
};

/**
 * This method is invoked when an album is deleted.
 */
export const onDeleteAlbum = (snapshot: DocumentSnapshot, context: EventContext) => {
  const album = snapshot.data() as Album;

  const discoRef = admin.firestore().doc('discos/mayday');
  discoRef.get()
    .then(doc => {
      if (!doc.exists) {
        return;
      }

      const disco = doc.data() as Discography;

      if (!disco.sections) {
        return; // no sections
      }

      const section = disco.sections.find(item => item.type === album.type);
      if (!section) {
        return; // album's section doesn't exist
      }

      const index = section.albums.findIndex(item => item.id === album.id);
      if (index === -1) {
        return; // album not found in section
      }

      // remove album from section
      section.albums.splice(index, 1);

      // save
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

  // add song to songMetadata collection
  updateSongMeta(snapshot.id, song);

  // add song to any associated album
  updateAlbumSongLists(snapshot.id, song);
};

/**
 * This method is invoked when a song is updated.
 */
export const onUpdateSong = (change: Change<DocumentSnapshot>, context: EventContext) => {
  const after = change.after.data() as Song;
  const before = change.before.data() as Song;

  if (before.disabled === after.disabled
    && areTitlesEqual(before.title, after.title)) {
    return; // no changes to make to album
  }

  // update song in songMetadata collection
  updateSongMeta(change.after.id, after);
  
  // update any associated album
  updateAlbumSongLists(change.after.id, after);
};

/**
 * This method is invoked when a song is deleted.
 */
export const onDeleteSong = (snapshot: DocumentSnapshot, context: EventContext) => {
  const songId = snapshot.id;

  // delete song from songMetadata collection
  admin.firestore().doc(`songMetadatas/${songId}`).delete()
    .catch(error => console.error(error));

  // delete song from songAlbums collection
  admin.firestore().doc(`songAlbums/${songId}`).delete()
    .catch(error => console.error(error));
};

/**
 * Updates the song metadata for a song.
 */
function updateSongMeta(songId: string, song: Song) {
  const smRef = admin.firestore().doc(`songMetadatas/${songId}`);

  // create new song metadata
  const item: SongMetadata = {
    id: song.id,
    title: song.title,
    lyricist: song.lyricist,
    composer: song.composer,
    arranger: song.arranger,
    disabled: typeof song.disabled !== 'undefined' ? song.disabled : false
  };

  // save
  smRef.set(item, { merge: true })
    .catch(error => console.error(error));
}

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
      const data = doc.data() as SongAlbum;
      Object.keys(data).forEach(albumId => writeSongToAlbum(albumId, data[albumId], song, batch));

      batch.commit()
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
}

/**
 * Compares two `Title`s and returns `true` if their field values are equal.
 */
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
      Object.keys(songAlbum).forEach(albumId => writeSongToAlbum(albumId, songAlbum[albumId], song, batch));

      batch.commit()
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
          writeSongToAlbum(albumId, after[albumId], song, batch);
        }
      });

      // deleted song from the albums left in keysBefore
      keysBefore.forEach(albumId => {
        changes.push(removeSongFromAlbum(albumId, before[albumId], song.id, batch));
      });

      Promise.all(changes)
        .then(() => {
          batch.commit()
            .catch(error => console.error(error));
        })
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

      const update: { [track: string]: any } = {};
      const album = albumDoc.data() as Album;

      if (!!album.songs) {
        // remove song from previous track number
        const existing = album.songs[oldTrackNum];
        if (!!existing && existing.id === song.id) {
          update[`songs.${oldTrackNum}`] = admin.firestore.FieldValue.delete();
        }
      }

      // put song at new track number
      const item: Track = {
        id: song.id,
        title: song.title,
        disabled: typeof song.disabled !== 'undefined' ? song.disabled : false
      };
      update[`songs.${newTrackNum}`] = item;

      batch.update(albumRef, update);
    })
    .catch(error => console.error(error));
}

/**
 * Puts a song at `trackNum` position in an album.
 */
function writeSongToAlbum(albumId: string, trackNum: number, song: Song, batch: WriteBatch) {
  const albumRef = admin.firestore().doc(`albums/${albumId}`);

  const item: Track = {
    id: song.id,
    title: song.title,
    disabled: typeof song.disabled !== 'undefined' ? song.disabled : false
  };

  batch.update(albumRef, { [`songs.${trackNum}`]: item });
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
      if (!!existing && existing.id === songId) {
        batch.update(albumRef, { [`songs.${trackNum}`]: admin.firestore.FieldValue.delete() });
      }
    })
    .catch(error => console.error(error));
}
