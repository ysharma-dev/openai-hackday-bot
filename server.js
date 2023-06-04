const express = require('express');
const { analyzeMessage } = require('./analyzeMessage');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware for parsing JSON data
app.use(bodyParser.json());

// Middleware for enabling CORS
app.use(cors());

// Endpoint to handle the get-response request
app.post('/analyze-message', async (req, res) => {
    console.log(req.body);
    const message = req.body.message;
    
    // Perform analysis on the message and generate a response
    const response = await analyzeMessage(message);
    
    // Send the response back to the client
    res.json({ response });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});