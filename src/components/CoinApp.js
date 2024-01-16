import React, { useState } from 'react';
import { Box, Button, Modal, Typography, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { keyframes } from '@emotion/react';

const isDesktop = window.innerWidth > 1000;
const theme = createTheme();

// Styled components for the gold buttons
const GoldButton = styled(Button)({
  backgroundColor: 'gold',
  borderRadius: 15,
  margin: '0 10px',
  width: `${isDesktop ? '20vw' : '45vw'}`,
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: 'goldenrod',
  },
});

const CoinLogo = styled(Box)({
    width: '40vw',
    [theme.breakpoints.down('md')]: {
        width: '90vw',
    }
});

// keyframes for animation
const expand = keyframes`
   from, to { width: ${isDesktop ? '40vw' : '90vw'}; }
   50% { width: ${isDesktop ? '35vw' : '84vw'}; }
`;

export default function CoinApp() {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [animation, setAnimation] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle the change of the address input
  const handleAddressChange = (event) => setAddress(event.target.value);

  const handleCoinClick = () => {
    // Set animation
    setAnimation(`${expand} 0.1s ease`);
    
    // Remove animation to be able to trigger it again on next click
    setTimeout(() => {
      setAnimation('');
    }, 1000); // This should match the duration of your animation
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
      {/* Coin Balance */}
      <Typography variant="h5" component="p" sx={{ mt: 4 }}>
        Your Balance: 123 SHIB
      </Typography>

      {/* Coin Logo */}
      <CoinLogo
        component="img"
        src="https://cdn3d.iconscout.com/3d/premium/thumb/shiba-inu-4984835-4159433.png"
        alt="Coin Logo"
        onClick={handleCoinClick}
        sx={{
            animation: animation,
            "&:hover": {
              cursor: 'pointer',
            }
          }}
      />

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