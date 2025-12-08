import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase Admin credentials are missing. Please check environment variables: ' +
        `PROJECT_ID=${!!projectId}, CLIENT_EMAIL=${!!clientEmail}, PRIVATE_KEY=${!!privateKey}`
      );
    }

    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
    } catch (error: any) {
      console.error('[FIREBASE_ADMIN] Initialization error:', error);
      throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
    }
  } else {
    adminApp = getApps()[0];
  }
  
  try {
    adminDb = getFirestore(adminApp);
  } catch (error: any) {
    console.error('[FIREBASE_ADMIN] Firestore initialization error:', error);
    throw new Error(`Failed to get Firestore instance: ${error.message}`);
  }
  
  return adminDb;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    return initializeFirebaseAdmin();
  }
  return adminDb;
}
