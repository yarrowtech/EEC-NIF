import React from 'react';
import { act } from 'react';
import { render, screen } from '@testing-library/react';
import PointsBadge from '../PointsBadge';
import { getPoints } from '../../utils/points';

jest.mock('../../utils/points', () => ({
  getPoints: jest.fn(),
}));

describe('PointsBadge', () => {
  beforeEach(() => {
    getPoints.mockReset();
    getPoints.mockReturnValue(150);
  });

  test('renders initial points from the helper', () => {
    render(<PointsBadge className="custom-class" />);

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText(/Points/)).toBeInTheDocument();
    expect(screen.getByText('150').closest('div')).toHaveClass('custom-class');
  });

  test('updates when a points:update event supplies a value', () => {
    render(<PointsBadge />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('points:update', {
          detail: { total: 275 },
        })
      );
    });

    expect(screen.getByText('275')).toBeInTheDocument();
  });

  test('falls back to getPoints when event payload is missing', () => {
    render(<PointsBadge />);
    getPoints.mockReturnValue(320);

    act(() => {
      window.dispatchEvent(new CustomEvent('points:update'));
    });

    expect(screen.getByText('320')).toBeInTheDocument();
  });
});
