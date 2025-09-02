# Team TypeTalk Capstone Project 2025
## Sponsored by Motiv

This SDK provides developers with an easy-to-use tool to integrate voice and text automation in their projects. 
Developers can select any AI model they would like to use for text automation and the SDK uses RealTime API for audio
automation.

## Documentation
For detailed documentation, tutorials, and examples, please visit https://motivstudio.bitbucket.io/

## How to Use

1. Download the SDK from npm using the command `npm install typetalk-speakeasy`
2. Import the package using the command
```
import { TextControl, VoiceControl } from "typetalk-speakeasy";
```
3. Initialize APICalls with your OpenAI API Key and initialize RealTime.
```
const textControl = new textControl({apiKey: <Your API key>, dangerouslyAllowBrowser: true});
const voiceControl = new VoiceControl();
```
4. Create the backend server if you would like to use audio. The server may look as follows:
``` 
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 5001;

const OPENAI_API_KEY = <Your API key>;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment variables");
  process.exit(1);
}

app.use(cors({
  origin: "http://localhost:<Your application port>",
  methods: "GET,POST",
  allowedHeaders: "Content-Type,Authorization",
}));

/**
 * Root route for checking server status.
 * @route GET /
 * @returns {string} Server running message.
 */
app.get("/", (req, res) => {
  res.send("Server is running.");
});

/**
 * Endpoint to fetch an ephemeral API key for real-time OpenAI sessions.
 * @route GET /session
 * @returns {object} The OpenAI API session data.
 */
app.get("/session", async (req, res) => {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "verse",
      }),
    });


    if (!r.ok) {
      throw new Error(`OpenAI API Error: ${r.statusText}`);
    }

    const data = await r.json();
    res.send(data);
});

/**
 * Server-Sent Events (SSE) endpoint for streaming responses.
 * @route GET /events
 * @returns {EventStream} Simulated streaming data.
 */
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Simulated streaming response (replace with OpenAI logic)
  res.write("data: { \"message\": \"Streaming started...\" }\n\n");

  setTimeout(() => {
    res.write("data: { \"message\": \"Processing audio input...\" }\n\n");
  }, 3000);

  setTimeout(() => {
    res.write("data: { \"message\": \"Task completed.\" }\n\n");
    res.end();
  }, 6000);
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```
5. Begin using the SDK

## License
Copyright 2025 SpeakEasy Capstone Team

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted,
provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED “AS IS” AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL 
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, 
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN 
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF 
THIS SOFTWARE.

## Contact
For any questions or support, please contact us at typetalkcapstone@gmail.com.

