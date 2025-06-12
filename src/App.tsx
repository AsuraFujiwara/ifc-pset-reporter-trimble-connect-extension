import { useState, useEffect } from "react";
import { TrimbleConnectService } from "./services/trimbleConnect";
import type { IFCFile } from "./services/trimbleConnect";
import { IFCExplorer } from "./components/IFCExplorer";
import { ProjectSelector } from "./components/ProjectSelector";
import { Alert, AlertDescription } from "./components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import "./App.css";

interface Project {
	id: string;
	name?: string;
}

function App() {
	const [service] = useState(() => new TrimbleConnectService());
	const [isConnected, setIsConnected] = useState(false);
	const [currentProject, setCurrentProject] = useState<Project | null>(null);
	const [ifcFiles, setIfcFiles] = useState<IFCFile[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const checkConnection = async () => {
			try {
				// Wait a bit for the service to initialize
				setTimeout(async () => {
					if (service.isApiConnected()) {
						setIsConnected(true);
						const project = await service.getCurrentProject();
						setCurrentProject(project);
					}
				}, 1000);
			} catch (err) {
				setError(
					`Failed to connect: ${
						err instanceof Error ? err.message : "Unknown error"
					}`
				);
			}
		};

		checkConnection();
	}, [service]);

	const handleFolderSearch = async (folderName: string) => {
		if (!isConnected || !currentProject) {
			setError("Not connected to Trimble Connect");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Get project root folders
			const rootFolders = await service.getProjectRootFolders(
				currentProject.id
			);

			let foundFolderId: string | null = null;

			// Search for the target folder
			for (const rootFolderId of rootFolders) {
				foundFolderId = await service.findFolderByName(
					rootFolderId,
					folderName
				);
				if (foundFolderId) break;
			}

			if (!foundFolderId) {
				setError(`Folder '${folderName}' not found in project`);
				return;
			}

			// Get IFC files in the folder
			const files = await service.getIFCFiles(foundFolderId);
			setIfcFiles(files);
		} catch (err) {
			setError(
				`Search failed: ${
					err instanceof Error ? err.message : "Unknown error"
				}`
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background p-4">
			<div className="container mx-auto max-w-6xl">
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Trimble Connect IFC Explorer
							{isConnected && (
								<Badge variant="secondary">Connected</Badge>
							)}
						</CardTitle>
						<CardDescription>
							Search and explore IFC files in your Trimble Connect
							project
						</CardDescription>
					</CardHeader>
					<CardContent>
						{error && (
							<Alert className="mb-4" variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{currentProject && (
							<div className="mb-4">
								<p className="text-sm text-muted-foreground">
									Current Project:{" "}
									<span className="font-medium">
										{currentProject.name ||
											"Unnamed Project"}
									</span>
								</p>
							</div>
						)}

						<ProjectSelector
							onSearch={handleFolderSearch}
							loading={loading}
							disabled={!isConnected}
						/>
					</CardContent>
				</Card>

				{ifcFiles.length > 0 && (
					<IFCExplorer files={ifcFiles} service={service} />
				)}
			</div>
		</div>
	);
}

export default App;

