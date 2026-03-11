/**
 * Firebase Firestore connection integration test.
 *
 * Requires a valid .env file with Firebase credentials.
 * Writes a test document to `_test_/connection` and verifies it can be read back,
 * then cleans up by deleting the document.
 *
 * Run with: pnpm test
 */

import { describe, it, expect, afterAll } from 'vitest'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env from project root before importing firebase modules
config({ path: resolve(process.cwd(), '.env') })

// Dynamically import after env is loaded
const { initializeApp, getApps, deleteApp } = await import('firebase/app')
const {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  Timestamp,
} = await import('firebase/firestore')

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

// Use a separate app instance for tests to avoid conflicts
const testApp = initializeApp(firebaseConfig, 'test-instance')
const db = getFirestore(testApp)

const TEST_DOC_PATH = '_test_/connection'

afterAll(async () => {
  // Clean up test document
  await deleteDoc(doc(db, TEST_DOC_PATH))
  // Clean up test app
  await deleteApp(testApp)
})

describe('Firebase Firestore connection', () => {
  it('should write a test document to Firestore', async () => {
    const testData = {
      message: 'hello from vitest',
      createdAt: Timestamp.now(),
    }

    await expect(
      setDoc(doc(db, TEST_DOC_PATH), testData)
    ).resolves.toBeUndefined()
  })

  it('should read back the test document from Firestore', async () => {
    const snap = await getDoc(doc(db, TEST_DOC_PATH))

    expect(snap.exists()).toBe(true)
    expect(snap.data()?.message).toBe('hello from vitest')
  })

  it('should delete the test document from Firestore', async () => {
    await deleteDoc(doc(db, TEST_DOC_PATH))
    const snap = await getDoc(doc(db, TEST_DOC_PATH))
    expect(snap.exists()).toBe(false)
  })
})
