import { GoogleGenerativeAI } from "@google/generative-ai";

const aiModelName = process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash";

const createModel = () => {
  if (!process.env.GOOGLE_AI_KEY) {
    const error = new Error("GOOGLE_AI_KEY is not configured");
    error.code = "AI_CONFIG_MISSING";
    throw error;
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

  return genAI.getGenerativeModel({
    model: aiModelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
    systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.
    
    Examples: 

    <example>
 
        response: {

            "text": "this is you fileTree structure of the express server",
            "fileTree": {
                "app.js": {

                    file: {
                        contents: 
                            "
                        
                                const express = require('express');

                                const app = express();

                                app.get('/', (req, res) => {
                                    res.send('Hello World!');
                                });

                                app.listen(3000, () => {
                                    console.log('Server is running on port 3000');
                                })
                            "
                    }
                },
            },

            "package.json": {
                file: {
                    contents: "
                        {
                            "name": "temp-server",
                            "version": "1.0.0",
                            "main": "index.js",
                            "scripts": {
                                "test": "echo \"Error: no test specified\" && exit 1"
                            },
                            "keywords": [],
                            "author": "",
                            "license": "ISC",
                            "description": "",
                            "dependencies": {
                                "express": "^4.21.2"
                            }
                        }
                    "
                },
            },

            "buildCommand": {
                mainItem: "npm",
                    commands: [ "install" ]
            },

            "startCommand": {
                mainItem: "node",
                    commands: [ "app.js" ]
            }
        }

        user:Create an express application 
   
    </example>
    
    <example>

       user:Hello 
       response:{
       "text":"Hello, How can I help you today?"
       }
       
    </example>
    
    IMPORTANT : don't use file name like routes/index.js

    FILE TREE CONTRACT:
    - Return one valid JSON object only. Do not wrap it in markdown.
    - Every generated file must be inside the "fileTree" object, including package.json.
    - Do not put file nodes beside "fileTree".
    - Every fileTree entry must be either { "file": { "contents": "..." } } or { "directory": { ... } }.
    - Never return null or undefined fileTree nodes.
    - package.json contents must be valid JSON text.
 
    `,
  });
};

export const generateResult = async (prompt) => {
  try {
    const model = createModel();
    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    error.aiModel = aiModelName;
    throw error;
  }
};

export const generateResultWithProjectMemory = async ({ prompt, projectMemory, fileTree }) => {
  const fileSummary = fileTree && typeof fileTree === "object"
    ? Object.keys(fileTree).slice(0, 40).join(", ")
    : "No files saved yet";

  return generateResult(`
Project memory:
${projectMemory}

Current file tree summary:
${fileSummary || "No files saved yet"}

User request:
${prompt}
  `);
};

export const generateProjectMemory = async ({ projectName, existingMemory, fileTree }) => {
  const fileSummary = fileTree && typeof fileTree === "object"
    ? Object.keys(fileTree).slice(0, 60).join(", ")
    : "No files saved yet";

  return generateResult(`
Create or refresh the saved project memory for this project.

Project name: ${projectName || "Untitled"}

Existing memory:
${JSON.stringify(existingMemory || {}, null, 2)}

Current file tree summary:
${fileSummary || "No files saved yet"}

Return only valid JSON with this exact shape:
{
  "goal": "short project purpose",
  "stack": "main technologies and services",
  "decisions": ["important architecture or product decisions"],
  "knownIssues": ["bugs, risks, or gaps to remember"],
  "deploymentNotes": ["production, env, hosting, database, socket, or CORS notes"],
  "nextSteps": ["specific useful next steps"]
}
  `);
};

export const generateMemorySuggestion = async ({
  projectName,
  existingMemory,
  fileTree,
  eventType,
  content,
}) => {
  const fileSummary = fileTree && typeof fileTree === "object"
    ? Object.keys(fileTree).slice(0, 60).join(", ")
    : "No files saved yet";

  return generateResult(`
Decide whether this latest project event contains durable information worth saving into project memory.

Only suggest memory when the event captures a lasting goal, stack choice, architecture decision, known issue, deployment note, or concrete next step. Do not suggest generic chat, greetings, temporary wording, or duplicate information already present.

Project name: ${projectName || "Untitled"}

Existing memory:
${JSON.stringify(existingMemory || {}, null, 2)}

Current file tree summary:
${fileSummary || "No files saved yet"}

Latest event type: ${eventType || "message"}
Latest event content:
${content}

Return only valid JSON with this exact shape:
{
  "shouldSuggest": true,
  "reason": "short reason shown to the user",
  "memory": {
    "goal": "optional goal replacement",
    "stack": "optional stack replacement",
    "decisions": ["optional durable decisions"],
    "knownIssues": ["optional bugs, risks, or gaps"],
    "deploymentNotes": ["optional production/env/hosting/db/socket/CORS notes"],
    "nextSteps": ["optional specific next steps"]
  }
}

If nothing should be saved, return:
{
  "shouldSuggest": false,
  "reason": "not durable enough",
  "memory": {}
}
  `);
};
