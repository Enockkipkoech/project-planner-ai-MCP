# 📋 project-planner-MCP

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://project-planner.nodeg.workers.dev/mcp)

> A Model Context Protocol (MCP) server for AI-powered project and task management — create projects, manage todos, track priorities, and monitor progress seamlessly through any MCP-compatible AI assistant.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![MCP](https://img.shields.io/badge/MCP-compatible-brightgreen.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Available Tools](#available-tools)
  - [Examples](#examples)
- [Integration with Claude](#integration-with-claude)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**project-planner-ai-MCP** is a lightweight, AI-native project management server built on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). It allows AI assistants like Claude to create and manage projects and todos on your behalf — directly from natural language conversations, with no manual UI required.

Whether you're planning a software project, organizing tasks, or tracking team progress, project-planner-ai-MCP bridges the gap between your AI assistant and your project management workflow.

---

## ✨ Features

- 🗂 **Project Management** — Create, retrieve, and delete projects
- ✅ **Todo Management** — Add, update, and delete todos within projects
- 🔴 **Priority Levels** — Assign `high`, `medium`, or `low` priority to every task
- 📊 **Status Tracking** — Track todos as `pending`, `in-progress`, or `completed`
- 🤖 **AI-Native** — Fully operable through any MCP-compatible AI assistant
- ⚡ **Lightweight** — Minimal dependencies, fast setup

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v24 or higher
- An MCP-compatible AI client (e.g., [Claude Desktop](https://www.anthropic.com/claude))

### Installation

Clone the repository:

```bash
git clone https://github.com/Enockkipkoech/project-planner-MCP.git
cd project-planner-ai-MCP
```

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

### Configuration

Add the server to your MCP client configuration file (e.g., `claude_desktop_config.json`):

```json
{
	"mcpServers": {
		"project-planner-mcp": {
			"command": "node",
			"args": ["/absolute/path/to/project-planner-MCP/build/index.js"]
		}
	}
}
```

Restart your MCP client and the server will be available.

---

## 🛠 Usage

### Available Tools

| Tool             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `create-project` | Create a new project with a name and optional description         |
| `list-projects`  | List all existing projects                                        |
| `get-project`    | Retrieve a single project by ID                                   |
| `delete-project` | Delete a project and all its associated todos                     |
| `create-todo`    | Add a new todo to a project with title, priority, and status      |
| `update-todo`    | Update an existing todo's title, description, priority, or status |
| `delete-todo`    | Delete a specific todo by ID                                      |
| `get-todo-by-id` | Fetch todos for a project, optionally filtered by status          |

### Examples

**Create a project:**

```
"Create a new project called E-Commerce Application"
```

**Add todos:**

```
"Add a high priority todo for User Authentication to my E-Commerce project"
```

**Update status:**

```
"Mark the Shopping Cart todo as in-progress"
```

**List all todos:**

```
"Show me all pending todos for the E-Commerce Application"
```

---

## 🤝 Integration with Claude

project-planner-MCP works seamlessly with **Claude Desktop** and **Claude.ai** via the MCP connector system. Once configured:

1. Open Claude Desktop
2. Start a conversation — Claude will automatically detect the available tools
3. Ask Claude to manage your projects in plain English

No extra commands or syntax required — just talk to your AI assistant naturally.

---

## 📁 Project Structure

```
project-planner-MCP/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── tools/            # Tool definitions and handlers
│   └── storage/          # Data persistence layer
├── build/                # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤲 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing style and includes relevant tests.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
&copy; 2026 Enock Kipkoech. All rights reserved.

---

<p align="center">Built by Enock Kipkoech with ❤️ using the <a href="https://modelcontextprotocol.io">Model Context Protocol</a></p>
