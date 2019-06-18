import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as sinon from 'sinon';
import { assert } from 'chai';
import 'mocha';

const testEnv = functions();

const adminInitStub = sinon.stub(admin, 'initializeApp');
import * as myFunctions from '../src/index';

describe('onDeleteAlbum', () => {
  it('should remove album from discography', () => {
    const album = {
      id: 'album1',
      releaseDate: '2013-08-24',
      title: {
        english: 'english',
        chinese: {
          zht: 'zht',
          zhp: 'zhp',
          eng: 'eng'
        }
      },
      type: 'studio',
      songs: {},
      disabled: true,
    };
    const disco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [{ id: 'album1' }, { id: 'albumId2' }]
        }
      ]
    };

    const docRef = {
      data: disco,
      get: () => {
        return Promise.resolve(docRef.data);
      },
      set: sinon.spy()
    }

    sinon.stub(admin, 'firestore')
      .get(() => {
        return function () {
          return {
            doc: (path: string) => docRef
          }
        }
      });

    const wrapped = testEnv.wrap(myFunctions.onDeleteAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(album, `albums/${album.id}`);
    wrapped(snap);

    assert.isTrue(docRef.set.calledOnce);
    assert.isTrue(docRef.set.calledWith({
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [{ id: 'albumId2' }]
        }
      ]
    }));
  });
});

adminInitStub.restore();
testEnv.cleanup();
