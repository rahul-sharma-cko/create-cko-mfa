import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeDefaultProvider } from '@cko/primitives';
import App from './App';

jest.mock('@cko/dashboard-shared', () => {
  const actual = jest.requireActual('@cko/dashboard-shared');

  return {
    ...actual,
    useUserManager: jest.fn().mockReturnValue({
      setMerchant: jest.fn(),
      merchant: { name: 'Netflix' },
      accounts: [],
    }),
  };
});

function setup(route = '/') {
  window.history.pushState({}, 'Test page', route);

  return render(
    <ThemeDefaultProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeDefaultProvider>,
  );
}

describe('App', () => {
  it('will render a boiler plate app', () => {
    setup();

    expect(screen.getByText('Micro Frontend Boilerplate - Netflix')).toBeInTheDocument();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();

    expect(screen.getByText('Hello World!')).toBeInTheDocument();
  });
});
