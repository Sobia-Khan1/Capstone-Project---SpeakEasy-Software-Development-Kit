---
sidebar_position: 3
---

# Tutorial for Non-JavaScript Applications

-------
This tutorial covers how to integrate **typetalk-speakeasy** SDK into an existing open source Non-JavaScript or 
TypeScript application. This tutorial can also be used for application written in JavaScript and TypeScript but 
the SDK provides additional built-in functionality for these apps. The application used in this tutorial is written in 
Python and can be found [here](https://github.com/deepankarvarma/To-Do-List-Using-Python). The app was modified to make 
each functionality its own function.

## Table of Contents
[Prerequisites](#prerequisites) \
[Part 1: Creating the Function Descriptions](#part-1-creating-the-function-descriptions) \
[Part 2: Creating the node.js backend](#part-2-creating-the-nodejs-backend) \
[Part 3: Integrating the backend](#part-3-integrating-the-backend)

## Prerequisites

You will need the following before beginning the tutorial:

- OpenAI API Key
- Application you would like to use SDK with

## Note

Integration of audio with a non-JavaScript App is not currently possible. There are workarounds that can be used to 
integrate audio such as using Whisper for transcription.

## Part 1: Creating the Function Descriptions
Follow Part 1 of [tutorial_for_javascript_app](./tutorial_for_javascript_app). 
Change the file extension from functionData.ts to functionData.js. Ensure that the correct function and argument names are 
used in your functionData.js file. The functionData.js file may look like
```
export const addTaskFunctionData = {
    type: "function",
    function: {
        name: "add_task",
        description: "Adds a new task to the to-do list.",
        parameters: {
            type: "object",
            properties: {
                task: {
                    type: "string",
                    description: "The name of the task to add.",
                    examples: [
                        "Buy Groceries",
                        "Do Laundry"
                    ],
                },
            },
            required: ["task"],
            additionalProperties: false,
        },
    return: {
        type: "void",
        description: "The function does not return any value.",
    },
    usageExamples: [
        {
            command: "Add a task to do Laundry",
            trigger: "add_task('Do Laundry')",
            description: "Triggering this function with the task name 'Do Laundry' will add a new task to my to-do list"
        }
    ]
    },
};
```

## Part 2: Creating the node.js backend
Since the SDK is written in typescript, you will need to create a node.js backend for your application. 
1. Create a file called server.js. This file will contain all the code for accessing the SDK. It will receive input from 
your app and return the proper information back to your app
2. Run `npm install express typetalk-speakeasy`. This will install the express framework and the typetalk-speakeasy SDK
3. Import the packages installed in step 2 as well as the functionData.ts file created in part 1. Your server.js file 
will now look like this: 
```
import express from 'express'
import { TextControl } from "typetalk-speakeasy"
import {addTaskFunctionData} from "./functionData.js"
```
4. Create a new textControl object and pass in your openai api key as an argument
```
const textControl = new TextControl({apiKey: <Your Api Key>, dangerouslyAllowBrowser: true})
```
5. Use the `addFunction` method to add the functions you defined in functionData.ts. The second argument for 
`addFunction` would contain the name of the typescript function but since there are no typescript functions we will fill
the second argument with an empty anonymous function
```
textControl.addFunction(addTaskFunctionData, () => {})
```
6. Set up the express app using the following: 
```
const app = express();
const port = 8080;
// Middleware to parse JSON bodies
app.use(express.json());
app.post('/', async (req, res) => {
  const message = req.body.message;
  console.log('Received message:', message);
  const functionCalled = await textControl.getFunctionCallName(message);
  console.dir(functionCalled, {depth: null})
  res.send({message: functionCalled}); 
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```
The `getFunctionCallName` method returns the name and arguments of the function that should be called based on
the input command by the user. You can then process these to determine the function to call. This will be done in the 
next part.

## Part 3: Integrating the backend
The python app used in this tutorial was modified to separate each function of the app into its own function. The app.py
file looks like this: 
```
import streamlit as st
import json
import requests

# Initialize the task list in session_state if it doesn't exist.
if 'task_list' not in st.session_state:
    st.session_state.task_list = []

def display_tasks():
    """Display the current tasks using session_state."""
    # Instead of using a container that you empty repeatedly,
    # simply render the current list.
    if not st.session_state.task_list:
        st.write("No tasks added yet.")
    else:
        st.write("### Current Tasks:")
        for i, task in enumerate(st.session_state.task_list, start=1):
            st.write(f"{i}. {task}")

def add_task(task):
    """Add a task to the session_state list."""
    if task:
        st.session_state.task_list.append(task)
        st.success(f"Task '{task}' added.")

def clear_tasks():
    """Clear the task list in session_state."""
    st.session_state.task_list = []
    st.info("All tasks cleared.")

def main():
    st.title("To-Do List")
    st.markdown(
        """
        <style>
        .stApp {
            background-attachment: fixed;
            background-size: cover;
        }
        </style>
        """,
        unsafe_allow_html=True
    )
    
    # --- Section: Add task manually ---
    st.subheader("Add a New Task Manually")
    task_input = st.text_input("Task Name:", key="manual_task")
    if st.button("Add Task"):
        if task_input.strip():
            add_task(task_input.strip())
        else:
            st.warning("Please enter a non-empty task name.")
    
    if st.button("Clear All Tasks"):
        clear_tasks()
    
    # Display the tasks only once at the end.
    display_tasks()

if __name__ == "__main__":
    main()
```

1. Create an input space for a user to send text input in main. It may look like the following: 
``` 
st.write("---")
    # --- Section: Send Request to Node.js Server ---
    st.subheader("Use ChatGPT to add Tasks")
    message = st.text_input("Enter your message for the server:", key="node_msg")
```
2. The user input needs to be sent to the node.js backend so it can be processed. Create a function called `send_response`.
This will send the input message from `http://localhost:8080` to the backend which will be listening too.
```
def send_request(message):
    """Send an HTTP POST request to the Node.js server."""
    url = "http://localhost:8080"
    payload = {"message": message}
    try:
        response = requests.post(url, json=payload)
        return response
    except requests.exceptions.RequestException as e:
        st.error(f"An error occurred: {e}")
        return None
```

3. The returned response from the backend needs to be processed. Create a new function called `process_response` which
will take the response returned from the backend and decide which function should be called and pass in the arguments.
The response returned from the backend will have the following format: 
```
"""
    Process the response from the Node.js server.
    Expected server responses:
      - Function call:
          {
            "message": [
              {
                "id": "...",
                "type": "function",
                "function": {
                  "name": "add_task",
                  "arguments": "{\"task\":\"Eat food Friday\"}"
                }
              }
            ]
          }
      - Plain text:
          {
            "message": "Hello! How can I assist you today?"
          }
    """
```

This function will parse the response to call the proper functions.
```
def process_response(response):
    if response is None:
        return
    try:
        data = response.json()
    except json.JSONDecodeError:
        st.error(f"Invalid JSON received from server. {response}")
        return
    message_content = data.get("message")
    if isinstance(message_content, list):
        st.info("Processing function calls from the server...")
        for call in message_content:
            func_details = call.get("function", {})
            if func_details.get("name") == "add_task":
                args_str = func_details.get("arguments")
                try:
                    args = json.loads(args_str)
                    task_name = args.get("task", "").strip()
                    if task_name:
                        add_task(task_name)
                        st.success(f"Task '{task_name}' added via function call.")
                    else:
                        st.warning("Task name is empty in function arguments.")
                except json.JSONDecodeError:
                    st.error("Failed to decode function arguments.")
            else:
                st.info(f"Ignoring function call for: {func_details.get('name')}")
    elif isinstance(message_content, str):
        st.write("Response from server:", message_content)
    else:
        st.warning("Unknown response format received from server.")

```
4. Add the lines to call the send_request function with the user input and process_response function with response
returned from send_request.
```
 if st.button("Send Request"):
    if message.strip():
        response = send_request(message.strip())
        process_response(response)
    else:
        st.warning("Please enter a message before sending.")
```

5. Your python app can now process text input. Run the app to test it. You can use the following commands for the test
app.
```
node server.js
streamlit run app.py
```
![Animation of Python To Do List App](img/PythonToDoAppAnimation.gif)
