import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Example component for testing
function Button({ children, onClick }) {
  return (
    <button onClick={onClick} data-testid="test-button">
      {children}
    </button>
  );
}

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByTestId('test-button');
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
