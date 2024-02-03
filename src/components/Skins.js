import React, { useState, useEffect } from 'react';
import { Modal, Backdrop, Fade, Button, Typography, Grid, Paper } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import pizzaCoin from '../images/Pizza.png';
import defaultCoin from '../images/Coin.png';
import saucepanCoin from '../images/Saucepan.png';
import samuraiCoin from '../images/Samurai.png';

const SkinsModal = ({ open, handleClose, userData, userSkins, userCurrentSkin }) => {

  const handleBuySkin = (event) => {
    // get skin id 
    const skinID = event.target.id;
    axios.post(`http://localhost:4000/buy-skin`, {
      userId: userData.id,
      skinID: Number(skinID)
    })
    .then(response => {
      console.log('SkinID was updated:', response.data);
      handleClose();
    })
  }

  const images = [
    { name: 'Default Skin', price: 'Free', src: defaultCoin },
    { name: 'Saucepan Skin', price: '500 Points', src: saucepanCoin },
    { name: 'Samurai Skin', price: '1200 Points', src: samuraiCoin },
    { name: 'Pizza Skin', price: '2000 Points', src: pizzaCoin },
    // Add more images as needed
  ];

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
        <div style={{
          backgroundColor: '#ffffffb5',
          backdropFilter: 'blur(5px)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '300px',
          margin: 'auto',
          marginTop: '10%',
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
                  <Button onClick={handleBuySkin} id={index+1} variant="contained" sx={{ backgroundColor: `${userSkins.includes(index+1) ? 'darkslategrey' : '#00db0e'}`, width: '100%', textTransform: 'uppercase', fontWeight: 'bold', fontFamily: 'avenir', }}>
                     {userCurrentSkin === index+1 ? 'Selected' : userSkins.includes(index+1) ? 'Purchased' : 'Buy'}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>
            <CloseIcon onClick={handleClose} />
          </div>
        </div>
      </Fade>
    </Modal>
  );
};

export default SkinsModal;
