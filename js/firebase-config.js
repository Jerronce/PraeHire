import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyATQe2BcLSrQqcDVVNEjjioPt3O1IbyLlo",
  authDomain: "praehire.firebaseapp.com",
  projectId: "praehire",
  storageBucket: "praehire.firebasestorage.app",
  messagingSenderId: "327322116075",
  appId: "1:327322116075:web:2bf7d0cf00630ee83603ae",
  measurementId: "G-3QE36JHXMZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
