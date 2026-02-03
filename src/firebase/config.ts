import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ADICIONAR ISSO
// import { getAnalytics } from "firebase/analytics"; // Remova se não for usar

const firebaseConfig = {
  apiKey: "AIzaSyAj25xaOrb4J7kea0NZgrC2vJZ9F0h8Ygw",
  authDomain: "estoque-dba2f.firebaseapp.com",
  projectId: "estoque-dba2f",
  storageBucket: "estoque-dba2f.firebasestorage.app",
  messagingSenderId: "490158779248",
  appId: "1:490158779248:web:91116f699df16ab773bdb5",
  measurementId: "G-2CBZMYBM4V"
};

const app = initializeApp(firebaseConfig);

// ADICIONAR ESSA LINHA - Exporta o banco de dados
export const db = getFirestore(app);

// const analytics = getAnalytics(app); // Opcional