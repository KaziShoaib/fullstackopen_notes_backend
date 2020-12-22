//jest test files should have .test in their name
//tests the palindrome function from ../utils/for_testing

const palindrome = require('../utils/for_testing').palindrome;

describe('palindrome', () => {

  test('palindrome of a', () => {
    const result = palindrome('a');
    expect(result).toBe('a');
  });

  test('palidrome of react', () => {
    const result = palindrome('react');
    expect(result).toBe('tcaer');
  });

  test('palidrmoe of releveler', () => {
    const result = palindrome('releveler');
    expect(result).toBe('releveler');
  });

});



