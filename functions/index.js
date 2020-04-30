const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();

admin.initializeApp();

const firebaseConfig = {
   apiKey: 'AIzaSyAHn3oqMettfZFaB1k9C5sNi6ikm5TEpSQ',
   authDomain: 'rfej-14ee9.firebaseapp.com',
   databaseURL: 'https://rfej-14ee9.firebaseio.com',
   projectId: 'rfej-14ee9',
   storageBucket: 'rfej-14ee9.appspot.com',
   messagingSenderId: '793938049676',
   appId: '1:793938049676:web:8871797f495111edd1d9a9',
   measurementId: 'G-D2MKJ2D2WS',
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// @GET single route handler for multiple paths
// hello world
app.get(['/', '/hello', '/home'], (req, res) => {
   res.send('Hello from Firebase!');
});

// @GET
// querying database
app.get('/screams', (req, res) => {
   db.collection('screams')
      .get()
      .then((data) => {
         let screams = [];
         data.forEach((doc) => {
            screams.push(doc.data());
         });
         return res.json(screams).catch((err) => console.log(err));
      });
});

// @POST
app.post('/screams', (req, res) => {
   const newScream = {
      body: req.body.body,
      userHandle: req.body.userHandle,
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
   };

   db.collection('screams')
      .add(newScream)
      .then((doc) => {
         res.json({ message: `document ${doc.id} created successfully` });
      })
      .catch((err) => {
         res.status(500).json({ error: 'something went wrong.' });
         console.log(err);
      });
});

app.post('/signup', (req, res) => {
   const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
   };

   db.doc(`/users/${newUser.handle}`)
      .get()
      .then((doc) => {
         if (doc.exists) {
            return res
               .status(400)
               .json({ handle: 'this handle is already taken' });
         } else {
            firebase
               .auth()
               .createUserWithEmailAndPassword(newUser.email, newUser.password);
         }
      })
      .then((data) => {
         return data.user.getIdToken();
      })
      .then((token) => {
         return res.status(201).json({ token });
      })
      .catch((err) => {
         console.log(err);
         return res.status(500).json({ error: err.code });
      });
});

exports.api = functions.https.onRequest(app);
