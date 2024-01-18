import logo from './logo.svg';
import CoinApp from './components/CoinApp'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { db } from './db/database';
import { ref, set } from "firebase/database";
import env from "react-dotenv";
import './App.css';
import axios from 'axios';

const theme = createTheme();
const telApp = window.Telegram.WebApp;

function App() {
  const [userData, setUserData] = useState([])
  const [profileUrl, setProfileUrl] = useState(null)

  useEffect(() => {
    telApp.ready()
    init()
  }, [])

  useEffect (() => {
    getUserProfile()
  }, [userData])

  const init = () => {
     var search = window.Telegram.WebApp.initData;
     if (search !== null && search !== '') {
        var converted = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) {
          return key === "" ? value : decodeURIComponent(value);
        });
        var data = JSON.parse(converted.user);
    } else {
        var data = {
          "id": 1887509957,
          "first_name": "Its Justin",
          "last_name": "",
          "username": "P2P_JS",
          "language_code": "en",
          "is_premium": true,
          "allows_write_to_pm": true
      }
    }
    setUserData(data);
  }

  const getUserProfile = async () => {
    const getFileId = await axios.get(`https://api.telegram.org/bot6005370164:AAHcjyIpW-1wXabgPhz-9SIHwJjYwdQiTSE/getUserProfilePhotos?user_id=${userData.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    const fileId = getFileId.data.result.photos[0][2].file_id
    
    const getFilePath = await axios.get(`https://api.telegram.org/bot${process.env.REACT_APP_BOT_TOKEN}/getFile?file_id=${fileId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
   const filePath = getFilePath.data.result.file_path
   setProfileUrl(`https://api.telegram.org/file/bot${process.env.REACT_APP_BOT_TOKEN}/${filePath}`)
  }
  
  function writeUserData(userId, coinNumbers) {
    set(ref(db, 'users/' + userId), {
      username: userId,
      coin_numbers : coinNumbers
    });
  }
  // change background color of telegram mini app
  return (
    <div className="App">
       <ThemeProvider theme={theme}>
          <CoinApp userData={userData} profileUrl={profileUrl} telApp={telApp}/>
       </ThemeProvider>
    </div>
  );
}

export default App;
