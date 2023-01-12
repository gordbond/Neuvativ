import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './fonts/Mulish-Bold.ttf';
import './fonts/OpenSans-Regular.ttf';
import './fonts/OpenSans-SemiBold.ttf';
import { ThemeProvider, Theme, useTheme} from '@aws-amplify/ui-react';



const theme = {
    
    name: 'Auth Example Theme',
    tokens: {
      colors: {
        font: {
          interactive: {
            value: '#0088ff',
          },
        },
      },
      components: {
        tabs: {
          item: {
            _focus: {
              color: {
                value: '#0088ff',
              },
            },
            _hover: {
              color: {
                value: '#0088ff',
              },
            },
            _active: {
              color: {
                value: '#0088ff',
              },
            },
          },
        },
        button: {
            primary: {
                backgroundColor: { value: '#0088ff' },
            }
        },
      },
    },
  };

const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
root.render(
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
