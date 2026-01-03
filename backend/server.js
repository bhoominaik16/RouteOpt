const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('RouteOpt Backend is Running!');
});

app.get('/api/rides/:domain', async (req, res) => {
  try {
    const domain = req.params.domain;
    const ridesRef = db.collection('rides');
    const snapshot = await ridesRef.where('orgDomain', '==', domain).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No rides found.' });
    }

    let rides = [];
    snapshot.forEach(doc => {
      rides.push({ id: doc.id, ...doc.data() });
    });

    res.json(rides);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});