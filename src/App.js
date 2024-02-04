import logo from './logo.svg';
import CoinApp from './components/CoinApp'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import env from "react-dotenv";
import './App.css';
import './css/customStyle.css';

const theme = createTheme();
const telApp = window.Telegram.WebApp;

function App() {
  const [userData, setUserData] = useState([])
  const [profileUrl, setProfileUrl] = useState(null)
  const [pointCount, setPointCount] = useState(0);
  const [miningInfo, setMiningInfo] = useState({
    status: 'idle',
    perClick: 2,
    limit: 2000 , 
    max: 2000, 
  });

  useEffect(() => {
    telApp.ready()
    init()
  }, [])

  useEffect (() => {
    getUserProfile()
    handleSignUp();
    handleMiningInfo();
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
    const getFileId = await axios.get(`https://api.telegram.org/bot${process.env.REACT_APP_TELEGRAM_BOT_TOKEN}/getUserProfilePhotos?user_id=${userData.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    const fileId = getFileId.data.result.photos[0][2].file_id
    const getFilePath = await axios.get(`https://api.telegram.org/bot${process.env.REACT_APP_TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    const filePath = getFilePath.data.result.file_path;

   setProfileUrl(`https://api.telegram.org/file/bot${process.env.REACT_APP_TELEGRAM_BOT_TOKEN}/${filePath}`)
  }
  
  const handleMiningInfo = () => {
    if (typeof userData.id === 'undefined') return null;
    // get user data by api and change limit 
    axios.get(`http://127.0.0.1:4000/user/${userData.id}`)
      .then((response) => {
        console.log(response)
        if (response.data && 'points' in response.data) {
            setPointCount(response.data.points) 
          }
        if (response.data && 'limit' in response.data) {
          console.log(response.data.limit)
          setMiningInfo(prevMiningInfo => {
              return {...prevMiningInfo, limit: response.data.limit};
          });
        }
      })
      .catch((error) => console.error('Mining error:', error));
  }

  const handleSignUp = () => {
    if (typeof userData.id === 'undefined') return null;
    axios.post('http://127.0.0.1:4000/signup', { userId: userData.id })
      .then((response) => {
        console.log('Signup was success:', response.data);
      })
      .catch((error) => console.error('Signup error:', error));
  };

  // change background color of telegram mini app
  return (
    <div className="App">
       <ThemeProvider theme={theme}>
          <CoinApp 
             userData={userData} 
             profileUrl={profileUrl} 
             telApp={telApp} 
             userId={userData.id} 
             pointCount={pointCount} 
             setPointCount={setPointCount} 
             miningInfo={miningInfo} 
             setMiningInfo={setMiningInfo}
             />
       </ThemeProvider>
    </div>
  );
}

export default App;
