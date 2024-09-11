const fs = require('fs');
const path = require('path');
const syntaxErrorDetector = require('syntax-error-detector');

require('dotenv').config();

// Function to check for syntax errors in a file
async function checkSyntaxErrors(filePath) {
  console.log(`Checking syntax errors in ${filePath}`);

  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Check for syntax errors using the syntax error detector library
  const syntaxErrors = syntaxErrorDetector.detect(fileContent);
  if (syntaxErrors.length > 0) {
    console.log(`Syntax errors found in ${filePath}:`);
    syntaxErrors.forEach((error) => {
      console.log(`  ${error}`);
    });
  } else {
    console.log(`No syntax errors found in ${filePath}`);
  }
}

// Watch for file changes
const watcher = chokidar.watch('.', {
  ignored: path => path.includes('/.') || path.includes('\\.'), // ignore dotfiles
  persistent: true
});

watcher
  .on('add', path => checkSyntaxErrors(path))
  .on('change', path => checkSyntaxErrors(path));

console.log('Syntax Error Detector is running. Watching for file changes...');