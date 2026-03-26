import { render, screen } from '@testing-library/react';
import App from './App';

test('renders voice translator heading', () => {
  render(<App />);
  expect(screen.getByText(/voice translator interface/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  expect(screen.getByText(/interface language/i)).toBeInTheDocument();
});
