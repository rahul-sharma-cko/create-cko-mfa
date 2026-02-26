import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

jest.mock('@cko/primitives', () => ({
  TextHeadingOne: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

function setup() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

describe('App', () => {
  it('renders the boilerplate heading', () => {
    setup();

    expect(screen.getByText('MFE Boilerplate')).toBeInTheDocument();
  });
});
