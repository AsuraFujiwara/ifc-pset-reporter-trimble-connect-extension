# Trimble Connect IFC Explorer Extension

A modern React-based extension for Trimble Connect that allows users to search and explore IFC (Industry Foundation Classes) files within their projects. This extension replaces the original PowerShell script functionality with a web-based interface.

## Features

-   **Project Integration**: Seamlessly integrates with Trimble Connect projects as a project extension
-   **IFC File Search**: Search for IFC files by folder name within your project structure
-   **Object Hierarchy**: Explore detailed IFC object hierarchies with type information
-   **Modern UI**: Built with React, TypeScript, Vite, and Shadcn/ui for a responsive, modern interface
-   **Real-time Feedback**: Loading states, error handling, and progress indicators

## Technology Stack

-   **Frontend**: React 19 with TypeScript
-   **Build Tool**: Vite 6
-   **UI Components**: Shadcn/ui with TailwindCSS
-   **API Integration**: Trimble Connect Workspace API
-   **Package Manager**: pnpm

## Original PowerShell Script Functionality

This extension converts the original PowerShell script `FetchIFC.ps1` functionality to a modern web extension:

### Original Script Features Converted:

-   ✅ Project connection and authentication
-   ✅ Folder search by name
-   ✅ IFC file discovery and listing
-   ✅ Object hierarchy exploration
-   ✅ Detailed trace logging (now as browser console logs)
-   ✅ Error handling and user feedback

### PowerShell Script Comparison:

-   **Original**: Command-line interface with PowerShell parameters
-   **Extension**: Web-based UI with form inputs and interactive components
-   **Original**: Bearer token parameter required
-   **Extension**: Automatic authentication through Trimble Connect
-   **Original**: Console output with trace information
-   **Extension**: Modern UI with cards, accordions, and progress indicators

## Installation

### As a Trimble Connect Extension

1. Build the project:

    ```bash
    pnpm install
    pnpm run build
    ```

2. Deploy the `dist` folder contents to a web server

3. Create an extension manifest file pointing to your deployed extension

4. Install the extension in Trimble Connect:
    - Go to Project Settings → Extensions
    - Add the manifest URL
    - Enable the extension

### Development

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd extension
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Start the development server:
    ```bash
    pnpm run dev
    ```

## Usage

1. **Connect to Project**: The extension automatically connects to the current Trimble Connect project
2. **Search for Folders**: Enter a folder name (e.g., "IFC", "Models") to search for IFC files
3. **Explore Files**: View found IFC files with their details (name, size, path)
4. **View Objects**: Click "Load Objects" to explore the IFC object hierarchy
5. **Examine Details**: Expand object trees to see detailed IFC element information

## API Integration

The extension uses the Trimble Connect Workspace API for:

-   **Authentication**: Automatic token management and permission requests
-   **Project Access**: Current project information and folder structure
-   **File Operations**: IFC file discovery and metadata retrieval
-   **Viewer Integration**: Object hierarchy and property access

## Configuration

The extension manifest (`public/manifest.json`) can be customized:

```json
{
	"title": "IFC Explorer Extension",
	"icon": "/vite.svg",
	"url": "/index.html",
	"description": "Search and explore IFC files...",
	"configCommand": "configure_extension",
	"enabled": true
}
```

## Development Notes

### Mock Data

Currently includes mock data for demonstration purposes. In production, replace mock implementations in `TrimbleConnectService` with actual API calls based on the specific Trimble Connect Workspace API version and available methods.

### API Limitations

Some PowerShell script functionality is currently implemented with placeholders due to:

-   API documentation gaps
-   Version-specific method availability
-   Permission requirements

### Future Enhancements

-   Real-time file processing status
-   Advanced filtering and search options
-   Property editing capabilities
-   Integration with 3D viewer
-   Export functionality

## Building for Production

```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

The built files will be in the `dist` directory, ready for deployment.

## Browser Support

-   Modern browsers with ES2020 support
-   Runs within Trimble Connect for Browser environment
-   Responsive design for various screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Specify your license here]

## Support

For issues related to:

-   **Extension functionality**: Create an issue in this repository
-   **Trimble Connect API**: Contact [connect-support@trimble.com](mailto:connect-support@trimble.com)
-   **Original PowerShell script**: Reference the `FetchIFC.ps1` file in the parent directory
