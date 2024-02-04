var admin = require("firebase-admin");
var serviceAccount = require("./aludraecosystem-firebase-adminsdk-p3s71-2464fb78e9.json");
const { bot } = require('./bot');
const { transfer } = require('./cryptoOperations');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aludraecosystem-default-rtdb.firebaseio.com"
});

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors())
app.use(express.json());

const database = admin.database();
const auth = admin.auth();

// Get user data
app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const userSnapshot = await database.ref('users/' + userId).once('value');
    const userData = userSnapshot.val();

    // Check last activity time and update the mining limit if needed
    const lastActive = new Date(userData.lastActive);
    const now = new Date();
    const timePassed = Math.floor((now - lastActive) / 1000); // time passed in seconds

    if (timePassed > 0) {
      // Increment the mining limit based on the time passed (up to a maximum of 2000)
      const newLimit = Math.min(userData.limit + timePassed, 2000);
      
      // Update user data with the new mining limit and last active time
      userData.limit = newLimit;
      userData.lastActive = now.toISOString();

      // Save the updated user data
      await database.ref('users/' + userId).update(userData);
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Error getting user data' });
  }
});

// Endpoint to update user score
app.post('/user/:id/add-point', async (req, res) => {
  const userId = req.params.id;
  const {points: newScore} = req.body;

  if (typeof newScore === 'undefined') {
    return res.status(400).send({ error: 'Score is required' });
  }

  // get user data 
  const userSnapshot = await database.ref('users/' + userId).once('value');
  const userData = userSnapshot.val();

  try {
    // Update the user's score
    await database.ref('users/' + userId).update({ points: userData.points + newScore, lastActive: new Date().toISOString(), limit: userData.limit - newScore });
    return res.status(200).send({ message: 'Score and lastActive updated successfully' });
  } catch (error) {
    return res.status(500).send({ error: 'Error updating score', details: error });
  }
});

// Sign up a new user
app.post('/signup', (req, res) => {
  const { userId } = req.body;

  // Here 'users' is assumed to be the collection where user data is being stored.
  const userRef = admin.database().ref(`users/${userId}`);

  userRef.once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        // User already exists, return the existing data
        return res.status(200).json({ userId: snapshot.val().userId, ...snapshot.val() });
      } else {
        // User does not exist, create a new user entry
        userRef.set({ userId: userId, 
           createdAt: new Date().toISOString(), 
           points: 0,
           lastActive: new Date().toISOString(), 
           limit: 2000, 
           skinID : 1,
           skins: [1]
        })
          .then(() => {
            return res.status(201).json({ userId: userId });
          })
          .catch(error => {
            // Handle errors in creating the user
            return res.status(500).send(error.message);
          });
      }
    })
    .catch(error => {
      // Handle any other errors
      res.status(500).send(error.message);
    });
});

app.post('/withdraw', async (req, res) => {
  const { userId, userAddress, points } = req.body;
  const userRef = admin.database().ref(`users/${userId}`);

  const message = await bot.telegram.sendMessage(userId, `<b>🛂 Withdrawal Request</b>\n\n🪼 Receiver: <b>${userAddress}</b>\n💎 Points: <b>${points}</b>\n\n<b>⏰ Please wait while we process your request...</b>\n\n<b>Support : @P2P_JS</b>`, {
    parse_mode: 'HTML'
  });
  try {
    await transfer(userAddress, points);
    // change point to 0 in database
    await userRef.update({ points: 0 });
    await bot.telegram.sendMessage(userId, `✅ Withdrawal request was sent to your address. You will get ${points} your tokens shortly.`) 
  } catch (error) {
    await bot.telegram.editMessageText(userId, message.message_id, error)
  }
});

app.post('/buy-skin', async (req, res) => {
  const { userId, skinID } = req.body;
  var price = 0;
  
  switch (skinID) {
    case 1:
      price = 0;
      break;
    case 2:
      price = 500;
      break;
    case 3:
      price = 1200;
      break;
    case 4:
      price = 2000;
      break;
    default:
      return res.status(400).send({ error: 'Invalid skinID' });
  }

  const userRef = admin.database().ref(`users/${userId}`);
  
  try {
    // take a snapshot
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();

    await userRef.update({ skinID: skinID, points: userData.points - price, skins: [...userData.skins, skinID] });
    res.status(200).send({ message: 'SkinID updated successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Error updating skinID', details: error });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});