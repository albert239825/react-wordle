import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertProvider } from 'context/AlertContext';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

describe('reduced motion setting', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-reduced-motion');
  });

  test('persists to localStorage and is read back on mount', () => {
    const renderApp = () =>
      render(
        <AlertProvider>
          <App />
        </AlertProvider>
      );
    const { unmount } = renderApp();
    expect(document.body).not.toHaveAttribute('data-reduced-motion');

    const headerButtons = within(screen.getByRole('banner')).getAllByRole(
      'button'
    );
    userEvent.click(headerButtons[headerButtons.length - 1]);
    userEvent.click(screen.getByRole('checkbox', { name: 'Reduced Motion' }));

    expect(localStorage.getItem('reduced-motion')).toBe('true');
    expect(document.body).toHaveAttribute('data-reduced-motion');

    unmount();
    document.body.removeAttribute('data-reduced-motion');
    renderApp();
    expect(document.body).toHaveAttribute('data-reduced-motion');
  });
});
