import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions-test';
import 'jest';
import * as myFunctions from '../index';
import { mockFirestore } from './helpers/mock-firestore';

const testEnv = functions();

let adminStub: jest.SpyInstance;

const flushPromises = () => new Promise(setImmediate);

beforeAll(() => {
  adminStub = jest.spyOn(admin, 'initializeApp');
});

afterAll(() => {
  testEnv.cleanup();
  adminStub.mockRestore();
});

describe('onCreateAlbum', () => {
  it('should add album to discography when section exists', async () => {
    const album = {
      id: 'album2',
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
      disabled: true
    };

    const disco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [{ id: 'album1' }]
        }
      ]
    };

    const expectedDisco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [
            {
              id: 'album1'
            },
            {
              id: 'album2',
              releaseDate: '2013-08-24',
              title: {
                english: 'english',
                chinese: {
                  zht: 'zht',
                  zhp: 'zhp',
                  eng: 'eng'
                }
              },
              disabled: true
            }
          ]
        }
      ]
    };

    const fsMock = mockFirestore(disco);
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);

    const wrapped = testEnv.wrap(myFunctions.onCreateAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(album, `albums/${album.id}`);
    wrapped(snap);

    await fsMock.doc.get.promise;

    expect(doc().get).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledWith(expectedDisco);
  });

  it('should add album to discography when section doesn\'t exist', async () => {
    const album = {
      id: 'album2',
      releaseDate: '2013-08-24',
      title: {
        english: 'english',
        chinese: {
          zht: 'zht',
          zhp: 'zhp',
          eng: 'eng'
        }
      },
      type: 'compilation',
      songs: {},
      disabled: true
    };

    const disco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [{ id: 'album1' }]
        }
      ]
    };

    const expectedDisco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [
            {
              id: 'album1'
            }
          ]
        },
        {
          type: 'compilation',
          albums: [
            {
              id: 'album2',
              releaseDate: '2013-08-24',
              title: {
                english: 'english',
                chinese: {
                  zht: 'zht',
                  zhp: 'zhp',
                  eng: 'eng'
                }
              },
              disabled: true
            }
          ]
        }
      ]
    };

    const fsMock = mockFirestore(disco);
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);

    const wrapped = testEnv.wrap(myFunctions.onCreateAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(album, `albums/${album.id}`);
    wrapped(snap);

    await fsMock.doc.get.promise;

    expect(doc().get).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledWith(expectedDisco);
  });

  it('should add album to discography when sections array doesn\'t exist', async () => {
    const album = {
      id: 'album2',
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
      disabled: true
    };

    const disco = {
      id: 'disco1'
    };

    const expectedDisco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [
            {
              id: 'album2',
              releaseDate: '2013-08-24',
              title: {
                english: 'english',
                chinese: {
                  zht: 'zht',
                  zhp: 'zhp',
                  eng: 'eng'
                }
              },
              disabled: true
            }
          ]
        }
      ]
    };

    const fsMock = mockFirestore(disco);
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);

    const wrapped = testEnv.wrap(myFunctions.onCreateAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(album, `albums/${album.id}`);
    wrapped(snap);

    await fsMock.doc.get.promise;

    expect(doc().get).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledWith(expectedDisco);
  });
});

describe('onUpdatAlbum', () => {
  it('should update album in discography', async () => {
    const oldAlbum = {
      id: 'album1',
      type: 'studio',
      title: {
        english: 'english-old',
        chinese: {
          zht: 'zht-old',
          zhp: 'zhp-old',
          eng: 'eng-old'
        }
      },
      disabled: false,
      releaseDate: '1970-01-01'
    };

    const newAlbum = {
      id: 'album1',
      type: 'studio',
      title: {
        english: 'english-new',
        chinese: {
          zht: 'zht-new',
          zhp: 'zhp-new',
          eng: 'eng-new'
        }
      },
      disabled: false,
      releaseDate: '2013-08-24'
    };

    const disco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [
            {
              id: 'album1',
              title: {
                english: 'english-old',
                chinese: {
                  zht: 'zht-old',
                  zhp: 'zhp-old',
                  eng: 'eng-old'
                }
              },
              disabled: false,
              releaseDate: '1970-01-01'
            }
          ]
        }
      ]
    };

    const expectedDisco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [
            {
              id: 'album1',
              title: {
                english: 'english-new',
                chinese: {
                  zht: 'zht-new',
                  zhp: 'zhp-new',
                  eng: 'eng-new'
                }
              },
              disabled: false,
              releaseDate: '2013-08-24'
            }
          ]
        }
      ]
    };

    const fsMock = mockFirestore(disco);
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);

    const wrapped = testEnv.wrap(myFunctions.onUpdateAlbum);
    const oldSnap = testEnv.firestore.makeDocumentSnapshot(oldAlbum, `albums/${oldAlbum.id}`);
    const newSnap = testEnv.firestore.makeDocumentSnapshot(newAlbum, `albums/${newAlbum.id}`);
    const changes = testEnv.makeChange(oldSnap, newSnap);
    wrapped(changes);

    await fsMock.doc.get.promise;

    expect(doc().get).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledWith(expectedDisco);
  });
});

describe('onDeleteAlbum', () => {
  it('should remove album from discography', async () => {
    const album = {
      id: 'album1',
      type: 'studio',
    };

    const disco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [{ id: 'album1' }, { id: 'album2' }]
        }
      ]
    };

    const expectedDisco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [{ id: 'album2' }]
        }
      ]
    };

    const fsMock = mockFirestore(disco);
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);

    const wrapped = testEnv.wrap(myFunctions.onDeleteAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(album, `albums/${album.id}`);
    wrapped(snap);

    await fsMock.doc.get.promise;

    expect(doc().get).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledWith(expectedDisco);
  });

  it('should do nothing if album is not in discography', async () => {
    const album = {
      id: 'album1',
      type: 'studio',
    };

    const disco = {
      id: 'disco1',
      sections: [
        {
          type: 'studio',
          albums: [{ id: 'album2' }]
        }
      ]
    };

    const fsMock = mockFirestore(disco);
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);

    const wrapped = testEnv.wrap(myFunctions.onDeleteAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(album, `albums/${album.id}`);
    wrapped(snap);

    await fsMock.doc.get.promise;

    expect(doc().get).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledTimes(0);
  });
});

describe('onCreateSong', () => {
  it('should add song to song metadata collection', () => {
    const song = {
      id: 'song1',
      lyricist: 'lyricist',
      composer: 'composer',
      arranger: 'arranger',
      releaseDate: '2013-08-24',
      title: {
        english: 'english',
        chinese: {
          zht: 'zht',
          zhp: 'zhp',
          eng: 'eng'
        }
      },
      disabled: true,
      lyrics: []
    };

    const expectedSongMetadata = {
      id: 'song1',
      lyricist: 'lyricist',
      composer: 'composer',
      arranger: 'arranger',
      title: {
        english: 'english',
        chinese: {
          zht: 'zht',
          zhp: 'zhp',
          eng: 'eng'
        }
      },
      disabled: true
    };

    const fsMock = mockFirestore();
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(fsMock.firestore().batch as any);

    const wrapped = testEnv.wrap(myFunctions.onCreateSong);
    const snap = testEnv.firestore.makeDocumentSnapshot(song, `songs/${song.id}`);
    wrapped(snap);

    expect(doc).toHaveBeenCalledWith(`songMetadatas/${song.id}`);
    expect(doc().set).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledWith(expectedSongMetadata, { merge: true });
  });

  it('should add song to associated albums', async () => {
    const song = {
      id: 'song1',
      lyricist: 'lyricist',
      composer: 'composer',
      arranger: 'arranger',
      releaseDate: '2013-08-24',
      title: {
        english: 'english',
        chinese: {
          zht: 'zht',
          zhp: 'zhp',
          eng: 'eng'
        }
      },
      disabled: true,
      lyrics: []
    };

    const songAlbum = {
      'album1': 1
    };

    const expected = {
      'songs.1': {
        id: 'song1',
        title: {
          english: 'english',
          chinese: {
            zht: 'zht',
            zhp: 'zhp',
            eng: 'eng'
          }
        },
        disabled: true
      }
    };

    const fsMock = mockFirestore(songAlbum);
    const doc = fsMock.firestore().doc;
    const batch = fsMock.firestore().batch;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(batch as any);

    const wrapped = testEnv.wrap(myFunctions.onCreateSong);
    const snap = testEnv.firestore.makeDocumentSnapshot(song, `songs/${song.id}`);
    wrapped(snap);

    expect(doc).toHaveBeenLastCalledWith(`songAlbums/${song.id}`);

    await fsMock.doc.get.promise;

    expect(doc).toHaveBeenLastCalledWith(`albums/album1`);
    expect(batch().update).toHaveBeenCalledWith(doc(), expected);
    expect(batch().commit).toHaveBeenCalledTimes(1);
  });
});

describe('onUpdateSong', () => {
  it('should update song in metadata', async () => {
    const oldSong = {
      id: 'song1',
      lyricist: 'lyricist-old',
      composer: 'composer-old',
      arranger: 'arranger-old',
      releaseDate: '1970-01-01',
      title: {
        english: 'english-old',
        chinese: {
          zht: 'zht-old',
          zhp: 'zhp-old',
          eng: 'eng-old'
        }
      },
      disabled: false,
      lyrics: []
    };

    const newSong = {
      id: 'song1',
      lyricist: 'lyricist-new',
      composer: 'composer-new',
      arranger: 'arranger-new',
      releaseDate: '2013-08-24',
      title: {
        english: 'english-new',
        chinese: {
          zht: 'zht-new',
          zhp: 'zhp-new',
          eng: 'eng-new'
        }
      },
      disabled: true,
      lyrics: []
    };

    const expectedSongMetadata = {
      id: 'song1',
      lyricist: 'lyricist-new',
      composer: 'composer-new',
      arranger: 'arranger-new',
      title: {
        english: 'english-new',
        chinese: {
          zht: 'zht-new',
          zhp: 'zhp-new',
          eng: 'eng-new'
        }
      },
      disabled: true
    };

    const fsMock = mockFirestore();
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(fsMock.firestore().batch as any);

    const wrapped = testEnv.wrap(myFunctions.onUpdateSong);
    const oldSnap = testEnv.firestore.makeDocumentSnapshot(oldSong, `songs/${oldSong.id}`);
    const newSnap = testEnv.firestore.makeDocumentSnapshot(newSong, `songs/${newSong.id}`);
    const changes = testEnv.makeChange(oldSnap, newSnap);
    wrapped(changes);

    expect(doc).toHaveBeenCalledWith(`songMetadatas/${newSong.id}`);
    expect(doc().set).toHaveBeenCalledTimes(1);
    expect(doc().set).toHaveBeenCalledWith(expectedSongMetadata, { merge: true });
  });

  it('should update song in associated albums', async () => {
    const oldSong = {
      id: 'song1',
      lyricist: 'lyricist-old',
      composer: 'composer-old',
      arranger: 'arranger-old',
      releaseDate: '1970-01-01',
      title: {
        english: 'english-old',
        chinese: {
          zht: 'zht-old',
          zhp: 'zhp-old',
          eng: 'eng-old'
        }
      },
      disabled: false,
      lyrics: []
    };

    const newSong = {
      id: 'song1',
      lyricist: 'lyricist-new',
      composer: 'composer-new',
      arranger: 'arranger-new',
      releaseDate: '2013-08-24',
      title: {
        english: 'english-new',
        chinese: {
          zht: 'zht-new',
          zhp: 'zhp-new',
          eng: 'eng-new'
        }
      },
      disabled: true,
      lyrics: []
    };

    const songAlbum = {
      'album1': 1
    };

    const expected = {
      'songs.1': {
        id: 'song1',
        title: {
          english: 'english-new',
          chinese: {
            zht: 'zht-new',
            zhp: 'zhp-new',
            eng: 'eng-new'
          }
        },
        disabled: true
      }
    };

    const fsMock = mockFirestore(songAlbum);
    const doc = fsMock.firestore().doc;
    const batch = fsMock.firestore().batch;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(batch as any);

    const wrapped = testEnv.wrap(myFunctions.onUpdateSong);
    const oldSnap = testEnv.firestore.makeDocumentSnapshot(oldSong, `songs/${oldSong.id}`);
    const newSnap = testEnv.firestore.makeDocumentSnapshot(newSong, `songs/${newSong.id}`);
    const changes = testEnv.makeChange(oldSnap, newSnap);
    wrapped(changes);

    expect(doc).toHaveBeenLastCalledWith(`songAlbums/${newSong.id}`);

    await fsMock.doc.get.promise;

    expect(doc).toHaveBeenLastCalledWith(`albums/album1`);
    expect(batch().update).toHaveBeenCalledWith(doc(), expected);
    expect(batch().commit).toHaveBeenCalledTimes(1);
  });
});

describe('onDeleteSong', () => {
  it('should remove song from metadata and songAlbum collections', async () => {
    const song = {
      id: 'song1'
    };

    const fsMock = mockFirestore();
    const doc = fsMock.firestore().doc;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);

    const wrapped = testEnv.wrap(myFunctions.onDeleteSong);
    const snap = testEnv.firestore.makeDocumentSnapshot(song, `songs/${song.id}`);
    wrapped(snap);

    expect(doc).toHaveBeenCalledWith(`songMetadatas/${song.id}`);
    expect(doc).toHaveBeenLastCalledWith(`songAlbums/${song.id}`);
    expect(doc().delete).toHaveBeenCalledTimes(2);
  });
});

describe('onCreateSongAlbum', () => {
  it('should add song to album', async () => {
    const songAlbum = {
      'album1': 1
    };

    const song = {
      id: 'song1',
      lyricist: 'lyricist',
      composer: 'composer',
      arranger: 'arranger',
      releaseDate: '2013-08-24',
      title: {
        english: 'english',
        chinese: {
          zht: 'zht',
          zhp: 'zhp',
          eng: 'eng'
        }
      },
      disabled: true,
      lyrics: []
    };

    const expected = {
      'songs.1': {
        id: 'song1',
        title: {
          english: 'english',
          chinese: {
            zht: 'zht',
            zhp: 'zhp',
            eng: 'eng'
          }
        },
        disabled: true
      }
    };

    const fsMock = mockFirestore(song);
    const doc = fsMock.firestore().doc;
    const batch = fsMock.firestore().batch;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(batch as any);

    const wrapped = testEnv.wrap(myFunctions.onCreateSongAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(songAlbum, `songAlbums/${song.id}`);
    wrapped(snap);

    expect(doc).toHaveBeenCalledWith(`songs/${song.id}`);
    expect(doc().get).toHaveBeenCalledTimes(1);

    await fsMock.doc.get.promise;

    expect(batch().update).toHaveBeenCalledWith(doc(), expected);
    expect(batch().commit).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when there is no song', async () => {
    const songId = 'song1';
    const songAlbum = {
      'album1': 1
    };

    const fsMock = mockFirestore();
    const doc = fsMock.firestore().doc;
    const batch = fsMock.firestore().batch;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(batch as any);

    const wrapped = testEnv.wrap(myFunctions.onCreateSongAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(songAlbum, `songAlbums/${songId}`);
    wrapped(snap);

    expect(doc).toHaveBeenCalledWith(`songs/${songId}`);
    expect(doc().get).toHaveBeenCalledTimes(1);

    await fsMock.doc.get.promise;

    expect(batch().update).toHaveBeenCalledTimes(0);
    expect(batch().commit).toHaveBeenCalledTimes(0);
  });
});

describe('onUpdateSongAlbum', () => {
  it('should update song\'s track number in album', async () => {
    const oldSongAlbum = {
      'album1': 1
    };

    const newSongAlbum = {
      'album1': 3
    };

    const song = {
      id: 'song1',
      lyricist: 'lyricist',
      composer: 'composer',
      arranger: 'arranger',
      releaseDate: '2013-08-24',
      title: {
        english: 'english',
        chinese: {
          zht: 'zht',
          zhp: 'zhp',
          eng: 'eng'
        }
      },
      disabled: true,
      lyrics: []
    };

    const album = {
      id: 'album1',
      songs: {
        1: {
          id: 'song1'
        }
      }
    };

    const expected = {
      'songs.1': admin.firestore.FieldValue.delete(),
      'songs.3': {
        id: 'song1',
        title: {
          english: 'english',
          chinese: {
            zht: 'zht',
            zhp: 'zhp',
            eng: 'eng'
          }
        },
        disabled: true
      }
    };

    const fsMock = mockFirestore(song);
    const doc = fsMock.firestore().doc;
    const batch = fsMock.firestore().batch;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(batch as any);

    const wrapped = testEnv.wrap(myFunctions.onUpdateSongAlbum);
    const oldSnap = testEnv.firestore.makeDocumentSnapshot(oldSongAlbum, `songAlbums/${song.id}`);
    const newSnap = testEnv.firestore.makeDocumentSnapshot(newSongAlbum, `songAlbums/${song.id}`);
    const changes = testEnv.makeChange(oldSnap, newSnap);
    wrapped(changes);

    expect(doc).toHaveBeenCalledWith(`songs/${song.id}`);
    expect(doc().get).toHaveBeenCalledTimes(1);

    doc().get.mockReturnValue(Promise.resolve({
      exists: true,
      data: () => album
    }));
    
    await fsMock.doc.get.promise;
    await flushPromises(); // flush Promise.all()

    expect(doc).toHaveBeenLastCalledWith(`albums/${album.id}`);
    expect(doc().get).toHaveBeenCalledTimes(2);
    expect(batch().update).toHaveBeenCalledWith(doc(), expected);
    expect(batch().update).toHaveBeenCalledTimes(1);
    expect(batch().commit).toHaveBeenCalledTimes(1);
  });
  
  it('should remove song from old album and add it to new album', async () => {
    const oldSongAlbum = {
      'album1': 1
    };

    const newSongAlbum = {
      'album2': 3
    };

    const song = {
      id: 'song1',
      lyricist: 'lyricist',
      composer: 'composer',
      arranger: 'arranger',
      releaseDate: '2013-08-24',
      title: {
        english: 'english',
        chinese: {
          zht: 'zht',
          zhp: 'zhp',
          eng: 'eng'
        }
      },
      disabled: true,
      lyrics: []
    };

    const album = {
      id: 'album1',
      songs: {
        1: {
          id: 'song1'
        }
      }
    };

    const expected1 = {
      'songs.3': {
        id: 'song1',
        title: {
          english: 'english',
          chinese: {
            zht: 'zht',
            zhp: 'zhp',
            eng: 'eng'
          }
        },
        disabled: true
      }
    };

    const expected2 = {
      'songs.1': admin.firestore.FieldValue.delete()
    };

    const fsMock = mockFirestore(song);
    const doc = fsMock.firestore().doc;
    const batch = fsMock.firestore().batch;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(batch as any);

    const wrapped = testEnv.wrap(myFunctions.onUpdateSongAlbum);
    const oldSnap = testEnv.firestore.makeDocumentSnapshot(oldSongAlbum, `songAlbums/${song.id}`);
    const newSnap = testEnv.firestore.makeDocumentSnapshot(newSongAlbum, `songAlbums/${song.id}`);
    const changes = testEnv.makeChange(oldSnap, newSnap);
    wrapped(changes);

    doc().get.mockReturnValue(Promise.resolve({
      exists: true,
      data: () => album
    }));
    
    await fsMock.doc.get.promise;
    await flushPromises(); // flush Promise.all()

    expect(doc).toHaveBeenLastCalledWith(`albums/${album.id}`);
    expect(doc().get).toHaveBeenCalledTimes(2);
    expect(batch().update).toHaveBeenCalledWith(doc(), expected1);
    expect(batch().update).toHaveBeenLastCalledWith(doc(), expected2);
    expect(batch().update).toHaveBeenCalledTimes(2);
    expect(batch().commit).toHaveBeenCalledTimes(1);
  });
});

describe('onDeleteSongAlbum', () => {
  it('should remove song from associated album', async () => {
    const songId = 'song1';

    const songAlbum = {
      'album1': 1
    };

    const album = {
      id: 'album1',
      songs: {
        1: {
          id: songId
        }
      }
    }

    const expected = {
      'songs.1': admin.firestore.FieldValue.delete()
    }

    const fsMock = mockFirestore(album);
    const doc = fsMock.firestore().doc;
    const batch = fsMock.firestore().batch;

    jest.spyOn(admin.firestore(), 'doc')
      .mockImplementation(doc as any);
    jest.spyOn(admin.firestore(), 'batch')
      .mockImplementation(batch as any);

    const wrapped = testEnv.wrap(myFunctions.onDeleteSongAlbum);
    const snap = testEnv.firestore.makeDocumentSnapshot(songAlbum, `songAlbums/${songId}`);
    wrapped(snap);

    expect(doc).toHaveBeenCalledWith(`albums/${album.id}`);
    expect(doc().get).toHaveBeenCalledTimes(1);

    await fsMock.doc.get.promise;
    await flushPromises(); // flush Promise.all()

    expect(batch().update).toHaveBeenCalledWith(doc(), expected);
    expect(batch().commit).toHaveBeenCalledTimes(1);
  });
});
