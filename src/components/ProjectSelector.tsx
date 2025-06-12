import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";

interface ProjectSelectorProps {
	onSearch: (folderName: string) => void;
	loading: boolean;
	disabled: boolean;
}

export function ProjectSelector({
	onSearch,
	loading,
	disabled
}: ProjectSelectorProps) {
	const [folderName, setFolderName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (folderName.trim()) {
			onSearch(folderName.trim());
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Search for IFC Files</CardTitle>
				<CardDescription>
					Enter the folder name to search for IFC files within your
					project
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="folderName">Folder Name</Label>
						<Input
							id="folderName"
							type="text"
							placeholder="Enter folder name..."
							value={folderName}
							onChange={(e) => setFolderName(e.target.value)}
							disabled={disabled}
							className="w-full"
						/>
					</div>
					<Button
						type="submit"
						disabled={disabled || loading || !folderName.trim()}
						className="w-full">
						{loading ? "Searching..." : "Search IFC Files"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
