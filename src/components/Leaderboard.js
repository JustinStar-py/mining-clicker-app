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

const LeaderboardModal = ({ open, handleClose, userData, leaderboardList }) => {

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
            <Box sx={{ textAlign: 'center', width: '100%', ml:2, mb: 6 }}>
               <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'2rem'} sx={{ mt: 4 }}>Leaderboard </Typography>
               <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1rem'} sx={{ mt: 0.5 }}>Here is top 10 Players </Typography>
            </Box>
          </Grid>
          <Grid container spacing={4} textAlign={'center'}>
            <Box sx={{alignItems: 'center', width: '100%', ml:2 }}>
                {leaderboardList?.map((referral, index) => (
                <Box key={index} bgcolor={'#ffffff7d'} style={{ textAlign: 'left', width: '95%', margin:'5px', padding: '10px', borderRadius: '10px' }}>
                  <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1.5rem'}>{referral.username} 
                    <span style={{position: 'absolute',right: '35px',background: 'linear-gradient(45deg, #c77a07, #e77676)',borderRadius: '10px',color: 'blanchedalmond',padding: '5px 10px',marginTop: '10px'}}>
                       {referral.points}
                    </span>
                   </Typography>
                  <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1rem'}>ID : {referral.userId}</Typography>
                </Box>
                ))}
                 {leaderboardList.length === 0 && (
                <Box bgcolor={'#ffffff7d'} style={{ textAlign: 'left', width: '95%', margin:'5px', padding: '10px', borderRadius: '10px' }}>
                  <Typography fontFamily={'avenir, sans-serif, serif'} fontWeight={700} fontSize={'1.5rem'}>Ranking is empty :(</Typography>
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

export default LeaderboardModal;
