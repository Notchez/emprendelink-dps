# Investigación técnica: Firebase y React Native con Expo

## Síntesis

EmprendeLink utiliza Firebase JavaScript SDK porque Expo lo documenta como una opción válida para
Authentication y Firestore en React Native. Expo SDK 57 requiere Firebase 12 o posterior; por eso
se fijó `firebase@12.18.0`. Esta decisión mantiene una API modular común con la web y evita trasladar
Firebase Admin al dispositivo.

La persistencia se configura con `initializeAuth` y `getReactNativePersistence`, usando
`@react-native-async-storage/async-storage`. Firebase indica que este adaptador envuelve AsyncStorage
para conservar la sesión en React Native. La aplicación observa los cambios de identidad y luego
consulta `users/{uid}`: una identidad sin perfil entra al flujo de completar datos y un perfil
desactivado se cierra inmediatamente.

Google Sign-In requiere una consideración distinta. La biblioteca elegida contiene código nativo;
Expo exige config plugin y development build, por lo que Expo Go no puede ejecutar ese proveedor.
El ID token obtenido de Google se transforma en una credencial con `GoogleAuthProvider.credential`
y se intercambia por una sesión Firebase. Esta ruta no crea roles administrativos: el perfil nuevo
solo acepta CUSTOMER o ENTREPRENEUR.

Los pedidos no se escriben desde Firestore cliente. El móvil envía su Firebase ID token a los Route
Handlers existentes; el servidor valida sesión, rol, propiedad, productos, precios y transiciones
antes de usar Firebase Admin. Esta separación reduce la confianza depositada en datos modificables
por el usuario.

## Referencias

Expo. (s. f.). *Using Firebase*. Expo Documentation. https://docs.expo.dev/guides/using-firebase/

Expo. (s. f.). *Using Google authentication*. Expo Documentation. https://docs.expo.dev/guides/google-authentication/

Expo. (s. f.). *Use a development build*. Expo Documentation. https://docs.expo.dev/develop/development-builds/use-development-builds/

Google. (s. f.). *Firebase JavaScript API reference: Authentication*. Firebase Documentation. https://firebase.google.com/docs/reference/js/auth

Google. (s. f.). *Authenticate using Google with JavaScript*. Firebase Documentation. https://firebase.google.com/docs/auth/web/google-signin
