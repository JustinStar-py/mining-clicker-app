import logo from './logo.svg';
import CoinApp from './components/CoinApp'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './App.css';

const theme = createTheme();

function App() {
  const showAlert = () => {
    alert('Hello world');
  }

  return (
    <div className="App">
       <ThemeProvider theme={theme}>
          <CoinApp />
       </ThemeProvider>
    </div>
  );
}

export default App;
