import { useState } from "react";
import { TrimbleConnectService } from "@/services/trimbleConnect";
import type { IFCFile } from "@/services/trimbleConnect";
// Note: xlsx import will be resolved when the package is properly installed
// import * as XLSX from 'xlsx';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IFCExplorerProps {
	files: IFCFile[];
	service: TrimbleConnectService;
}

export function IFCExplorer({ files, service }: IFCExplorerProps) {
	const [isGeneratingReport, setIsGeneratingReport] = useState(false);
	const [reportProgress, setReportProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const formatFileSize = (bytes: number): string => {
		const sizes = ["Bytes", "KB", "MB", "GB"];
		if (bytes === 0) return "0 Bytes";
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return (
			Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
		);
	};

	const generateExcelReport = async () => {
		setIsGeneratingReport(true);
		setReportProgress(0);
		setError(null);
		try {
			const allObjects: Array<Record<string, string | number>> = [];

			const totalFiles = files.length;

			for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
				const file = files[fileIndex];
				setReportProgress((fileIndex / totalFiles) * 50); // First 50% for getting entities

				try {
					// Get model entities
					const entities = await service.getModelEntities(file.id);

					// Get properties for all entities (in batches for performance)
					const batchSize = 50;
					const entityBatches = [];
					for (let i = 0; i < entities.length; i += batchSize) {
						entityBatches.push(entities.slice(i, i + batchSize));
					}

					let processedBatches = 0;
					for (const batch of entityBatches) {
						const entityIds = batch.map((e) => e.id);
						const objectsWithProperties =
							await service.getObjectProperties(
								file.id,
								entityIds
							);

						// Transform to Excel format
						for (const obj of objectsWithProperties) {
							const row: Record<string, string | number> = {
								objectName: obj.name,
								modelName: file.name,
								modelPath:
									file.path?.map((p) => p.name).join(" > ") ||
									""
							};

							// Add property values as columns
							for (const prop of obj.properties) {
								row[prop.name] = prop.value;
							}

							allObjects.push(row);
						}

						processedBatches++;
						setReportProgress(
							50 + (processedBatches / entityBatches.length) * 50
						);
					}
				} catch (fileError) {
					console.error(
						`Error processing file ${file.name}:`,
						fileError
					);
					// Continue with other files
				}
			}

			if (allObjects.length === 0) {
				setError("No objects found to export");
				return;
			}

			// TODO: Replace this with actual XLSX implementation once package is properly installed
			// For now, create a CSV export as a fallback
			const config = service.getConfig();
			const columnOrder = config.columnOrder || [
				"objectName",
				"modelName",
				"modelPath"
			];

			// Get all unique property names
			const allPropertyNames = new Set<string>();
			allObjects.forEach((obj) => {
				Object.keys(obj).forEach((key) => allPropertyNames.add(key));
			});

			// Create ordered columns: first the standard columns, then property columns
			const orderedColumns = [
				...columnOrder,
				...Array.from(allPropertyNames)
					.filter((name) => !columnOrder.includes(name))
					.sort()
			];

			// Create CSV content
			const csvHeader = orderedColumns.join(",");
			const csvRows = allObjects.map((obj) =>
				orderedColumns
					.map((col) => {
						const value = obj[col] || "";
						// Escape commas and quotes in CSV
						return typeof value === "string" &&
							(value.includes(",") || value.includes('"'))
							? `"${value.replace(/"/g, '""')}"`
							: String(value);
					})
					.join(",")
			);

			const csvContent = [csvHeader, ...csvRows].join("\n");

			// Download as CSV file
			const blob = new Blob([csvContent], {
				type: "text/csv;charset=utf-8;"
			});
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute(
				"download",
				`IFC_Properties_Report_${
					new Date().toISOString().split("T")[0]
				}.csv`
			);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			setReportProgress(100);
		} catch (error) {
			console.error("Error generating report:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to generate report"
			);
		} finally {
			setIsGeneratingReport(false);
		}
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
				{" "}
				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				{/* Large text area showing IFC files list */}
				<div className="mb-4">
					<div className="border rounded-lg p-4 bg-muted/50 min-h-[300px] max-h-[400px] overflow-y-auto">
						{files.length === 0 ? (
							<div className="flex items-center justify-center h-[250px] text-muted-foreground">
								LIST OF IFC FILES FOUND RECURSIVELY FROM FOLDER
							</div>
						) : (
							<div className="space-y-2">
								<div className="font-medium text-sm text-muted-foreground mb-3">
									LIST OF IFC FILES FOUND RECURSIVELY FROM
									FOLDER
								</div>
								{files.map((file, index) => (
									<div
										key={file.id}
										className="text-sm font-mono">
										<div className="font-medium">
											{index + 1}. {file.name}
										</div>
										<div className="text-muted-foreground ml-4">
											ID: {file.id} | Size:{" "}
											{formatFileSize(file.size)}
										</div>
										<div className="text-muted-foreground ml-4">
											Path:{" "}
											{file.path
												?.map((p) => p.name)
												.join(" > ") || "Root"}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
				{/* Generate Report Section */}
				<div className="space-y-4">
					{isGeneratingReport && (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span>Generating Excel report...</span>
								<span>{Math.round(reportProgress)}%</span>
							</div>
							<Progress
								value={reportProgress}
								className="w-full"
							/>
						</div>
					)}

					<Button
						onClick={generateExcelReport}
						disabled={isGeneratingReport || files.length === 0}
						className="w-full"
						size="lg">
						{isGeneratingReport
							? "Generating Report..."
							: "GENERATE REPORT"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
