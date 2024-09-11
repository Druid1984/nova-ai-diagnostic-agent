const fs = require('fs');
const path = require('path');
const debuggingTests = require('debugging-tests');

require('dotenv').config();

// Function to run debugging tests on a file
async function runDebuggingTests(filePath) {
  console.log(`Running debugging tests on ${filePath}`);

  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Run debugging tests using the debugging tests library
  const debuggingResults = debuggingTests.run(fileContent);
  if (debuggingResults.length > 0) {
    console.log(`Debugging tests found issues in ${filePath}:`);
    debuggingResults.forEach((result) => {
      console.log(`  ${result}`);
    });
  } else {
    console.log(`No debugging issues found in ${filePath}`);
  }
}

// Watch for file changes
const watcher = chokidar.watch('.', {
  ignored: path => path.includes('/.') || path.includes('\\.'), // ignore dotfiles
  persistent: true
});

watcher
  .on('add', path => runDebuggingTests(path))
  .on('change', path => runDebuggingTests(path));

console.log('Debugging Tests is running. Watching for file changes...');