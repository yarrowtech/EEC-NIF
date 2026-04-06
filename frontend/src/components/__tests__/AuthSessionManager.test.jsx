import React from 'react';
import { render, act } from '@testing-library/react';
import AuthSessionManager from '../AuthSessionManager';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockLogout = jest.fn();
const mockGetTokenExpiryMs = jest.fn();

jest.mock('../../utils/authSession', () => ({
  AUTH_NOTICE: { EXPIRED: 'EXPIRED' },
  logoutAndRedirect: (...args) => mockLogout(...args),
  getTokenExpiryMs: (...args) => mockGetTokenExpiryMs(...args),
}));

describe('AuthSessionManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('invokes logout when token is expired', () => {
    localStorage.setItem('token', 'expired-token');
    mockGetTokenExpiryMs.mockReturnValue(Date.now() - 1000);

    render(<AuthSessionManager />);

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(mockLogout).toHaveBeenCalledWith(
      expect.objectContaining({
        navigate: mockNavigate,
        notice: 'EXPIRED',
        clearAllLocalStorage: true,
      })
    );
  });

  test('does nothing when no token is present', () => {
    mockGetTokenExpiryMs.mockReturnValue(undefined);

    render(<AuthSessionManager />);
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockLogout).not.toHaveBeenCalled();
  });
});
