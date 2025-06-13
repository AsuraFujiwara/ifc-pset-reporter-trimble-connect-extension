import * as WorkspaceAPI from "trimble-connect-workspace-api";

export interface IFCFile {
	id: string;
	name: string;
	size: number;
	path?: Array<{ name: string }>;
	type: string;
	revision?: number;
	status?: string;
	parentId?: string;
}

export interface IFCEntity {
	id: string;
	type: string;
}

export interface IFCObjectProperty {
	name: string;
	value: string | number;
	type?: string;
}

export interface IFCObjectWithProperties {
	id: string;
	name: string;
	type: string;
	properties: IFCObjectProperty[];
}

export interface ProjectDetails {
	id: string;
	name: string;
	rootId: string;
}

export interface FolderItem {
	id: string;
	name: string;
	type: "FILE" | "FOLDER";
	versionId?: string;
	parentId?: string;
	size?: number;
	path?: Array<{ id: string; name: string }>;
}

export interface TrimbleConnectConfig {
	projectId?: string;
	folderName?: string;
	accessToken?: string;
	recursive?: boolean;
	psetNames?: string[];
	columnOrder?: string[];
}

export class TrimbleConnectService {
	private api: WorkspaceAPI.WorkspaceAPI | null = null;
	private config: TrimbleConnectConfig = {
		recursive: true,
		psetNames: [
			"Pset_WallCommon",
			"Pset_SlabCommon",
			"Pset_WindowCommon",
			"Pset_DoorCommon"
		],
		columnOrder: ["Object Name", "Model Name", "Model Path"]
	};
	private isConnected = false;
	private accessToken: string | null = null;

	constructor() {
		this.initializeConnection();
		this.loadConfig();
	}

	private loadConfig() {
		const stored = localStorage.getItem("trimble-connect-config");
		if (stored) {
			try {
				const parsedConfig = JSON.parse(stored);
				this.config = { ...this.config, ...parsedConfig };
			} catch (error) {
				console.error(
					"Failed to load config from localStorage:",
					error
				);
			}
		}
	}

	public saveConfig() {
		localStorage.setItem(
			"trimble-connect-config",
			JSON.stringify(this.config)
		);
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
					this.accessToken = data;
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

	private async makeApiRequest(
		url: string,
		options: RequestInit = {}
	): Promise<unknown> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Content-Type": "application/json",
				...options.headers
			}
		});

		if (!response.ok) {
			throw new Error(
				`API request failed: ${response.status} ${response.statusText}`
			);
		}

		return response.json();
	}
	public async getCurrentProject(): Promise<ProjectDetails> {
		if (!this.api) {
			throw new Error("API not connected");
		}

		try {
			const project = await this.api.project.getProject();
			this.config.projectId = project.id;

			// Get additional project details from the API
			const detailedProject = await this.getProjectDetails(project.id);
			return detailedProject;
		} catch (error) {
			console.error(
				"[TrimbleConnect] Failed to get current project:",
				error
			);
			throw error;
		}
	}
	public async getProjectDetails(projectId: string): Promise<ProjectDetails> {
		const url = `https://app21.connect.trimble.com/tc/api/2.0/projects/${projectId}`;
		const response = (await this.makeApiRequest(url)) as ProjectDetails;
		return response;
	}

	public async getFolderItems(folderId: string): Promise<FolderItem[]> {
		const url = `https://app21.connect.trimble.com/tc/api/2.0/folders/${folderId}/items`;
		const response = (await this.makeApiRequest(url)) as FolderItem[];
		return response;
	}

	public async findFolderByName(
		parentFolderId: string,
		targetFolderName: string
	): Promise<string | null> {
		try {
			const items = await this.getFolderItems(parentFolderId);

			// Look for exact match first
			const exactMatch = items.find(
				(item) =>
					item.type === "FOLDER" &&
					item.name.toLowerCase() === targetFolderName.toLowerCase()
			);

			if (exactMatch) {
				return exactMatch.id;
			}

			// If recursive search is enabled, search in subfolders
			if (this.config.recursive) {
				for (const item of items) {
					if (item.type === "FOLDER") {
						const found = await this.findFolderByName(
							item.id,
							targetFolderName
						);
						if (found) {
							return found;
						}
					}
				}
			}

			return null;
		} catch (error) {
			console.error("[TrimbleConnect] Failed to find folder:", error);
			throw error;
		}
	}

	public async getIFCFiles(folderId: string): Promise<IFCFile[]> {
		try {
			const items = await this.getFolderItems(folderId);
			const ifcFiles: IFCFile[] = [];

			// Find IFC files in current folder
			for (const item of items) {
				if (
					item.type === "FILE" &&
					item.name.toLowerCase().endsWith(".ifc")
				) {
					ifcFiles.push({
						id: item.id,
						name: item.name,
						size: item.size || 0,
						type: item.type,
						path: item.path,
						parentId: item.parentId
					});
				}
			}

			// If recursive search is enabled, search in subfolders
			if (this.config.recursive) {
				for (const item of items) {
					if (item.type === "FOLDER") {
						const subFolderFiles = await this.getIFCFiles(item.id);
						ifcFiles.push(...subFolderFiles);
					}
				}
			}

			return ifcFiles;
		} catch (error) {
			console.error("[TrimbleConnect] Failed to get IFC files:", error);
			throw error;
		}
	}
	public async getModelEntities(modelId: string): Promise<IFCEntity[]> {
		const url = `https://model-api21.connect.trimble.com/models/${modelId}/entities`;
		const response = (await this.makeApiRequest(url)) as {
			items: IFCEntity[];
		};
		return response.items || [];
	}

	public async getObjectProperties(
		modelId: string,
		entityIds: string[]
	): Promise<IFCObjectWithProperties[]> {
		if (!this.api) {
			throw new Error("API not connected");
		}

		try {
			// Convert entity IDs to runtime IDs
			const runtimeIds = await this.api.viewer.convertToObjectRuntimeIds(
				modelId,
				entityIds
			);

			// Get object properties
			const properties = await this.api.viewer.getObjectProperties(
				modelId,
				runtimeIds
			);

			// Transform properties into our format
			const result: IFCObjectWithProperties[] = [];

			for (let i = 0; i < entityIds.length; i++) {
				const entityId = entityIds[i];
				const objectProps = properties[i] || {};
				interface ExtendedObjectProperties {
					name?: string;
					type?: string;
					properties?: Record<string, string | number>;
				}

				const extendedProps = objectProps as ExtendedObjectProperties;

				const ifcObject: IFCObjectWithProperties = {
					id: entityId,
					name: extendedProps.name || `Object_${entityId}`,
					type: extendedProps.type || "Unknown",
					properties: []
				};

				// Extract properties and filter by configured pset names
				if (objectProps.properties) {
					for (const [propName, propValue] of Object.entries(
						objectProps.properties
					)) {
						// Check if this property belongs to one of the configured psets
						const shouldInclude =
							this.config.psetNames?.some(
								(psetName) =>
									propName.startsWith(psetName) ||
									this.config.psetNames?.includes("*") // Include all if "*" is specified
							) ?? true;

						if (shouldInclude) {
							ifcObject.properties.push({
								name: propName,
								value: propValue as string | number,
								type: typeof propValue
							});
						}
					}
				}

				result.push(ifcObject);
			}

			return result;
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
		this.saveConfig();
	}
}
