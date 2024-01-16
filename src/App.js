import logo from './logo.svg';
import CoinApp from './components/CoinApp'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useEffect } from 'react';
import './App.css';

const theme = createTheme();
const telApp = window.Telegram.WebApp

function App() {
  
  useEffect(() => {
    telApp.ready()
  })
  
  // change background color of telegram mini app

  return (
    <div className="App">
       <ThemeProvider theme={theme}>
          <CoinApp />
       </ThemeProvider>
    </div>
  );
}

export default App;
