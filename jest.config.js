module.exports = {
  testEnvironment:'node',
  setupFilesAfterEnv: ['./jest.setup.js']
};
/*
the jest.setup.js file increases the timeoutfor all tests
*/

/* alternatively we can also write
{
 //...
 "jest": {
   "testEnvironment": "node"
 }
}
at the end of the package.json file
the we won't have to create this seperate jest.config.js file
*/