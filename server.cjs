require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const { v4: uuidv4 } = require('uuid');
var SimpleCrypto = require("simple-crypto-js").default

// Store the OpenAI objects in a Map
const openAIs = new Map();
const secret_key = process.env.VITE_SECRET_KEY;

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// Models: gpt-4-turbo-2024-04-09, gpt-4-1106-preview, gpt-3.5-turbo-0125

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/register", (req, res) => {
  const { apiKey } = req.body;
  const id = uuidv4(); // Generate a unique ID
  const decryptedApiKey = new SimpleCrypto(secret_key).decrypt(apiKey);

  // Create a new OpenAI object and store it in the Map
  openAIs.set(id, new OpenAI({ decryptedApiKey }));

  // Return the ID to the user
  res.send({ id });
});

app.post("/process", async (req, res) => {
  const { id, prompt, model } = req.body;
  const openai = openAIs.get(id); // Get the OpenAI object for the user

  console.log("API request /process");
  const response = await openai.chat.completions.create({
    model: model,
    messages: [{"role": "system", "content": "You are an expert in organizing and clarifying information."},
        {"role": "user", "content": prompt}],
  });

  res.send(response);
});

app.get("/models", async (req, res) => {
  const openai = openAIs.get(req.query.id); // Get the OpenAI object for the user

  console.log("API request /models");
  const response = await openai.models.list();

  res.send(response);
});


app.post("/generate", async (req, res) => {
  const { id, prompt, model } = req.body;
  const openai = openAIs.get(id); // Get the OpenAI object for the user

  console.log("API request /generate");
  const response = await openai.chat.completions.create({
    model: model,
    messages: [{"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}],
  });

  res.send(response);
})

// app.post("/research", async (req, res) => {
//   const { id, prompt, model } = req.body;
//   const openai = openAIs.get(id); // Get the OpenAI object for the user

//   console.log("API request /research");
//   const response = await openai.chat.completions.create({
//     model: model,
//     messages: [{"role": "system", "content": "You are an expert researcher skilled at discovering and sharing knowledge."},
//         {"role": "user", "content": prompt}],
//   });

//   res.send(response);
// });

app.post("/research", async (req, res) => {
  const { id, prompt, model } = req.body;
  const openai = openAIs.get(id); // Get the OpenAI object for the user
  const results = [];

  console.log("API request /research");
  const data = await openai.chat.completions.create({
    model: model,
    response_format: { "type": "json_object" },
    messages: [{"role": "system", "content": "You are an expert research assistant. "},
        {"role": "user", "content": "Find all of the topics in the content and the facts that pertain to those topics and return a JSON object with a field labeled 'subject' containing the subject of the content and another field labeled 'topics' that is a list of topics in the form of an object with a field labeled 'topic' that contain each topic found in the content and a field labeled 'facts' that is a list of facts for each topic. content: " + prompt}],
  });

  const topic_data = JSON.parse(data.choices[0].message.content);
  console.log("Topic_data: ", JSON.stringify(topic_data));

  for (const element of topic_data.topics) {
    console.log("Processing element: ", element.topic,": ", element.facts.toString());
    const temp_data = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          "role": "system",
          "content": "You are an expert research assistant."
        },
        {
          "role": "user",
          "content": `Write a section of an article about ${element.topic} as it pertains to the subject ${topic_data.subject}. make sure to include these facts: ${element.facts.toString()}. do not include a conclusion.`
        }
      ],
    });
    results.push(temp_data.choices[0].message.content);
  }

  res.send(results.join('\n \n'));
});

const PORT = 8020;

app.listen(PORT, () => {
  console.log('Server is running on port: ', PORT);
});