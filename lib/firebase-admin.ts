import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {

    
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    adminApp = getApps()[0];
  }
  
  adminDb = getFirestore(adminApp);
  return adminDb;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    return initializeFirebaseAdmin();
  }
  return adminDb;
}
