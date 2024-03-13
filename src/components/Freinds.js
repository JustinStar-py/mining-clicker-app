import React, { useState } from 'react';
import { Modal, Backdrop, Fade, Button, Typography, Grid, Paper, Box } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { message } from 'antd';

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

const FreindsModal = ({ open, handleClose, userData, referralCount, referralList }) => {
   
  const handleReferral = (event) => {
    navigator.clipboard.writeText(event.target.id);
    message.success('Copied to clipboard!');
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
          backdropFilter: 'blur(4px)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '330px',
          height: '85vh',
          margin: 'auto',
          marginTop: '4vh',
          overflowY: 'auto',
        }}>
          <Grid container spacing={4} textAlign={'center'}>
            <Box sx={{ textAlign: 'center', width: '100%', ml:2 }}>
               <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1.5rem'} sx={{ mt: 4 }}>You invtited : </Typography>
                <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'7.5rem'}>{referralCount}</Typography>
            </Box>
          </Grid>
          <Grid container spacing={4} textAlign={'center'}>
            {/* copy referral link by click */}
            <Box sx={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', marginLeft: '30px' }}>
               <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1.5rem'} sx={{ mt: 4 }}>
                   referral link : 
                </Typography>
                <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1rem'} sx={{ p:2, backgroundColor: '#ffffff7d', borderRadius: '10px' }}>
                      {`https://t.me/SendChain_bot?start=${userData.id}`}
                 </Typography>
                  <Button variant="contained" size="small" sx={{ borderRadius: '10px', backgroundColor: '#ffffff7d', color: '#5b5b5b', mt: 2, '&:hover': { backgroundColor: '#ffffff7d'}}} id={`https://t.me/SendChain_bot?start=${userData.id}`} onClick={handleReferral}>
                      Copy Link <ContentCopyIcon fontSize="small" sx={{ ml: 1 }} />
                  </Button>
            </Box>
            <Box sx={{alignItems: 'center', width: '100%', ml:2 }}>
               <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1.5rem'} sx={{ mt: 4 }}>
                 <img style={{verticalAlign:'middle'}} width="30" height="30" src="https://img.icons8.com/color/48/friends--v1.png" alt="paint-palette"/>
                  Your friends : 
                </Typography>
                {referralList?.map((referral, index) => (
                <Box key={index} bgcolor={'#ffffff7d'} style={{ textAlign: 'left', width: '95%', margin:'5px', padding: '10px', borderRadius: '10px' }}>
                  <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1.5rem'}>{referral.firstname} {referral.lastname}</Typography>
                  <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1rem'}>ID : {referral.userId}</Typography>
                </Box>
                ))}
                 {referralList.length === 0 && (
                <Box bgcolor={'#ffffff7d'} style={{ textAlign: 'left', width: '95%', margin:'5px', padding: '10px', borderRadius: '10px' }}>
                  <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1.5rem'}>No friends :(</Typography>
                </Box>
                )}
            </Box>
          </Grid>
          <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>
            <CloseIcon onClick={handleClose} />
          </div>
        </AnimatedDiv>
      </Fade>
    </Modal>
  );
};

export default FreindsModal;
