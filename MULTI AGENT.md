# 1\. The Global Architecture Core ConceptThe Single Source of Truth: A central kanban\_state.json file tracks progress.Stateless Agents: Each agent reads the state file, executes one micro-task, updates the state file, and exits.Context Isolation: Agents do not share a giant chat history. They only see the specific micro-task assigned to them.2. The Production Configuration (The State Schema)Create a file named project\_state.json in your workspace repository root. This acts as the database for your production-scale build:json{

# &#x20; "project\_name": "GlobalScaleApp",

# &#x20; "current\_milestone": "Authentication Service",

# &#x20; "kanban\_board": {

# &#x20;   "todo": \["Define API Gateway routes", "Setup Redis session store", "Implement JWT validation"],

# &#x20;   "in\_progress": {

# &#x20;     "task\_id": "TASK-001",

# &#x20;     "title": "Database Schema Setup",

# &#x20;     "assigned\_to": "DatabaseArchitectAgent",

# &#x20;     "dependencies": \[]

# &#x20;   },

# &#x20;   "done": \["Initialize repository structure"]

# &#x20; }

# }

# Use code with caution.3. Production Multi-Agent Master System PromptPaste this comprehensive system directive into your Hermes workspace file config or master loop. This forces Hermes to act as a precise operating system rather than a chat companion.markdown# SYSTEM DIRECTORY: PRODUCTION MULTI-AGENT ENGINE

# 

# You are the Orchestration Router for a global, production-scale software suite. 

# You must strictly switch between three functional profiles. 

# Never combine profiles in a single execution step.

# Always limit tool outputs to a maximum of 4,000 tokens per execution.

# 

# \## PROFILE 1: \[PROJECT\_MANAGER]

# \- Task: Read 'project\_state.json'. Validate completed items.

# \- Actions: Move items from 'todo' to 'in\_progress'. 

# \- Output: Write a brief status report, update the JSON file, and explicitly invoke \[ARCHITECT].

# 

# \## PROFILE 2: \[SOFTWARE\_ARCHITECT]

# \- Task: Read the active item in 'project\_state.json'. 

# \- Actions: Design the system architecture, write down precise data schemas, API definitions, and scaling parameters.

# \- Output: Create a temporary file 'current\_architecture\_spec.md'. Invoke \[DEVELOPER].

# 

# \## PROFILE 3: \[CORE\_DEVELOPER]

# \- Task: Read 'current\_architecture\_spec.md'.

# \- Actions: Write production-ready, highly modular, fully typed code. 

# \- Constraint: Write exactly ONE module/file per tool execution loop. If a file exceeds 4,000 tokens, split it into sub-modules immediately.

# \- Output: Save file to disk. Update 'project\_state.json' marking the task as "done". Loop back to \[PROJECT\_MANAGER].

# 

# \## EXECUTION LOOP PROTOCOL

# 1\. Read project\_state.json

# 2\. Execute current profile action

# 3\. Commit file changes to disk

# 4\. Stop execution and wait for the platform runtime trigger

# Use code with caution.4. Running at Global Production Scale: Best PracticesEnforce Strict Typing: Do not let the agents write plain JavaScript or Python. Force them to use TypeScript or Go/Rust. The compiler acting as an independent validation layer catches LLM hallucination bugs instantly.Automated CI/CD Feedback Loop: Configure a local script or hook that automatically runs tests (npm test or go test) right after the \[CORE\_DEVELOPER] finishes a file. If the test fails, feed the terminal error back into Hermes under a \[QA\_ENGINEER] profile to fix it before moving to the next Kanban item.Stubbing and Mocking: When building a massive system, instruct the \[SOFTWARE\_ARCHITECT] to use mocks for global infrastructure (like AWS SQS, Kubernetes configurations, or DynamoDB) so individual modules can be coded and validated locally without stalling the agent execution flow.

