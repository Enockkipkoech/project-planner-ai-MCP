import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

//INTERFACES
interface Project {
	id: string;
	name: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

interface Todo {
	id: string;
	projectId: string;
	title: string;
	description: string;
	status: "pending" | "in-progress" | "completed";
	priority: "low" | "medium" | "high";
	createdAt: Date;
	updatedAt: Date;
}

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Project Planner MCP",
		version: "1.0.0",
	});

	// HELPER FUMCTIONS
	private get kv(): KVNamespace {
		return (this.env as any).PROJECT_PLANNER_STORE;
	}

	private async getProjectList(): Promise<string[]> {
		const list = await this.kv.get("project:list");
		return list ? JSON.parse(list) : [];
	}

	private async getTodoList(projectId: string): Promise<string[]> {
		const list = await this.kv.get(`project:${projectId}:todos`);
		return list ? JSON.parse(list) : [];
	}

	private async getTodosByProject(projectId: string): Promise<Todo[]> {
		const listData = await this.getTodoList(projectId);
		const todos: Todo[] = [];
		for (const todoId of listData) {
			const todoData = await this.kv.get(`todo:${todoId}`);
			if (todoData) {
				todos.push(JSON.parse(todoData));
			}
		}
		return todos;
	}

	async init() {

		this.server.registerTool("create-project",
			{
				description: "Create a new project",
				inputSchema: z.object({
					name: z.string().describe("Project name"),
					description: z.string().optional().describe("Project description"),
				})
			},

			async ({ name, description }) => {
				const projectId = crypto.randomUUID();
				const newProject: Project = {
					id: projectId,
					name: name,
					description: description || "",
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				// SAVE TO KV DB
				await this.kv.put(`project:${newProject.id}`, JSON.stringify(newProject));

				const projectList = await this.getProjectList();
				projectList.push(newProject.id);
				await this.kv.put("project:list", JSON.stringify(projectList));

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(newProject, null, 2),
						}
					]
				};
			}

		)

		this.server.registerTool("list-projects", {
			description: "List all projects"
		}, async () => {
			const projectList = await this.getProjectList();
			const projects: Project[] = [];

			for (const projectId of projectList) {
				const projectData = await this.kv.get(`project:${projectId}`);
				if (projectData) {
					projects.push(JSON.parse(projectData));
				}
			}

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(projects, null, 2)
					}
				]
			};
		})

		this.server.registerTool("get-project", {
			description: "Get single Project by ID",
			inputSchema: z.object({
				projectId: z.string().nonempty().describe("Project ID")
			})
		}, async ({ projectId }) => {
			const projectData = await this.kv.get(`project:${projectId}`);

			if (!projectData) {
				throw new Error(`Project with ID: ${projectId} not found`);
			}
			const project: Project = JSON.parse(projectData);
			const todos = await this.getTodosByProject(project.id);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ project, todos }, null, 2)
					}
				]
			};
		})

		this.server.registerTool("delete-project", {
			description: "Delete Project by ID and all associated todos",
			inputSchema: z.object({
				projectId: z.string().nonempty().describe("Project ID")
			})
		}, async ({ projectId }) => {
			const projectData = await this.kv.get(`project:${projectId}`);

			if (!projectData) {
				throw new Error(`Project with ID: ${projectId} not found`);
			}

			//Delete al todos associated with the project
			const todos = await this.getTodosByProject(projectId);
			for (const todo of todos) {
				await this.kv.delete(`todo:${todo.id}`);
			}

			// Delete the project todo list
			await this.kv.delete(`project:${projectId}:todos`);
			// Delete the project itself
			await this.kv.delete(`project:${projectId}`);

			//Remove project ID from project list
			const projectList = await this.getProjectList();
			const updatedProjectList = projectList.filter(id => id !== projectId);
			await this.kv.put("project:list", JSON.stringify(updatedProjectList));

			return {
				content: [
					{
						type: "text",
						text: `Project ${projectId} and all associated todos have been deleted successfully.`
					}
				]
			};
		})

		this.server.registerTool("create-todo", {
			description: "Create a new todo item under a project",
			inputSchema: z.object({
				projectId: z.string().nonempty().describe("Project ID"),
				title: z.string().describe("Todo Title"),
				description: z.string().optional().describe("Todo Description"),
				status: z.enum(["pending", "in-progress", "completed"]).optional().describe("Todo Status-pending, in-progress, or completed"),
				priority: z.enum(["low", "medium", "high"]).describe("Todo Priority-high,low,or medium"),
			})

		}, async ({ projectId, title, description, status, priority }) => {

			// Logic
			const projectData = await this.kv.get(`project:${projectId}`);
			if (!projectData) {
				throw new Error(`Project ID: ${projectId} not found`);
			}
			const todoId = crypto.randomUUID();
			const todo: Todo = {
				id: todoId,
				projectId: projectId,
				title: title,
				description: description || "",
				status: status || "pending",
				priority: priority || "medium",
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			await this.kv.put(`todo:${todo.id}`, JSON.stringify(todo));

			const todoList = await this.getTodoList(projectId);
			todoList.push(todo.id);
			await this.kv.put(`project:${projectId}:todos`, JSON.stringify(todoList));

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(todo, null, 2)
					}
				]
			};
		});

		this.server.registerTool("update-todo", {
			description: "Update an existing todo item",
			inputSchema: z.object({
				todoId: z.string().nonempty().describe("Todo ID"),
				title: z.string().optional().describe("New Todo Title"),
				description: z.string().optional().describe("New Todo Description"),
				status: z.enum(["pending", "in-progress", "completed"]).optional().describe("New Todo Status-pending, in-progress, or completed"),
				priority: z.enum(["low", "medium", "high"]).optional().describe("New Todo Priority-high,low,or medium"),
			})

		}, async ({ todoId, title, description, status, priority }) => {

			// Logic
			const todoData = await this.kv.get(`todo:${todoId}`);

			if (!todoData) {
				throw new Error(`Todo with ID: ${todoId} not found`);
			}

			const todo: Todo = JSON.parse(todoData);

			if (title) todo.title = title;
			if (description) todo.description = description;
			if (status) todo.status = status;
			if (priority) todo.priority = priority;
			todo.updatedAt = new Date();
			await this.kv.put(`todo:${todo.id}`, JSON.stringify(todo));
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(todo, null, 2)
					}
				]
			};
		});

		this.server.registerTool("delete-todo", {
			description: "delete Todo from a project",
			inputSchema: z.object({
				todoId: z.string().nonempty().describe("Todo ID"),

			})

		}, async ({ todoId }) => {

			// Logic
			const todoData = await this.kv.get(`todo:${todoId}`);

			if (!todoData) {
				throw new Error(`Todo with ID: ${todoId} not found`);
			}

			const todo: Todo = JSON.parse(todoData);

			// Remove from Project's todo list
			const todoList = await this.getTodoList(todo.projectId);
			const updatedTodoList = todoList.filter(id => id !== todoId);
			await this.kv.put(`project:${todo.projectId}:todos`, JSON.stringify(updatedTodoList));

			// Delete the todo item
			await this.kv.delete(`todo:${todoId}`);


			return {
				content: [
					{
						type: "text",
						text: `Todo with ID: ${todoId} has been deleted successfully.`
					}
				]
			};
		});

		this.server.registerTool("list-all-project-todos", {
			description: "Get specific todo item by its ID",
			inputSchema: z.object({
				todoId: z.string().nonempty().describe("Todo ID"),

			})

		}, async ({ todoId }) => {

			// Logic
			const todoData = await this.kv.get(`todo:${todoId}`);

			if (!todoData) {
				throw new Error(`Todo with ID: ${todoId} not found`);
			}

			const todo: Todo = JSON.parse(todoData);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(todo, null, 2)
					}
				]
			};
		});

		this.server.registerTool("get-todo-by-id", {
			description: "Get specific todo item by its ID",
			inputSchema: z.object({
				projectId: z.string().nonempty().describe("Project ID"),
				status: z.enum(["pending", "in-progress", "completed", "all"]).optional().describe("Filter by Todo Status-pending, in-progress,completed or all"),
			})

		}, async ({ projectId, status }) => {

			// Logic
			const projectData = await this.kv.get(`project:${projectId}`);

			if (!projectData) {
				throw new Error(`Project with ID: ${projectId} not found`);
			}

			let todos = await this.getTodosByProject(projectId);
			todos = status && status !== "all" ? todos.filter(todo => todo.status === status) : todos;

			if (!todos) {
				throw new Error(`No todos found for project: ${projectId} with status: ${status}`);
			}


			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(todos, null, 2)
					}
				]
			};
		});
	}

}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
