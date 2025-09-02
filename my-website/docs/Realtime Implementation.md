# Real-Time Voice Processing SDK (VoiceControl)

This SDK enables real-time voice interaction with your app using OpenAI's Realtime API and WebRTC.

It consists of three main components:

1. Express Server (server.ts) – Hosts API and manages the OpenAI session.

2. WebRTC Integration (VoiceControl.ts) – Captures mic input, streams audio, and executes functions dynamically.

3. Your Frontend App(for example. App.jsx) - Registers app functions and handles UI updates based on voice events.

---

## Key Functions of VoiceControl.ts

| Function                | Description                                                       |
|-------------------------| ----------------------------------------------------------------- |
| `setupPeerConnection()` | Initializes WebRTC, sends audio to OpenAI, and listens for transcription & functions. |
| `addFunction()`         | Adds a function and its metadata to the SDK.            |
| `handleFunctionCall(event)`      | Executes the function requested by OpenAI.                                  |
| `registerTranscriptionHandler()` | Attaches a live handler to real-time transcriptions.                        |
| `handleTranscription(text)`     | Logs or handles spoken input from the user.                                 |
| `stopRecording()`                | Stops the microphone and tears down the connection.                         |

---

### WebRTC Data Flow

```
User Speaks → Audio Captured → WebRTC Sends to OpenAI → OpenAI Transcribes → Function Executes
```
---

## Frontend 

### Role of Your Frontend App

- Registers available functions so OpenAI can call them.
- Sends voice commands to OpenAI via WebRTC.
- Updates the UI based on real-time responses.

### How It Works

1. **Register Functions** → The frontend registers app-specific functions (`addTask`, `deleteTask`, etc.).
2. **Start WebRTC Connection** → Calls `setupPeerConnection()` when the mic is activated.
3. **Handle Responses**:
  - When OpenAI sends a **function call**, the app executes it.
  - If OpenAI sends a **transcription**, the UI can display it.

### Key Functions in React

| Function                           | Description                                            |
| ---------------------------------- | ------------------------------------------------------ |
| `voiceControl.setupPeerConnection()` | Establishes the WebRTC session.                        |
| `voiceControl.addFunction()`         | Registers UI actions for OpenAI to use.                |
| `voiceControl.registerTranscriptionHandler()` | Receives and processes transcribed text.    |



### Full Workflow

1. **User clicks "Start Recording"** → `setupPeerConnection()` initializes WebRTC.
2. **User speaks** → Audio is streamed to OpenAI.
3. **OpenAI transcribes & detects intent**:
4. **Frontend executes the function** (e.g., marking a task complete).
5. **UI updates in real time**.

---

## How to Use

### 1. Start the Server

```bash
npm run build
node server.js
```

### 2. Start the React Frontend

```bash
npm run dev
```

### 3. Register Functions

In `your frontend app`, register functions that OpenAI should recognize:

```javascript
voiceControl.addFunction(addTaskFunctionData, addTask);
voiceControl.addFunction(deleteCustomerFunctionData, deleteCustomerByName);
```

### 4. Start Recording

Click **"Start Recording"** to enable voiceControl.setupPeerConnection().

---

## Example Use Cases

| Command                      | Expected Outcome                          |
| ---------------------------- | ----------------------------------------- |
| "Add a task called 'Buy milk'" | `addTask("Buy milk")` is executed.        |
| "Mark 'Eat' as complete"     | `toggleTaskCompletedByName("Eat")` is called. |
| "Delete 'Sleep' task"        | `deleteTaskByName("Sleep")` removes it from the UI. |

---

