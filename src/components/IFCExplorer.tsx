import { useState } from "react";
import { TrimbleConnectService } from "@/services/trimbleConnect";
import type { IFCFile, IFCObject } from "@/services/trimbleConnect";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IFCExplorerProps {
	files: IFCFile[];
	service: TrimbleConnectService;
}

interface FileObjectsState {
	[fileId: string]: {
		objects: IFCObject[];
		loading: boolean;
		error: string | null;
	};
}

export function IFCExplorer({ files, service }: IFCExplorerProps) {
	const [fileObjects, setFileObjects] = useState<FileObjectsState>({});

	const loadFileObjects = async (fileId: string) => {
		if (fileObjects[fileId]) return; // Already loaded or loading

		setFileObjects((prev) => ({
			...prev,
			[fileId]: { objects: [], loading: true, error: null }
		}));

		try {
			const objects = await service.getIFCObjects(fileId);
			setFileObjects((prev) => ({
				...prev,
				[fileId]: { objects, loading: false, error: null }
			}));
		} catch (error) {
			setFileObjects((prev) => ({
				...prev,
				[fileId]: {
					objects: [],
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to load objects"
				}
			}));
		}
	};

	const formatFileSize = (bytes: number): string => {
		const sizes = ["Bytes", "KB", "MB", "GB"];
		if (bytes === 0) return "0 Bytes";
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return (
			Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
		);
	};

	const renderObjectHierarchy = (
		objects: IFCObject[],
		depth = 0
	): React.ReactElement[] => {
		return objects.map((obj, index) => (
			<div key={`${obj.id}-${index}`} className={`ml-${depth * 4} py-1`}>
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium">{obj.name}</span>
					{obj.type && (
						<Badge variant="outline" className="text-xs">
							{obj.type}
						</Badge>
					)}
				</div>
				<div className="text-xs text-muted-foreground">
					ID: {obj.id}
				</div>
				{obj.children && obj.children.length > 0 && (
					<div className="mt-1">
						{renderObjectHierarchy(obj.children, depth + 1)}
					</div>
				)}
			</div>
		));
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>IFC Files Found</CardTitle>
				<CardDescription>
					Found {files.length} IFC file{files.length !== 1 ? "s" : ""}{" "}
					in the project
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Accordion type="single" collapsible className="w-full">
					{files.map((file) => (
						<AccordionItem key={file.id} value={file.id}>
							<AccordionTrigger className="text-left">
								<div className="flex flex-col items-start gap-1">
									<span className="font-medium">
										{file.name}
									</span>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<span>
											Size: {formatFileSize(file.size)}
										</span>
										<span>•</span>
										<span>ID: {file.id}</span>
									</div>
									{file.path && file.path.length > 0 && (
										<div className="text-xs text-muted-foreground">
											Path:{" "}
											{file.path
												.map(
													(p: { name: string }) =>
														p.name
												)
												.join(" > ")}
										</div>
									)}
								</div>
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h4 className="text-sm font-medium">
											IFC Objects
										</h4>
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												loadFileObjects(file.id)
											}
											disabled={
												fileObjects[file.id]?.loading
											}>
											{fileObjects[file.id]?.loading
												? "Loading..."
												: "Load Objects"}
										</Button>
									</div>

									{fileObjects[file.id]?.loading && (
										<div className="space-y-2">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-3/4" />
											<Skeleton className="h-4 w-1/2" />
										</div>
									)}

									{fileObjects[file.id]?.error && (
										<Alert variant="destructive">
											<AlertDescription>
												{fileObjects[file.id].error}
											</AlertDescription>
										</Alert>
									)}

									{fileObjects[file.id]?.objects &&
										fileObjects[file.id].objects.length >
											0 && (
											<div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
												<div className="text-sm font-medium mb-2">
													Found{" "}
													{
														fileObjects[file.id]
															.objects.length
													}{" "}
													top-level objects:
												</div>
												<div className="space-y-1">
													{renderObjectHierarchy(
														fileObjects[file.id]
															.objects
													)}
												</div>
											</div>
										)}

									{fileObjects[file.id]?.objects &&
										fileObjects[file.id].objects.length ===
											0 &&
										!fileObjects[file.id].loading && (
											<div className="text-sm text-muted-foreground">
												No objects found (file may not
												be processed yet)
											</div>
										)}
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</CardContent>
		</Card>
	);
}
