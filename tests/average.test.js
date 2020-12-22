//jest test files should have .test in their name
// tests the average function from ../utils/for_testing

const average = require('../utils/for_testing').average;

describe('average', () => {

  test('of one value that is the value itself', () => {
    expect(average([1])).toBe(1);
  });

  test('of many is calculated right', () => {
    expect(average([1, 2, 3, 4, 5, 6])).toBe(3.5);
  });

  test('of many empty array is zero', () => {
    expect(average([])).toBe(0);
  });

});

