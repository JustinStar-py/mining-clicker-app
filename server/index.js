var admin = require("firebase-admin");
var serviceAccount = require("./adminsdk-firebase.json");
const { bot } = require('./bot');
const { transfer } = require('./cryptoOperations-bsc');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sendchain-ee5ed-default-rtdb.firebaseio.com/"
});

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors())
app.use(express.json());

const database = admin.database();
const auth = admin.auth();

// Get user data
app.get('/api/user/:id', async (req, res) => {
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
app.post('/api/user/:id/add-point', async (req, res) => {
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
app.post('/api/signup', (req, res) => {
  const { userId, username, firstname, lastname } = req.body;
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
           skins: [1],
           username: username,
           firstname: firstname,
           lastname: lastname,
           referrals: 0,
           referralsInfo: 'null',
           referredId: 'null'
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

app.post('/api/withdraw', async (req, res) => {
  const { userId, userAddress, points } = req.body;

  const userRef = admin.database().ref(`users/${userId}`);

  const message = await bot.telegram.sendMessage(userId, `<b>🛂 Withdrawal Request</b>\n\n🪼 Receiver: <b>${userAddress}</b>\n💎 Points: <b>${points}</b>\n\n<b>⏰ Please wait secends we process your request...</b>\n\n<b>Support : @P2P_JS</b>`, {
    parse_mode: 'HTML'
  });
  try {
    const tx = await transfer(userAddress, points * 10 ** process.env.DECIMALS);
    // change point to 0 in database
    if (tx) {
      await userRef.update({ points: 0 });
      await bot.telegram.sendMessage(userId, `<b>🏂 Congratulations! Your ${points} token withdrawal was successful.\n\n🔎 Check on <a href='https://solscan.io/tx/${tx}'>Solscan</a>\n🌀 Hash: <code>${tx}</code></b>`, {parse_mode:'HTML'}) 
      return res.status(200).json({ tx: tx });
    } else {
      await bot.telegram.sendMessage(userId, `<b>❌ Withdrawal failed. Please try again later.\n\nContact support: @P2P_JS</b>`, {parse_mode:'HTML'})
    }
  } catch (error) {
    await bot.telegram.editMessageText(userId, message.message_id, error)
  }
});

app.post('/api/buy-skin', async (req, res) => {
  const { userId, skinID } = req.body;
  const userRef = admin.database().ref(`users/${userId}`);
  // take a snapshot
  const snapshot = await userRef.once('value');
  const userData = snapshot.val();
  var price = 0;
  
  // check skinID not exist in userData.skins
  if (userData.skins.includes(skinID)) {
    return res.status(400).send({ error: 'SkinID already exists' });
  } else {
    switch (skinID) {
      case 1:
        price = 0;
        break;
      case 2:
        price = 500;
        break;
      case 3:
        price = 2200;
        break;
      case 4:
        price = 5000;
        break;
      default:
        return res.status(400).send({ error: 'Invalid skinID' });
    }
    
    if (userData.points < price) {
      return res.status(400).send({ error: 'Insufficient points' });
    }

    try {
      await userRef.update({ skinID: skinID, points: userData.points - price, skins: [...userData.skins, skinID] });
      res.status(200).send({ message: 'SkinID updated successfully' });
    } catch (error) {
      res.status(500).send({ error: 'Error updating skinID', details: error });
    }
  }
});

app.post('/api/change-skin', async (req, res) => {
  const { userId, skinID } = req.body;
  const userRef = admin.database().ref(`users/${userId}`);

  try {
    await userRef.update({ skinID: skinID });
    res.status(200).send({ message: 'SkinID updated successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Error updating skinID', details: error });
  }
})

// referral system
app.post('/api/referral', async (req, res) => {
  const { referrerId, referredId, firstname, lastname, username } = req.body;

  // Check if the referred user already exists
  const referredUserRef = await database.ref('users/' + referredId)
  const referrerUserRef = await database.ref('users/' + referrerId)
  
  const referredUserSnapshot = await referredUserRef.once('value');
  const referrerUserSnapshot = await referrerUserRef.once('value');

  if (referredUserSnapshot.exists()) {
    // The referred user already exists, return an error
    return res.status(400).json({ error: 'The referred user already exists' });
  }

  try {
    // increase referrals of 
    const newUserInfo = { userId: referredId, firstname: firstname, lastname: lastname, username: username };
    const refferalsInfo = referrerUserSnapshot.val().referralsInfo === 'null' ? [newUserInfo] : [...referrerUserSnapshot.val().referralsInfo, newUserInfo];
    await referrerUserRef.update({ 
      referrals: referrerUserSnapshot.val().referrals + 1, 
      referralsInfo: refferalsInfo,
      points: referrerUserSnapshot.val().points + 150 
    });

    // The referred user does not exist, create a new user entry
    await referredUserRef.set({
      userId: referredId,
      createdAt: new Date().toISOString(),
      points: 0,
      lastActive: new Date().toISOString(),
      limit: 2000,
      skinID : 1,
      skins: [1],
      firstname: firstname,
      lastname: lastname,
      username: username,
      referrals: 0,
      referralsInfo: 'null',
      referrer: referrerId,
    })
    .then(() => {
      return res.status(201).json({ userId: referredId });
    })
    .catch(error => {
      // Handle errors in creating the user
      return res.status(500).send(error.message);
    });
  } catch (error) {
    // Handle errors in updating the user
    return res.status(500).send({ error: 'User inveted before or internal server error', details: error });
  }
});

// get user ranking
app.get('/api/user/:id/get-rank', async (req, res) => {
  const userId = req.params.id;

  try {
    // Get the target user's data
    const targetUserSnapshot = await database.ref('users/' + userId).once('value');
    const targetUserData = targetUserSnapshot.val();

    // Get all users' data
    const allUsersSnapshot = await database.ref('users').orderByChild('points').once('value');
    const allUsersData = allUsersSnapshot.val();

    // Convert the users data into an array for sorting
    const usersArray = Object.keys(allUsersData).map((key) => ({
      userId: key,
      points: allUsersData[key].points,
    }));

    // Sort the array in descending order based on points
    usersArray.sort((a, b) => b.points - a.points);

    // Find the index of the target user in the sorted array
    const targetUserIndex = usersArray.findIndex((user) => user.userId === userId);

    // Calculate the rank (add 1 because array indices are zero-based)
    const rank = targetUserIndex + 1;

    // Return the rank
    res.status(200).send({ rank });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error getting user rank', details: error });
  }
});

// get 10 top players from database or leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const snapshot = await database.ref('users').orderByChild('points').limitToLast(10).once('value');
    const usersData = snapshot.val();

    if (!usersData) {
      return res.status(200).send({ users: [] });
    }

    // Convert the user data to an array for sorting
    const usersArray = Object.keys(usersData).map(key => ({
      id: key,
      ...usersData[key]
    }));

    // Sort users by their points in descending order
    const sortedUsers = usersArray.sort((a, b) => b.points - a.points);

    // Extract only the necessary information (firstname and username)
    const leaderboardUsers = sortedUsers.map(user => ({
      userId: user.userId,
      username: user.username,
      points: user.points
    }));

    res.status(200).send({ users: leaderboardUsers });
  } catch (error) {
    res.status(500).send({ error: 'Error getting leaderboard', details: error });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});