const fs = require('fs');
const path = require('path');
const vulnerabilityScanner = require('vulnerability-scanner');

require('dotenv').config();

// Function to check for security vulnerabilities in a file
async function checkSecurityVulnerabilities(filePath) {
  console.log(`Checking security vulnerabilities in ${filePath}`);

  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Check for security vulnerabilities using the vulnerability scanner library
  const vulnerabilities = vulnerabilityScanner.scan(fileContent);
  if (vulnerabilities.length > 0) {
    console.log(`Security vulnerabilities found in ${filePath}:`);
    vulnerabilities.forEach((vulnerability) => {
      console.log(`  ${vulnerability}`);
    });
  } else {
    console.log(`No security vulnerabilities found in ${filePath}`);
  }
}

// Watch for file changes
const watcher = chokidar.watch('.', {
  ignored: path => path.includes('/.') || path.includes('\\.'), // ignore dotfiles
  persistent: true
});

watcher
  .on('add', path => checkSecurityVulnerabilities(path))
  .on('change', path => checkSecurityVulnerabilities(path));

console.log('Security Vulnerability Scanner is running. Watching for file changes...');