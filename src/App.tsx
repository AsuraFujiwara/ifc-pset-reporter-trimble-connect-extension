import { useState, useEffect } from "react";
import { TrimbleConnectService } from "./services/trimbleConnect";
import type { IFCFile } from "./services/trimbleConnect";
import { IFCExplorer } from "./components/IFCExplorer";
import { ProjectSelector } from "./components/ProjectSelector";
import { Configuration } from "./components/Configuration";
import { Alert, AlertDescription } from "./components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
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
	const [activeTab, setActiveTab] = useState<"search" | "config">("search");

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
			// Get project details to find root folder
			const projectDetails = await service.getProjectDetails(
				currentProject.id
			);
			console.log("Project details:", projectDetails);

			// Search for the target folder starting from the root
			const foundFolderId = await service.findFolderByName(
				projectDetails.rootId,
				folderName
			);

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
				{/* Header Card */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Trimble Connect IFC PSet Reporter
							<Badge
								variant={isConnected ? "default" : "secondary"}>
								{isConnected ? "Connected" : "Disconnected"}
							</Badge>
						</CardTitle>
						<CardDescription>
							Search for IFC files and generate property set
							reports
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

						{/* Tab Navigation */}
						<div className="flex gap-2 mb-4">
							<Button
								variant={
									activeTab === "search"
										? "default"
										: "outline"
								}
								onClick={() => setActiveTab("search")}>
								Search & Report
							</Button>
							<Button
								variant={
									activeTab === "config"
										? "default"
										: "outline"
								}
								onClick={() => setActiveTab("config")}>
								Configuration
							</Button>
						</div>

						{/* Tab Content */}
						{activeTab === "search" && (
							<ProjectSelector
								onSearch={handleFolderSearch}
								loading={loading}
								disabled={!isConnected}
							/>
						)}
					</CardContent>
				</Card>

				{/* Tab-specific content */}
				{activeTab === "search" && ifcFiles.length > 0 && (
					<IFCExplorer files={ifcFiles} service={service} />
				)}

				{activeTab === "config" && <Configuration service={service} />}
			</div>
		</div>
	);
}

export default App;

