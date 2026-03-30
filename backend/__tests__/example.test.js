// Example utility function tests
describe('Example Utility Tests', () => {
  test('addition works correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('string concatenation works', () => {
    const greeting = 'Hello' + ' ' + 'World';
    expect(greeting).toBe('Hello World');
  });

  test('array includes element', () => {
    const fruits = ['apple', 'banana', 'orange'];
    expect(fruits).toContain('banana');
  });

  test('object has properties', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    };
    expect(user).toHaveProperty('email');
    expect(user.name).toBe('John Doe');
  });
});
