import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { marketplaceTheme } from './theme/theme';
import { WizardProvider } from './state/WizardContext';
import { App } from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={marketplaceTheme}>
      <WizardProvider>
        <App />
      </WizardProvider>
    </FluentProvider>
  </React.StrictMode>
);
