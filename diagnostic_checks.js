const fs = require('fs');
const path = require('path');
const diagnosticChecks = require('diagnostic-checks');

require('dotenv').config();

// Function to run diagnostic checks on a file
async function runDiagnosticChecks(filePath) {
  console.log(`Running diagnostic checks on ${filePath}`);

  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Run diagnostic checks using the diagnostic checks library
  const diagnosticResults = diagnosticChecks.check(fileContent);
  if (diagnosticResults.length > 0) {
    console.log(`Diagnostic checks found issues in ${filePath}:`);
    diagnosticResults.forEach((result) => {
      console.log(`  ${result}`);
    });
  } else {
    console.log(`No diagnostic issues found in ${filePath}`);
  }
}

// Watch for file changes
const watcher = chokidar.watch('.', {
  ignored: path => path.includes('/.') || path.includes('\\.'), // ignore dotfiles
  persistent: true
});

watcher
  .on('add', path => runDiagnosticChecks(path))
  .on('change', path => runDiagnosticChecks(path));

console.log('Diagnostic Checks is running. Watching for file changes...');