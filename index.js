require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3880;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fixed Gemini API Endpoint
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) {
      return res.status(400).json({ reply: "Please ask about Revolt electric bikes" });
    }

    console.log("Processing query:", userMessage);

    // Updated API URL (v1beta → v1)
    const response = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    contents: [{
      parts: [{
        text: `As Revolt's official assistant, answer in 1 sentence: ${userMessage}`
      }]
    }]
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 3000
  }
);



    // Safer response extraction
    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text 
                || "I couldn't generate a response. Please try again.";

    res.json({ reply });

  } catch (error) {
    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    res.status(500).json({ 
      reply: "Our systems are busy. Please try again later.",
      technical: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});