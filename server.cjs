const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const db = new sqlite3.Database('./users.db');

app.use(bodyParser.json());
app.use(cors());

// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  openai_key TEXT
)`);

// Signup endpoint
app.post("/signup", async (req, res) => {
  const { username, password, openaiKey } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password, openai_key) VALUES (?, ?, ?)",
    [username, hashedPassword, openaiKey],
    (err) => {
      if (err) {
        return res.status(400).json({ error: "Username already exists" });
      }
      res.status(201).json({ message: "User created successfully" });
    }
  );
});

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ error: "Failed to authenticate token" });
    req.userId = decoded.id;
    next();
  });
};

// Get user endpoint
app.get("/user", verifyToken, (req, res) => {
  db.get("SELECT id, username FROM users WHERE id = ?", [req.userId], (err, user) => {
    if (err) return res.status(500).json({ error: "Error fetching user" });
    res.json(user);
  });
});

// get all available openai models
app.get("/models", verifyToken, async (req, res) => {
  db.get("SELECT openai_key FROM users WHERE id = ?", [req.userId], async (err, user) => {
    if (err || !user) return res.status(500).json({ error: "Error fetching OpenAI key" });

    const openai = new OpenAI({ apiKey: user.openai_key });
    const models = await openai.models.list();
    res.json(models);
  });
});

// generate endpoint. this is a freeform chat endpoint
app.post("/generate", verifyToken, async (req, res) => {
  const { prompt, model } = req.body;

  console.log("req.userId", req.userId);
  db.get("SELECT openai_key FROM USERS WHERE id = ?", [req.userId], async (err, user) => {
    if (err || !user) return res.status(500).json({ error: "Error fetching OpenAI key" });

    const openai = new OpenAI({ apiKey: user.openai_key });

    try {
      console.log("API request /generate");
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          { "role": "system", "content": "You are a helpful assistant." },
          { "role": "user", "content": prompt },
        ],
      });

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Error processing OpenAI request" });
    }
  });
});

// research endpoint. this is a research assistant endpoint
app.post("/research", verifyToken, async (req, res) => {
  const { prompt, model } = req.body;

  console.log("req.userId", req.userId);
  db.get("SELECT openai_key FROM USERS WHERE id = ?", [req.userId], async (err, user) => {
    if (err || !user) return res.status(500).json({ error: "Error fetching OpenAI key" });

    const openai = new OpenAI({ apiKey: user.openai_key });
    const results = [];

    try {
      console.log("API request /research");
      const data = await openai.chat.completions.create({
        model: model,
        response_format: { "type": "json_object" },
        messages: [
          { "role": "system", "content": "You are an expert research assistant." },
          {"role": "user", "content": "Find all of the topics in the content and the facts that pertain to those topics and return a JSON object with a field labeled 'subject' containing the subject of the content and another field labeled 'topics' that is a list of topics in the form of an object with a field labeled 'topic' that contain each topic found in the content and a field labeled 'facts' that is a list of facts for each topic. content: " + prompt},
        ],
      });

      const topic_data = JSON.parse(data.choices[0].message.content);
      console.log("Topic data:", JSON.stringify(topic_data));

      for (const element of topic_data.topics) {
        console.log("Processing element:", element.topic, ", element.facts.toString()");
        const temp_data = await openai.chat.completions.create({
          model: model,
          messages: [
            { "role": "system", "content": "You are an expert research assistant." },
            { "role": "user", "content": `Write a section of an article about ${element.topic} as it pertains to the subject ${topic_data.subject}.` },
          ],
        });
        results.push(temp_data.choices[0].message.content);
      }

      res.send(results.join('\n \n'));
    } catch (error) {
      res.status(500).json({ error: "Error processing OpenAI request" });
    }
  });
});

// process endpoint. this is used to organize the existing content
app.post("/process", verifyToken, async (req, res) => {
  const { prompt, model } = req.body;
  
  db.get("SELECT openai_key FROM users WHERE id = ?", [req.userId], async (err, user) => {
    if (err || !user) return res.status(500).json({ error: "Error fetching OpenAI key" });

    const openai = new OpenAI({ apiKey: user.openai_key });
    
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {"role": "system", "content": "You are an expert in organizing and clarifying information."},
          {"role": "user", "content": prompt}
        ],
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Error processing OpenAI request" });
    }
  });
});

// start the express server
const PORT = process.env.PORT || 8020;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
