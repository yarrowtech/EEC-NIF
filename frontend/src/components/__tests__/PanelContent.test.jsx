import React from 'react';
import { render, screen } from '@testing-library/react';
import PanelContent from '../PanelContent';

describe('PanelContent', () => {
  const renderActive = (active) => render(<PanelContent active={active} />);

  test('renders attendance content when active is Attendance', () => {
    renderActive('Attendance');
    expect(screen.getByText(/Attendance details/)).toBeInTheDocument();
  });

  test('renders routine content when active is Routine', () => {
    renderActive('Routine');
    expect(screen.getByText(/Class routine/)).toBeInTheDocument();
  });

  test('renders assignments content when active is Assignments', () => {
    renderActive('Assignments');
    expect(screen.getByText(/Assignment list/)).toBeInTheDocument();
  });

  test('shows default message when active section is unknown', () => {
    renderActive('Unknown');
    expect(screen.getByText(/Select a section/)).toBeInTheDocument();
  });
});
