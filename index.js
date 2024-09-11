#!/usr/bin/env node

const { program } = require('commander');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runDiagnostics(filePath, eventType) {
  console.log(`File ${filePath} has been ${eventType}`);

  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Run appropriate command based on file type
  let command = '';
  if (path.extname(filePath) === '.js') {
    command = 'node ' + filePath;
  } else if (path.extname(filePath) === '.ts') {
    command = 'ts-node ' + filePath;
  }

  if (command) {
    exec(command, async (error, stdout, stderr) => {
      let diagnosticResult = '';
      if (error) {
        console.error(`Error: ${error.message}`);
        diagnosticResult = `Error: ${error.message}\n${stderr}`;
      } else if (stderr) {
        console.error(`stderr: ${stderr}`);
        diagnosticResult = `Warning: ${stderr}`;
      } else {
        console.log(`stdout: ${stdout}`);
        diagnosticResult = `Output: ${stdout}`;
      }

      try {
        // Use OpenAI to analyze the code and diagnostic result
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are an AI assistant that analyzes code and provides diagnostic information." },
            { role: "user", content: `Analyze this code and its execution result. Provide insights and suggestions for improvement:\n\nCode:\n${fileContent}\n\nExecution Result:\n${diagnosticResult}` }
          ],
        });
        
        console.log("AI Analysis:", response.choices[0].message.content);
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
      }
    });
  }
}

function watchDirectory(directory) {
  const watcher = chokidar.watch(directory, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  watcher
    .on('add', path => runDiagnostics(path, 'added'))
    .on('change', path => runDiagnostics(path, 'changed'));

  console.log(`AI Diagnostic Agent is running. Watching for file changes in ${directory}...`);
}

program
  .version('1.0.0')
  .description('AI Diagnostic Agent CLI')
  .option('-w, --watch <directory>', 'Watch a directory for file changes', '.')
  .option('-f, --file <file>', 'Run diagnostics on a specific file')
  .parse(process.argv);

const options = program.opts();

if (options.file) {
  runDiagnostics(options.file, 'analyzed');
} else {
  watchDirectory(options.watch);
}