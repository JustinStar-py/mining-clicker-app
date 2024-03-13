import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, Typography, TextField, Avatar, Divider } from '@mui/material';
import { styled } from '@mui/system';
import { message } from 'antd';
import { CssBaseline, ThemeProvider, createTheme, LinearProgress } from '@mui/material';
import SkinsModal from './Skins';
import FriendsModal from './Freinds';
import LeaderboardModal from './Leaderboard';
import { keyframes } from '@emotion/react';
import MyProgress from './Progress';
import axios from 'axios';
import leafRight from '../images/leaf-right.png';

// import images of skins
import defaultCoin from '../images/Coin.png';
import OrangeCoin from '../images/Orange.png';
import GuardCoin from '../images/Guard.png';
import BattleCoin from '../images/Battle.png';

const isDesktop = window.innerWidth > 1000;
const theme = createTheme();

// Styled components for the gold buttons
const GoldButton = styled(Button)({
  backgroundColor: 'transparent',
  borderRadius: 15,
  width: '20vw',
  margin: '10px',
  padding: window.innerHeight < 740 ? '5px' : '10px',
  fontFamily: 'avenir',
  fontSize: '19px',
  textTransform: 'Capitalize',
  fontWeight: 800,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
});

const CoinLogo = styled(Box)({
    width: '35vw',
    marginBottom: '15px',
    // filter: 'hue-rotate(12deg) drop-shadow(0px 0px 25px #0152AC)',
    [theme.breakpoints.down('md')]: {
        width: window.innerHeight < 740 ? '67vw' : '75vw',
        marginBottom: window.innerHeight < 740 ? '10px' : '35px',
    },
})

// keyframes for animation
const expand = keyframes`
   from, to { width: ${isDesktop ? '33vw' : '73vw'}; }
   20% { width: ${isDesktop ? '28.5vw' : '68vw'}; }
   50% { width: ${isDesktop ? '30vw' : '70vw'}; }
`;

const fontSizeAnim = keyframes`
   from, to { font-size: ${isDesktop ? '22px' : '26px'}; }
   50% { font-size: ${isDesktop ? '22px' : '26px'}; }
`;

const floatUpAndFadeOut = keyframes`
  0% {
    transform: translateY(0px);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px);
    opacity: 0;
  }
`;

export default function CoinApp(props) {
  const {userData, profileUrl, telApp, userId, pointCount, setPointCount, miningInfo, setMiningInfo } = props;
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [openSkins, setOpenSkins] = useState(false);
  const [openFriends, setOpenFriends] = useState(false);
  const [openLeaderboard, setOpenLeaderboard] = useState(false);
  const [expandAnimation, setExpandAnimation] = useState('');
  const [fontSizeAnimation, setFontSizeAnimation] = useState('');
  const [textPoints, setTextPoints] = useState([]); 
  const [userAddress, setUserAddress] = useState('');
  const [userSkins, setUserSkins] = useState([]);
  const [userCurrentSkinID, setUserCurrentSkinID] = useState();
  const [userCurrentSkinImage, setUserCurrentSkinImage] = useState(0);
  const [userCurrentReferrals, setUserCurrentReferrals] = useState(0);
  const [userReferralsInfo, setUserReferralsInfo] = useState([]);
  const [userCurrentRank, setUserCurrentRank] = useState(null);
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/216/216.wav'));

  useEffect(() => {
    const interval = setInterval(async () => {
      setMiningInfo(prevMiningInfo => {
        // Only increase limit if it's below the max
        if (userData.id)  axios.get(`https://app.sendchain.io/api/user/${userData.id}`)
        if (prevMiningInfo.limit < prevMiningInfo.max) {
          return {...prevMiningInfo, limit: prevMiningInfo.limit + 1};
        } else {
          // Otherwise, keep the previous state unchanged
          clearInterval(interval); // If limit reached max, clear the interval to stop it
          return prevMiningInfo;
        }
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [miningInfo.limit]); 
  
  useEffect(() => {
    const req = async () => {
      await axios.post(`https://app.sendchain.io/api/user/${userId}/add-point`, {
      points: miningInfo.perClick,
    })
    .then(response => {
      console.log('Score was updated:', response.data);
      // Additional code to handle the response...
    })
    .catch(error => {
      console.error('Error updating score:', error);
      // Additional code to handle the error...
    });
    }
   req()
  }, [pointCount])

  useEffect(() => {
    const req = async () => {
      await axios.get(`https://app.sendchain.io/api/user/${userId}`)
      .then(response => {
        const userCurrentSkinID = response.data.skinID;
        setUserSkins(response.data.skins);
        setUserCurrentSkinID(userCurrentSkinID);
        setUserCurrentReferrals(response.data.referrals);
        setUserReferralsInfo(response.data.referralsInfo);
        // set user images
        switch (userCurrentSkinID) {
          case 1:
            setUserCurrentSkinImage(defaultCoin);
            break;
          case 2:
            setUserCurrentSkinImage(OrangeCoin);
            break;
          case 3:
            setUserCurrentSkinImage(GuardCoin);
            break;
          case 4:
            setUserCurrentSkinImage(BattleCoin);
            break;
          default:
            setUserCurrentSkinImage(defaultCoin);

        }
       })
      .catch(error => {
        console.error('Error getting skins:', error);
        // Additional code to handle the error...
      });

      await axios.get(`https://app.sendchain.io/api/user/${userId}/get-rank`)
      .then(response => {
        setUserCurrentRank(response.data.rank);
        console.log('Rank:', response.data.rank);
        // Additional code to handle the response...
      })

      await axios.get(`https://app.sendchain.io/api/leaderboard`)
      .then(response => {
          setLeaderboardList(response.data.users)
      })
      .catch(error => {
        console.error('Error getting leaderboard:', error);
      });
    }
    req()
  },[pointCount, openSkins, openFriends] )

  const handleOpen = () => setOpenWithdraw(true);
  const handleClose = () => setOpenWithdraw(false);

  // Handle the change of the address input
  const handleAddressChange = (event) => setUserAddress(event.target.value);

  const handleCoinClick = (event) => {
    if (miningInfo.limit !== 0) {
        setPointCount(pointCount + miningInfo.perClick);
        setMiningInfo({ ...miningInfo, limit: miningInfo.limit - miningInfo.perClick, status: 'mining' });
      
        setExpandAnimation(`${expand} 0.1s ease`);
        setFontSizeAnimation(`${fontSizeAnim} 0.1s ease`);
        audio.play();

        const x = event.clientX;
        const y = event.clientY;

        // create a new point element
        setTextPoints([...textPoints, { x, y, id: Date.now() }]); // using the current timestamp for a unique ID
        setTimeout(() => {
          setExpandAnimation('');
          setFontSizeAnimation('');
        }, 200); // This should match the duration of your animation
      } else {
        setMiningInfo({ ...miningInfo, status: 'stop' });
        if (window.Telegram.WebApp) {
          window.Telegram.WebApp.showAlert('Mining limit reached. Please try again later.');
        }
        // alert('Mining limit reached. Please try again later.');
      }
  };

  // this function will show withdraw modal after user clicked on the button
  const handleWithdrawClick = () => {
    setOpenWithdraw(true);
  };

  // this function will show after user clicked on the button in withdraw modal
  const handleWithdraw = () => {
    if (pointCount >= 50) {
      axios.post(`https://app.sendchain.io/api/withdraw`, {
        userId: userId,
        userAddress: userAddress,
        points: pointCount
      })
      .then(response => {
        message.success('Withdrawal was successfully, please check your wallet!');
        if (window.Telegram.WebApp) {
           window.Telegram.WebApp.close();
        }
      })
      .catch(error => {
        message.error('Something went wrong, please check SendChain bot!');
        // Additional code to handle the error...
      });
    } else {
      alert('Insufficient balance. you need to have at least 5000 points to withdraw');
    }
    setOpenWithdraw(false);
  }
    // remove a point after animation is done
   const removePoint = (id) => {
        setTextPoints(textPoints.filter(point => point.id !== id));
  };

  const getPointLeftPosition = (pointCount) => {
    const thresholds = [
        [999999999999999, '17vw'],
        [9999999999999, '21vw'],
        [999999999999, '23vw'],
        [9999999999, '27vw'],
        [999999999, '29vw'],
        [99999999, '32vw'],
        [9999999, '34vw'],
        [999999, '36vw'],
        [99999, '38vw'],
        [9999, '40vw'],
        [999, '42vw'],
        [99, '45vw'],
        [9, '46vw'],
    ];

    for (const [threshold, position] of thresholds) {
        if (pointCount > threshold) {
            return position;
        }
    }

    return '47.5vw';
};

  const getCoinSkinShadow = (userCurrentSkinID) => {
    switch (userCurrentSkinID) {
      case 1:
        return '0px 0px 45px #291400';
      case 2:
        return '0px 0px 45px #FAE088';
      case 3:
        return '0px 0px 45px #5c716c';
      case 4:
        return '0px 0px 45px skyblue';
      default:
        return '0px 0px 45px #0152AC';
    }
  }

  return (
    <Box sx={{height: '100vh',display: 'flex',flexDirection: 'column',justifyContent: 'space-between',alignItems: 'center',p: 1,}} >
      <Box sx={{display: 'flex',alignItems: 'center',justifyContent: 'center',margin: '10px',background: 'rgba(0,0,0,0.21)',color: 'white',padding: '10px',backdropFilter: 'blur(10px)',borderRadius: '20px',width: `${isDesktop ? '30vw' : '90vw'}`,height: `${isDesktop ? '6.5vw' : '10vh'}`}}>
        <Avatar src={profileUrl} alt="Profile" sx={{  width: '60px', height: '60px', borderRadius: '15px !important', }}/>
        <Typography variant="h5" component="p" sx={{ fontWeight: '800', fontFamily: 'Avenir', flexGrow: 1, textAlign: 'center',}}>
          {userData.first_name}
        </Typography>
     </Box>

     <Typography component="p" sx={{fontWeight: '800', fontFamily: 'avenir', position: 'absolute', top: '20%', left: getPointLeftPosition(pointCount), color: 'aliceblue', animation: fontSizeAnimation, fontSize: `${isDesktop ? '23px' : '25px'}`, zIndex: 1}}>
           {pointCount}
      </Typography>
      <Typography component="p" sx={{fontWeight: '600', fontFamily: 'avenir', position: 'absolute', top: '24%', color: 'aliceblue', fontSize: `${isDesktop ? '14px' : '16'}`, zIndex: 1}}>
          <img src={leafRight} alt="leaf" style={{filter: 'invert(1)', width: '40px', verticalAlign: 'middle', transform: 'scaleX(-1)'}}/>
           Ranking : {userCurrentRank === null ? 'Loading...' : userCurrentRank === 1 ? '1st' : userCurrentRank === 2 ? '2nd' : userCurrentRank === 3 ? '3rd' : `${userCurrentRank}th`}
          <img src={leafRight} alt="leaf" style={{filter: 'invert(1)', width: '40px', verticalAlign: 'middle'}}/>
      </Typography>
 
      <CoinLogo component="img" src={userCurrentSkinImage || defaultCoin} alt="Coin Logo" onClick={handleCoinClick} sx={{animation: expandAnimation,"&:hover": {  cursor: 'pointer',}, filter: `drop-shadow(${getCoinSkinShadow(userCurrentSkinID)})`}} />

      {textPoints.map((point) => (
          <Box
            key={point.id}
            sx={{
              position: 'absolute',
              left: point.x - 10,
              top: point.y - 20,
              animation: `${floatUpAndFadeOut} 1s ease forwards`, // forwards keeps the end state after animation completes
              fontSize: `${isDesktop ? '40px' : '35px'}`,
              fontFamily: 'avenir',
              color: 'white',
            }}
            onAnimationEnd={() => removePoint(point.id)} // remove element after animation
          >
          +{miningInfo.perClick}
          </Box>
        ))}
     
      <p style={{position: 'absolute', top: '77%', left: '5vw', color: 'aliceblue', animation: fontSizeAnimation, fontFamily: "avenir", fontSize: `${isDesktop ? '18px' : '13px'}`}}>
         <img style={{verticalAlign:'bottom'}} width="28" height="30" src="https://img.icons8.com/fluency/48/flash-on.png" alt="flash-on"/>
          <span style={{fontSize: `${isDesktop ? '25px' : '20px'}`}}> {miningInfo.limit} </span> / {miningInfo.max}
      </p>

      <LinearProgress 
         variant="buffer" 
         // if he used 50% of coin limits the background is like orage, if is 100% bg is red (with white) and in start is green
         color={(miningInfo.limit / miningInfo.max) * 100 === 100 ? 'secondary' : (miningInfo.limit / miningInfo.max) * 100 >= 50 ? 'warning' : 'error'}
         sx={{ 
          width: `${isDesktop ? '30vw' : '90vw'}`, 
          height: `${isDesktop ? '1.5vh' : '4vh'}`, 
          position: 'absolute', 
          top: '84%', 
          borderRadius: '10px',  
          "& .MuiLinearProgress-dashed": { 
            right: '0px',
          }
        }} 
          value={(miningInfo.limit / miningInfo.max) * 100} 
          valueBuffer={(Math.random() * 10) + (miningInfo.limit / miningInfo.max) * 100} 
      />

      {/* Buttons */}
      <Box sx={{ mb: 2, width:'95vw', maxWidth:'138vw', background: '#2f32325c', borderRadius:'15px', display: 'flex', backdropFilter: 'blur(10px)', justifyContent: 'space-around', alignItems: 'center'}}>
        <GoldButton variant="contained" onClick={() => setOpenFriends(true)}>
            Frens <img style={{verticalAlign:'middle'}} width="25" height="25" src="https://img.icons8.com/color/48/friends--v1.png" alt="paint-palette"/>
        </GoldButton>
         <Divider orientation="vertical" variant="middle" flexItem color='rgb(255 255 255 / 40%)' sx={{marginRight: '30px'}} />
         <GoldButton variant="contained" onClick={() => setOpenLeaderboard(true)}>
           <span style={{marginRight: '5px', marginTop: '5px'}}>Leaderboard</span>
           <img style={{verticalAlign:'middle'}} width="25" height="25" src="https://img.icons8.com/external-anggara-flat-anggara-putra/64/external-podium-school-anggara-flat-anggara-putra-2.png" alt="external-podium"/>
        </GoldButton>
         <Divider orientation="vertical" variant="middle" flexItem color='rgb(255 255 255 / 40%)' sx={{marginLeft: '30px'}} />
        <GoldButton variant="contained" onClick={() => setOpenSkins(true)}>
            Skins <img style={{verticalAlign:'middle'}} width="25" height="25" src="https://img.icons8.com/fluency/48/paint-palette.png" alt="paint-palette"/>
        </GoldButton>
        <GoldButton variant="contained" onClick={handleWithdrawClick} sx={{ position: 'absolute', right: '0vw', bottom: '15vh', padding: '10px', borderRadius: '12px', background: '#2f32325c', backdropFilter: 'blur(10px)', width: '45vw'}}>
           Withdraw <img style={{verticalAlign:'middle'}} width="25" height="25" src="https://img.icons8.com/emoji/48/money-bag-emoji.png" alt="flash-on"/>
        </GoldButton>
      </Box>

      {/* Withdraw Address Modal */}
      <Modal
        open={openWithdraw}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75vw',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: '17px',
          background: '#ffffffb5',
          backdropFilter: 'blur(5px)'
        }} >
          <Typography id="modal-modal-title" fontFamily="avenir" sx={{ fontSize: '20px' }}>
            Enter your bsc wallet address to withdraw
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 1, fontFamily: "avenir", fontSize: '16px' }} component="p">
             minimum withdraw: 5000 points
          </Typography>
          <TextField
            fullWidth
            autoFocus
            margin="normal"
            id="address"
            label="Address"
            type="text"
            variant="outlined"
            value={userAddress}
            onChange={handleAddressChange}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{fontWeight:"100", fontSize:'20px', fontFamily: "avenir", textTransform:"capitalize", margin:'3px', borderRadius:'10px'}}>Cancel</Button>
            <Button onClick={handleWithdraw} disabled={pointCount < 50 || userAddress === ''} sx={{fontWeight:"100", fontSize:'20px', fontFamily: "avenir", textTransform:"capitalize", margin:'3px', borderRadius:'10px'}}>Withdraw</Button>
          </Box>
        </Box>
      </Modal>

     {/* Skins Modal */}
      <SkinsModal open={openSkins} handleClose={() => setOpenSkins(false)} userData={userData} userSkins={userSkins} userCurrentSkin={userCurrentSkinID} />
   
      {/* Friends Modal */}
      <FriendsModal open={openFriends} handleClose={() => setOpenFriends(false)} userData={userData} referralCount={userCurrentReferrals} referralList={userReferralsInfo === 'null' ? [] : userReferralsInfo} />
    
      {/* Leaderboard Modal */}
      <LeaderboardModal open={openLeaderboard} handleClose={() => setOpenLeaderboard(false)} userData={userData} leaderboardList={leaderboardList} />
    </Box>
  );
}
