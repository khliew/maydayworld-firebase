/**
 * This function mocks `Firestore`.
 * 
 * @param data data to return by `firestore().doc().get()`
 */
export function mockFirestore(data: any = '') {
  const getPromise = Promise.resolve({
    exists: !!data,
    data: () => data
  });
  const set = jest.fn(() => Promise.resolve());
  const get = jest.fn(() => getPromise);
  const deleteFn = jest.fn(() => Promise.resolve());
  const doc = jest.fn(() => {
    return {
      set,
      get,
      delete: deleteFn
    };
  });

  const update = jest.fn();
  const commit = jest.fn(() => Promise.resolve());
  const batch = jest.fn(() => {
    return {
      update,
      commit
    };
  });

  const firestore = () => {
    return {
      doc,
      batch
    }
  };

  return {
    firestore,
    doc: {
      get: {
        promise: getPromise
      }
    }
  };
};
