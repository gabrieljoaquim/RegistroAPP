const handleRegister = async () => {
  try {
    // Crear el usuario con email y contraseña
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    
    // Actualizar el perfil del usuario con su nombre
    await updateProfile(userCredential.user, {
      displayName: name.value // Asegúrate de tener un campo name en tu formulario
    });

    // Crear el documento del usuario en Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: name.value,
      email: email.value,
      createdAt: new Date(),
      // otros campos que quieras incluir
    });

    // ... resto del código de registro
  } catch (error) {
    console.error('Error en el registro:', error);
  }
};