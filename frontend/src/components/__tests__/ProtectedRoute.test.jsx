import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';

const mockNavigateComponent = jest.fn(({ to }) => {
  return React.createElement('div', { 'data-testid': 'navigate', 'data-path': to });
});

jest.mock('react-router-dom', () => ({
  Navigate: (props) => mockNavigateComponent(props),
}));

const mockClearAuthData = jest.fn();
const mockGetTokenExpiryMs = jest.fn();

jest.mock('../../utils/authSession', () => ({
  AUTH_NOTICE: { EXPIRED: 'EXPIRED' },
  clearAuthData: (...args) => mockClearAuthData(...args),
  getTokenExpiryMs: (...args) => mockGetTokenExpiryMs(...args),
}));

const renderRoute = (props) =>
  render(
    <ProtectedRoute {...props}>
      <div data-testid="protected-content">Secret</div>
    </ProtectedRoute>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('redirects to login when token is missing', () => {
    renderRoute({ allowedRoles: ['Student'] });

    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(mockNavigateComponent).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/', replace: true })
    );
  });

  test('clears auth data when token is expired', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('userType', 'Student');
    mockGetTokenExpiryMs.mockReturnValue(Date.now() - 1000);

    renderRoute({ allowedRoles: ['Student'] });

    expect(mockClearAuthData).toHaveBeenCalled();
    expect(mockNavigateComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/',
        replace: true,
        state: expect.objectContaining({ authNotice: 'EXPIRED' }),
      })
    );
  });

  test('renders children when role and token are valid', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('userType', 'Teacher');
    mockGetTokenExpiryMs.mockReturnValue(Date.now() + 10000);

    renderRoute({ allowedRoles: ['Teacher'] });

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockNavigateComponent).not.toHaveBeenCalled();
  });
});
