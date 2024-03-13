import React, { useState } from 'react';
import { Modal, Backdrop, Fade, Button, Typography, Grid, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import BattleCoin from '../images/Battle.png';
import defaultCoin from '../images/Coin.png';
import GuardCoin from '../images/Guard.png';
import OrangeCoin from '../images/Orange.png';
import { message } from 'antd';

const images = [
  { name: 'Default Skin', price: 'Free', src: defaultCoin },
  { name: 'Orange Skin', price: '500 Points', src: OrangeCoin },
  { name: 'Guard Skin', price: '2200 Points', src: GuardCoin },
  { name: 'Battle Skin', price: '5000 Points', src: BattleCoin },
  // Add more images as needed
];

const slideIn = keyframes`
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100px);
    opacity: 0;
  }
`;

const AnimatedDiv = styled('div')(({ theme, open }) => ({
  animation: `${open ? slideIn : slideOut} 0.5s`,
}));

const SkinsModal = ({ open, handleClose, userData, userSkins, userCurrentSkin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuySkin = (event) => {
    // get skin id 
    const skinID = event.target.id;
    setIsLoading(true);
    axios.post(`https://app.sendchain.io/api/buy-skin`, {
      userId: userData.id,
      skinID: Number(skinID)
    })
    .then(response => {
      message.success('Skin purchased successfully!');
      handleClose();
    })
    
    .catch(error => {
      if  (error.response.data.error === "SkinID already exists") {
        axios.post(`https://app.sendchain.io/api/change-skin`, {
          userId: userData.id,
          skinID: Number(skinID)
        }).then(response => {
          message.success('Skin changed successfully');
          handleClose();
        }).catch(error => {
          message.error('Error changing skin');
          console.error('Error changing skin:', error);
        }).finally(() => setIsLoading(false));
      }
    })
    .finally(() => setIsLoading(false));
  }  

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <AnimatedDiv open={open} style={{
          backgroundColor: '#ffffffb5',
          backdropFilter: 'blur(5px)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '300px',
          margin: 'auto',
          marginTop: '2.5vh',
        }}>
          <Grid container spacing={2}>
            {images.map((image, index) => (
              <Grid key={index} item xs={6}>
                <Paper
                  sx={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <img src={image.src} alt={`Product ${index + 1}`} style={{ width: '100%', borderRadius: '10px' }} />
                  <div style={{ padding: '10px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{image.name}</Typography>
                    <Typography variant="body2">{image.price}</Typography>
                  </div>
                  <Button onClick={handleBuySkin} id={index+1} variant="contained" 
                    sx={{ 
                      backgroundColor: `${userCurrentSkin === index+1 ? isLoading ? 'darkgray' : 'dodgerblue' : userSkins.includes(index+1) ? 'gray' : '#00db0e'}`, 
                      width: '100%', 
                      textTransform: 'uppercase', 
                      fontWeight: 'bold', 
                      fontFamily: 'avenir', }}>
                     {userCurrentSkin === index+1 ? 'Selected' : userSkins.includes(index+1) ? 'Select' : 'Buy'}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>
            <CloseIcon onClick={handleClose} />
          </div>
        </AnimatedDiv>
      </Fade>
    </Modal>
  );
};

export default SkinsModal;
