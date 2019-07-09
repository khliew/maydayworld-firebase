import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions-test';

export const testEnv = functions();

let adminStub: jest.SpyInstance;

export function testSetUp() {
  beforeAll(() => {
    adminStub = jest.spyOn(admin, 'initializeApp');
  }); 

  afterAll(() => {
    testEnv.cleanup();
    adminStub.mockRestore();
  });
};
