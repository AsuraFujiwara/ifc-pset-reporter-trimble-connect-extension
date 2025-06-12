import * as WorkspaceAPI from "trimble-connect-workspace-api";

export interface IFCFile {
	id: string;
	name: string;
	size: number;
	path?: Array<{ name: string }>;
	type: string;
}

export interface IFCObject {
	id: string;
	name: string;
	type?: string;
	children?: IFCObject[];
}

export interface IFCObjectProperty {
	name: string;
	value: string;
}

export interface TrimbleConnectConfig {
	projectId?: string;
	folderName?: string;
	accessToken?: string;
}

export class TrimbleConnectService {
	private api: WorkspaceAPI.WorkspaceAPI | null = null;
	private config: TrimbleConnectConfig = {};
	private isConnected = false;

	constructor() {
		this.initializeConnection();
	}

	private async initializeConnection() {
		try {
			// Connect as an extension (running inside Trimble Connect)
			this.api = await WorkspaceAPI.connect(
				window.parent,
				this.handleEvent.bind(this),
				30000 // 30 second timeout
			);

			this.isConnected = true;
			console.log("[TrimbleConnect] Connected to Workspace API");

			// Request access token permission
			await this.requestPermissions();
		} catch (error) {
			console.error("[TrimbleConnect] Failed to connect:", error);
			this.isConnected = false;
		}
	}

	private handleEvent(event: string, data: unknown) {
		console.log("[TrimbleConnect] Event received:", event, data);

		switch (event) {
			case "extension.accessToken":
				if (
					data &&
					typeof data === "string" &&
					data !== "pending" &&
					data !== "denied"
				) {
					this.config.accessToken = data;
					console.log("[TrimbleConnect] Access token received");
				} else if (data === "denied") {
					console.error(
						"[TrimbleConnect] Access token denied by user"
					);
				}
				break;
			case "extension.command":
				console.log("[TrimbleConnect] Command received:", data);
				break;
			default:
				break;
		}
	}

	private async requestPermissions(): Promise<void> {
		if (!this.api) {
			throw new Error("API not connected");
		}

		try {
			const result = await this.api.extension.requestPermission(
				"accesstoken"
			);
			console.log("[TrimbleConnect] Permission request result:", result);
		} catch (error) {
			console.error(
				"[TrimbleConnect] Failed to request permissions:",
				error
			);
		}
	}

	public async getCurrentProject() {
		if (!this.api) {
			throw new Error("API not connected");
		}

		try {
			const project = await this.api.project.getProject();
			this.config.projectId = project.id;
			return project;
		} catch (error) {
			console.error(
				"[TrimbleConnect] Failed to get current project:",
				error
			);
			throw error;
		}
	}

	public async getProjectRootFolders(projectId?: string): Promise<string[]> {
		if (!this.api) {
			throw new Error("API not connected");
		}

		const targetProjectId = projectId || this.config.projectId;
		if (!targetProjectId) {
			throw new Error("No project ID available");
		}
		try {
			// Get project details to find root folder
			// For now, we'll use a placeholder approach since the exact API structure isn't clear
			// This would need to be updated based on the actual API response structure
			return [targetProjectId]; // Fallback to using project ID as root
		} catch (error) {
			console.error(
				"[TrimbleConnect] Failed to get project root folders:",
				error
			);
			throw error;
		}
	}

	public async findFolderByName(
		parentFolderId: string,
		targetFolderName: string
	): Promise<string | null> {
		if (!this.api) {
			throw new Error("API not connected");
		}

		try {
			// This is a placeholder implementation
			// The actual API calls would depend on the available methods in the WorkspaceAPI
			console.log(
				`[TrimbleConnect] Searching for folder '${targetFolderName}' in parent '${parentFolderId}'`
			);

			// For now, return a mock folder ID for demonstration
			// This would need to be implemented based on actual API
			if (
				targetFolderName.toLowerCase() === "ifc" ||
				targetFolderName.toLowerCase() === "models"
			) {
				return (
					"mock-folder-id-" + Math.random().toString(36).substr(2, 9)
				);
			}

			return null;
		} catch (error) {
			console.error("[TrimbleConnect] Failed to find folder:", error);
			throw error;
		}
	}

	public async getIFCFiles(folderId: string): Promise<IFCFile[]> {
		if (!this.api) {
			throw new Error("API not connected");
		}

		try {
			// This is a placeholder implementation for demonstration
			console.log(
				`[TrimbleConnect] Getting IFC files from folder '${folderId}'`
			);

			// Return mock IFC files for demonstration
			return [
				{
					id: "mock-ifc-1",
					name: "Building_Model.ifc",
					size: 1024000,
					type: "FILE",
					path: [{ name: "Models" }, { name: "IFC" }]
				},
				{
					id: "mock-ifc-2",
					name: "Structure_Model.ifc",
					size: 2048000,
					type: "FILE",
					path: [{ name: "Models" }, { name: "IFC" }]
				}
			];
		} catch (error) {
			console.error("[TrimbleConnect] Failed to get IFC files:", error);
			throw error;
		}
	}

	public async getIFCObjects(fileId: string): Promise<IFCObject[]> {
		if (!this.api) {
			throw new Error("API not connected");
		}

		try {
			// Use the correct viewer API method
			// Note: This might need to be adjusted based on the actual API structure
			console.log(
				`[TrimbleConnect] Getting objects for file '${fileId}'`
			);

			// Return mock objects for demonstration
			return [
				{
					id: "object-1",
					name: "IfcBuilding",
					type: "IfcBuilding",
					children: [
						{
							id: "object-2",
							name: "IfcBuildingStorey",
							type: "IfcBuildingStorey",
							children: [
								{
									id: "object-3",
									name: "IfcWall",
									type: "IfcWall"
								},
								{
									id: "object-4",
									name: "IfcSlab",
									type: "IfcSlab"
								}
							]
						}
					]
				}
			];
		} catch (error) {
			console.error("[TrimbleConnect] Failed to get IFC objects:", error);
			throw error;
		}
	}

	public async getIFCObjectProperties(
		fileId: string,
		objectId: string
	): Promise<IFCObjectProperty[]> {
		if (!this.api) {
			throw new Error("API not connected");
		}

		try {
			console.log(
				`[TrimbleConnect] Getting properties for object '${objectId}' in file '${fileId}'`
			);

			// Return mock properties for demonstration
			return [
				{ name: "Name", value: "Example Object" },
				{ name: "Type", value: "IfcWall" },
				{ name: "Material", value: "Concrete" },
				{ name: "Height", value: "3000mm" }
			];
		} catch (error) {
			console.error(
				"[TrimbleConnect] Failed to get object properties:",
				error
			);
			throw error;
		}
	}

	public isApiConnected(): boolean {
		return this.isConnected && this.api !== null;
	}

	public getConfig(): TrimbleConnectConfig {
		return { ...this.config };
	}

	public updateConfig(newConfig: Partial<TrimbleConnectConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}
}
