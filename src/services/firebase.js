import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

// Configuración directa (reemplaza con tus valores reales)
const firebaseConfig = {
  apiKey: "AIzaSyBsyv36oFdEH9zdDUkwEVXi22zGtAjhkrM",
  authDomain: "registrodeusuario-174f1.firebaseapp.com",
  databaseURL: "https://registrodeusuario-174f1-default-rtdb.firebaseio.com",
  projectId: "registrodeusuario-174f1",
  storageBucket: "registrodeusuario-174f1.firebasestorage.app",
  messagingSenderId: "310957905003",
  appId: "1:310957905003:web:14db95d62bc49f875e4d2e",
  measurementId: "G-Y8MZYDXHV9"
};

// Inicialización con verificación de errores
let app, auth, db, analytics;

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  console.log('Firebase inicializado correctamente')
} catch (error) {
  console.error('Error al inicializar Firebase:', error)
  throw error
}

// Función para registrar un nuevo usuario
const registerWithEmailAndPassword = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      createdAt: new Date()
    })
    
    return { success: true, user }
  } catch (error) {
    console.error('Error en registro:', error)
    if (error.code === 'auth/email-already-in-use') {
      return { 
        success: false, 
        error: "El correo electrónico ya está registrado",
        errorCode: "email-already-in-use"
      }
    }
    return { success: false, error: error.message, errorCode: error.code }
  }
}

// Función para iniciar sesión
const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    console.error('Error en login:', error)
    return { success: false, error: error.message }
  }
}

// Función para cerrar sesión
const logout = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('Error en logout:', error)
    return { success: false, error: error.message }
  }
}

// Función para restablecer contraseña
const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error) {
    console.error('Error en reset password:', error)
    return { success: false, error: error.message }
  }
}

// Observador de estado de autenticación
const authStateListener = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Add this after initializing the app
const storage = getStorage(app);

// Add storage to your exports
export { 
  auth,
  db,
  storage,
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  logout,
  sendPasswordReset,
  authStateListener
}