import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

export function generateFilePath(userId: string, type: string, filename: string): string {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `users/${userId}/${type}/${timestamp}.${ext}`;
}

export default app;

// ─── Firebase Phone Auth ────────────────────────────────────────────────────
// Used for sending real SMS OTPs via Firebase Phone Authentication.
// The backend verifies the Firebase ID token via POST /api/auth/verify-phone-token

let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
  return recaptchaVerifier;
}

export async function sendPhoneSmsOtp(phoneNumber: string): Promise<any> {
  if (!recaptchaVerifier) throw new Error('RecaptchaVerifier not initialised. Call setupRecaptcha first.');
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmation;
}

export async function verifyPhoneSmsOtp(
  confirmationResult: any,
  otp: string
): Promise<string> {
  const credential = await confirmationResult.confirm(otp);
  const idToken = await credential.user.getIdToken();
  return idToken;   // send this to POST /api/auth/verify-firebase-phone for backend verification
}
