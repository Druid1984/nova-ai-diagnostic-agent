const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/webhook', (req, res) => {
  const { command } = req.body;
  
  if (command) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(400).json({ error: stderr });
      }
      console.log(`stdout: ${stdout}`);
      res.json({ output: stdout });
    });
  } else {
    res.status(400).json({ error: 'No command provided' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});