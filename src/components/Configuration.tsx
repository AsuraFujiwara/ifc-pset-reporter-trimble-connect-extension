import { useState, useEffect } from "react";
import { TrimbleConnectService } from "@/services/trimbleConnect";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfigurationProps {
	service: TrimbleConnectService;
}

export function Configuration({ service }: ConfigurationProps) {
	const [config, setConfig] = useState(service.getConfig());
	const [newPsetName, setNewPsetName] = useState("");
	const [showSaved, setShowSaved] = useState(false);

	useEffect(() => {
		setConfig(service.getConfig());
	}, [service]);

	const handleSave = () => {
		service.updateConfig(config);
		setShowSaved(true);
		setTimeout(() => setShowSaved(false), 2000);
	};

	const addPsetName = () => {
		if (
			newPsetName.trim() &&
			!config.psetNames?.includes(newPsetName.trim())
		) {
			setConfig((prev) => ({
				...prev,
				psetNames: [...(prev.psetNames || []), newPsetName.trim()]
			}));
			setNewPsetName("");
		}
	};

	const removePsetName = (nameToRemove: string) => {
		setConfig((prev) => ({
			...prev,
			psetNames:
				prev.psetNames?.filter((name) => name !== nameToRemove) || []
		}));
	};

	const addColumnOrder = () => {
		const newColumn = prompt("Enter column name:");
		if (
			newColumn?.trim() &&
			!config.columnOrder?.includes(newColumn.trim())
		) {
			setConfig((prev) => ({
				...prev,
				columnOrder: [...(prev.columnOrder || []), newColumn.trim()]
			}));
		}
	};

	const removeColumnOrder = (columnToRemove: string) => {
		setConfig((prev) => ({
			...prev,
			columnOrder:
				prev.columnOrder?.filter((col) => col !== columnToRemove) || []
		}));
	};

	const moveColumn = (index: number, direction: "up" | "down") => {
		const columns = [...(config.columnOrder || [])];
		if (direction === "up" && index > 0) {
			[columns[index], columns[index - 1]] = [
				columns[index - 1],
				columns[index]
			];
		} else if (direction === "down" && index < columns.length - 1) {
			[columns[index], columns[index + 1]] = [
				columns[index + 1],
				columns[index]
			];
		}
		setConfig((prev) => ({ ...prev, columnOrder: columns }));
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configuration</CardTitle>
				<CardDescription>
					Configure property sets to include in reports and column
					ordering
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{showSaved && (
					<Alert>
						<AlertDescription>
							Configuration saved successfully!
						</AlertDescription>
					</Alert>
				)}

				{/* Recursive Search Option */}
				<div className="space-y-2">
					<Label>Search Options</Label>
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="recursive"
							checked={config.recursive || false}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									recursive: e.target.checked
								}))
							}
							className="rounded border-gray-300"
						/>
						<Label htmlFor="recursive">
							Search recursively in subfolders
						</Label>
					</div>
				</div>

				{/* Property Set Names */}
				<div className="space-y-3">
					<Label>Property Set Names to Include</Label>
					<div className="flex gap-2">
						<Input
							placeholder="Enter pset name (e.g., Pset_WallCommon)"
							value={newPsetName}
							onChange={(e) => setNewPsetName(e.target.value)}
							onKeyPress={(e) =>
								e.key === "Enter" && addPsetName()
							}
						/>
						<Button onClick={addPsetName} variant="outline">
							Add
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{config.psetNames?.map((name) => (
							<Badge
								key={name}
								variant="secondary"
								className="cursor-pointer"
								onClick={() => removePsetName(name)}>
								{name} ×
							</Badge>
						))}
						{(!config.psetNames ||
							config.psetNames.length === 0) && (
							<p className="text-sm text-muted-foreground">
								No property sets configured. Add "*" to include
								all properties.
							</p>
						)}
					</div>
				</div>

				{/* Column Order */}
				<div className="space-y-3">
					<Label>Excel Column Order</Label>
					<Button
						onClick={addColumnOrder}
						variant="outline"
						size="sm">
						Add Column
					</Button>
					<div className="space-y-2">
						{config.columnOrder?.map((column, index) => (
							<div
								key={column}
								className="flex items-center gap-2 p-2 border rounded">
								<span className="flex-1">{column}</span>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => moveColumn(index, "up")}
									disabled={index === 0}>
									↑
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => moveColumn(index, "down")}
									disabled={
										index ===
										(config.columnOrder?.length || 0) - 1
									}>
									↓
								</Button>
								<Button
									size="sm"
									variant="destructive"
									onClick={() => removeColumnOrder(column)}>
									×
								</Button>
							</div>
						))}
						{(!config.columnOrder ||
							config.columnOrder.length === 0) && (
							<p className="text-sm text-muted-foreground">
								Default columns: Object Name, Model Name, Model
								Path
							</p>
						)}
					</div>
				</div>

				<Button onClick={handleSave} className="w-full">
					Save Configuration
				</Button>
			</CardContent>
		</Card>
	);
}
