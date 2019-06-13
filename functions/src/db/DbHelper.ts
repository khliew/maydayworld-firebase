import * as admin from 'firebase-admin';
import { Change, EventContext } from 'firebase-functions';
import Album from '../models/Album';
import Discography from "../models/Discography";

export const onUpdateAlbum = (change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) => {
  const after = change.after.data() as Album;
  const before = change.before.data() as Album;

  if (before.albumId === after.albumId
    && before.type === after.type
    && before.releaseDate === after.releaseDate
    && areTitlesEqual(before, after)) {
    return; // no changes to make to discography
  }

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

function areTitlesEqual(album1: Album, album2: Album) {
  return album1.title.english === album2.title.english
    && album1.title.chinese.zht === album2.title.chinese.zht
    && album1.title.chinese.zhp === album2.title.chinese.zhp
    && album1.title.chinese.eng === album2.title.chinese.eng
}
