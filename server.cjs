require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Models: gpt-4-turbo-2024-04-09, gpt-4-1106-preview, gpt-3.5-turbo-0125

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/process", async (req, res) => {
  const { prompt } = req.body;
  console.log("API request /process");
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [{"role": "system", "content": "You are an expert in organizing and clarifying information."},
        {"role": "user", "content": prompt}],
  });

  res.send(response);
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  console.log("API request /generate");
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [{"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}],
  });

  res.send(response);
})

app.post("/research", async (req, res) => {
  const { prompt } = req.body;
  console.log("API request /research");
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-2024-04-09",
    messages: [{"role": "system", "content": "You are an expert researcher skilled at discovering and sharing knowledge."},
        {"role": "user", "content": prompt}],
  });

  res.send(response);
});

const PORT = 8020;

app.listen(PORT, () => {
  console.log('Server is running on port: ', PORT);
});