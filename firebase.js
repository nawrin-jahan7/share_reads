const admin = require('firebase-admin');

// Remove 'gs://' prefix if present
const bucketName = process.env.FIREBASE_BUCKET_URL.replace('gs://', '');

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      storageBucket: bucketName
});

const bucket = admin.storage().bucket();

module.exports = { bucket };