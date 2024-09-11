const { OpenAI } = require('openai');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to run diagnostics on a file
async function runDiagnostics(filePath, eventType) {
  console.log(`File ${filePath} has been ${eventType}`);

  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Run appropriate command based on file type
  let command = [];
  if (path.extname(filePath) === '.js') {
    command = ['node', filePath];
  } else if (path.extname(filePath) === '.ts') {
    command = ['ts-node', filePath];
  }
  if (command.length > 0) {
    const executable = command[0];
    const filePath = command[1];
    const child = spawn(executable, [filePath]);
  
    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data.toString()}`);
    });
  
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data.toString()}`);
    });
  
    child.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      diagnosticResult = `Error: ${error.message}`;
    });
  
    child.on('close', (code) => {
      // Handle process exit code if needed
    });
  }

  // Optionally, you can use OpenAI to analyze the file content
  const messages = [{ role: 'user', content: fileContent }];
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
  }
}

// Watch for file changes
const watcher = chokidar.watch('.', {
  ignored: path => path.includes('/.') || path.includes('\\.'), // ignore dotfiles
  persistent: true
});

watcher
  .on('add', path => runDiagnostics(path, 'added'))
  .on('change', path => runDiagnostics(path, 'changed'));

console.log('AI Diagnostic Agent is running. Watching for file changes...');