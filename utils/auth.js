import { auth, db } from "./firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function registerUser(email, password, name, phone) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // Store user profile in Firestore
  await setDoc(doc(db, "users", user.uid), {
    name,
    phone,
    email,
    balance: 0,
    streakDays: 0,
    points: 0,
    createdAt: new Date().toISOString()
  });

  return user;
}

export async function loginUser(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function logoutUser() {
  await signOut(auth);
}
