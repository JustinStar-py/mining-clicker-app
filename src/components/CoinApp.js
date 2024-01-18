import React, { useState } from 'react';
import { Box, Button, Modal, Typography, TextField, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import { CssBaseline, ThemeProvider, createTheme, LinearProgress } from '@mui/material';
import { keyframes } from '@emotion/react';
import logo from '../images/Logo.png';
import MyProgress from './Progress';

const isDesktop = window.innerWidth > 1000;
const theme = createTheme();

// Styled components for the gold buttons
const GoldButton = styled(Button)({
  backgroundColor: 'darkorange',
  borderRadius: 15,
  margin: '0 10px',
  width: `${isDesktop ? '20vw' : '40vw'}`,
  padding: '10px 20px',
  fontFamily: 'avenir',
  fontWeight: 800,
  '&:hover': {
    backgroundColor: 'gold',
  },
});

const CoinLogo = styled(Box)({
    width: '20vw',
    marginBottom: '35px',
    [theme.breakpoints.down('md')]: {
        width: '60vw',
        marginBottom: '35px',
    },
});

// keyframes for animation
const expand = keyframes`
   from, to { width: ${isDesktop ? '30vw' : '90vw'}; }
   50% { width: ${isDesktop ? '27vw' : '84vw'}; }
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
  const {userData, profileUrl, telApp } = props;
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [expandAnimation, setExpandAnimation] = useState('');
  const [fontSizeAnimation, setFontSizeAnimation] = useState('');
  const [coinCount, setCoinCount] = useState(0);
  const [textPoints, setTextPoints] = useState([]); 
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/216/216.wav'));
  const [miningInfo, setMiningInfo] = useState({
    status: 'idle',
    perClick: 1,
    limit: 20
  });
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle the change of the address input
  const handleAddressChange = (event) => setAddress(event.target.value);

  const handleCoinClick = (event) => {
    if (miningInfo.limit !== 0) {
        setCoinCount(coinCount + miningInfo.perClick);
        setMiningInfo({ ...miningInfo, limit: miningInfo.limit - 1, status: 'mining' });
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
        setMiningInfo({ ...miningInfo, status: 'idle' });
        // telApp.showAlert('Mining limit reached. Please try again later.')
        // alert('Mining limit reached. Please try again later.');
      }
    };

    // remove a point after animation is done
   const removePoint = (id) => {
        setTextPoints(textPoints.filter(point => point.id !== id));
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
      }}
    >
     
     <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px',
    background: 'rgba(0,0,0,0.21)',
    color: 'white',
    padding: '10px',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    width: `${isDesktop ? '30vw' : '90vw'}`,
    height: `${isDesktop ? '6.5vw' : '10vh'}`
  }}
>
  <Avatar
    src={profileUrl}
    alt="Profile"
    sx={{
      width: '60px', // responsive size
      height: '60px', // responsive size
      borderRadius: '15px !important', // this will ensure text is centered
    }}
  />
  <Typography
    variant="h5"
    component="p"
    sx={{
      fontWeight: '800',
      fontFamily: 'Avenir',
      flexGrow: 1,
      textAlign: 'center',
    }}
  >
    {userData.first_name}
  </Typography>
</Box>

     <Typography component="p" sx={{fontWeight: '800', fontFamily: 'avenir', position: 'absolute', top: '20%', left: '45vw', color: 'aliceblue', animation: fontSizeAnimation, fontSize: `${isDesktop ? '22px' : '25px'}`}}>
           {coinCount}
      </Typography>
 
      <CoinLogo
        component="img"
        src={logo}
        alt="Coin Logo"
        onClick={handleCoinClick}
        // className="animated-logo"
        sx={{
            animation: expandAnimation,
            "&:hover": {
              cursor: 'pointer',
            }
          }}
      />

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
          +1
        </Box>
      ))}
     
     <p style={{position: 'absolute', top: '76%', left: '10vw', color: 'aliceblue', animation: fontSizeAnimation, fontSize: `${isDesktop ? '15px' : '10px'}`}}>{miningInfo.limit}</p>
      <LinearProgress color={`${coinCount >= 6000 ? 'error' : 'warning'}`} sx={{ width: `${isDesktop ? '30vw' : '90vw'}`, height: `${isDesktop ? '1.5vh' : '4vh'}`, position: 'absolute', top: '82%', borderRadius: '10px'}} variant="determinate" value={(coinCount / 20) * 100} />

      {/* Buttons */}
      <Box sx={{ mb: 4 }}>
        <GoldButton variant="contained" onClick={handleOpen}>
          Withdraw
        </GoldButton>
        <GoldButton variant="contained">
          Ranking
        </GoldButton>
      </Box>

      {/* Withdraw Address Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Enter your wallet address
          </Typography>
          <TextField
            fullWidth
            autoFocus
            margin="normal"
            id="address"
            label="Address"
            type="text"
            variant="outlined"
            value={address}
            onChange={handleAddressChange}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleClose}>Withdraw</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}