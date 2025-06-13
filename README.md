# Trimble Connect IFC PSet Reporter

A Trimble Connect extension for generating IFC property set reports. This extension allows users to search for IFC files in a Trimble Connect project and generate comprehensive Excel reports containing object properties and property sets.

## Features

-   **Folder Search**: Search for IFC files in specific folders within your Trimble Connect project
-   **Recursive Search**: Option to search recursively through subfolders
-   **Property Set Filtering**: Configure which property sets to include in reports
-   **Excel Export**: Generate detailed Excel reports with customizable column ordering
-   **Status Monitoring**: Real-time connection status to Trimble Connect
-   **Local Configuration**: Settings are saved locally in the browser

## How to Use

1. **Connection**: The extension automatically connects to Trimble Connect when loaded
2. **Search**: Enter a folder name and click "Search" to find IFC files
3. **Configure** (Optional): Use the Configuration tab to:
    - Enable/disable recursive searching
    - Specify which property sets to include
    - Set the order of columns in the Excel report
4. **Generate Report**: Click "GENERATE REPORT" to create and download an Excel file

## Technical Details

### Build Configuration

-   Built using Vite + React + TypeScript
-   Output directory: `docs/` (for GitHub Pages compatibility)
-   Base URL: `https://asurafujiwara.github.io/ifc-pset-reporter-trimble-connect-extension/`

### APIs Used

-   **Trimble Connect Workspace API**: For project and viewer access
-   **Trimble Connect REST API**: For folder navigation and model data
-   **Model API**: For retrieving IFC entities and properties

### Development

```bash
# Install dependencies
pnpm install

# Development server
pnpm run dev

# Build for production
pnpm run build

# Type checking
pnpm run type-check
```

## Extension Manifest

The extension includes a `manifest.json` file that describes it as a Trimble Connect extension with the following permissions:

-   `project:read` - Access to project information
-   `viewer:read` - Access to viewer and model data
-   `model:read` - Access to model entities and properties

## Configuration Options

-   **Recursive Search**: When enabled, searches all subfolders for IFC files
-   **Property Set Names**: List of property set names to include in reports (e.g., "Pset_WallCommon", "Pset_SlabCommon")
-   **Column Order**: Customize the order of columns in the generated Excel report

## Report Format

The generated Excel report includes:

-   **Object Name**: Name of the IFC object
-   **Model Name**: Name of the IFC file
-   **Model Path**: Folder path to the IFC file
-   **Property Values**: All configured property set values as additional columns

## License

This project is private and proprietary.
