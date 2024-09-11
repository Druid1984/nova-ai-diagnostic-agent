const fs = require('fs');
const path = require('path');
const testRunner = require('test-runner');

require('dotenv').config();

// Function to run tests on a file
async function runTests(filePath) {
  console.log(`Running tests on ${filePath}`);

  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Run tests using the test runner library
  const testResults = testRunner.run(fileContent);
  if (testResults.length > 0) {
    console.log(`Tests found issues in ${filePath}:`);
    testResults.forEach((result) => {
      console.log(`  ${result}`);
    });
  } else {
    console.log(`No test issues found in ${filePath}`);
  }
}

// Watch for file changes
const watcher = chokidar.watch('.', {
  ignored: path => path.includes('/.') || path.includes('\\.'), // ignore dotfiles
  persistent: true
});

watcher
  .on('add', path => runTests(path))
  .on('change', path => runTests(path));

console.log('Test Runner is running. Watching for file changes...');