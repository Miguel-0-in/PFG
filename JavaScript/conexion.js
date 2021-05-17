// Your web app's Firebase configuration
let firebaseConfig = {
  apiKey: "AIzaSyBx7zMYwECbAlJiM5FJi_Eji3_ZyhQgD9E",
  authDomain: "proyectofincurso-8679c.firebaseapp.com",
  projectId: "proyectofincurso-8679c",
  storageBucket: "proyectofincurso-8679c.appspot.com",
  messagingSenderId: "348566857513",
  appId: "1:348566857513:web:4c9b00a3b180570a6b3938",
};
// Initialize Firebase
let app = firebase.initializeApp(firebaseConfig);
let db = firebase.firestore(app);

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    modalLog.style.display = "block";
  }
});

const modalLog = el("myModalLog");
const modalSignUp = el("myModalSignUp");

el("btnLogIn").addEventListener("click", function () {
  let email = document.getElementById("loginUsuario").value;
  let password = document.getElementById("loginPass").value;

  login(email, password);
});

el("btnLogInGoogle").addEventListener("click", function (){
  let provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;

      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
});

el("btnSignUp").addEventListener("click", function () {
  modalLog.style.display = "none";
  modalSignUp.style.display = "block";
});

el("btnCreateUser").addEventListener("click", function () {
  let email = document.getElementById("signUpUsuario").value;
  let password = document.getElementById("signUpPass").value;

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("Usuario registrado con exito.");
      login(email, password);
    })
    .catch((error) => {
      var errorMessage = error.message;
      document.getElementById("errorReg").textContent = errorMessage;
    });
});

el("btnBack").addEventListener("click", function () {
  modalSignUp.style.display = "none";
  modalLog.style.display = "block";
});

el("logout").addEventListener("click", function () {
  firebase
    .auth()
    .signOut()
    .then(() => {
      location.reload();
    })
    .catch((error) => {
      alert(error.message);
    });
});

function login(email, password) {
  const date = new Date(Date.now());
  firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(() => {
      return firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          if (modalLog.style.display == "block") {
            modalLog.style.display = "none";
            let historic = db.collection("historico").doc(email);
            historic.update({
              fecha: firebase.firestore.FieldValue.arrayUnion(
                firebase.firestore.Timestamp.fromDate(date)
              )
            });
          } else {
            modalSignUp.style.display = "none";
            let hist = db
              .collection("historico")
              .doc(email)
              .set({
                fecha: firebase.firestore.FieldValue.arrayUnion(
                  firebase.firestore.Timestamp.fromDate(date)
                )
              });
          }
        })
        .catch((error) => {
          var errorMessage = error.message;
          document.getElementById("errorLogin").textContent = errorMessage;
        });
    })
    .catch((error) => {
      var errorMessage = error.message;
      alert(errorMessage);
    });
}

function el(id) {
  return document.getElementById(id);
}