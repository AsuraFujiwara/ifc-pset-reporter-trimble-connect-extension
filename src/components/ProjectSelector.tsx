import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
		<div className="flex gap-2">
			<Input
				type="text"
				placeholder="Type in folder name"
				value={folderName}
				onChange={(e) => setFolderName(e.target.value)}
				disabled={disabled}
				className="flex-1"
				onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
			/>
			<Button
				onClick={handleSubmit}
				disabled={disabled || loading || !folderName.trim()}>
				{loading ? "Searching..." : "Search"}
			</Button>
		</div>
	);
}
