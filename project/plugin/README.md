# Dutch Municipal Writer Plugin

This directory contains the frontend plugin code for the Dutch Municipal Writer, a Word Add-in that helps users write clearer, B1-level texts compliant with municipal style guides.

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v18 or higher) & **npm**
- **Microsoft Word** (Desktop or Web) for testing the add-in.
- **LM Studio** (running in Server mode) to provide AI capabilities.

## Getting Started

### Frontend Setup

The project consists of a React-based Word Add-in.

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev -- --port 3000
    ```

## AI Server Configuration (LM Studio)

This plugin requires **LM Studio** to perform text rewriting and advanced analysis. It connects to the local inference server.

1.  **Install LM Studio**: Download and install from [lmstudio.ai](https://lmstudio.ai).
2.  **Load Model**: Search for and download the **uaebn/leesplank-municipal-GGUF** model.
3.  **Load into Server**: 
    - Go to the "Local Inference Server" tab (or "Developer" tab).
    - Select the downloaded `uaebn/leesplank-municipal-GGUF` model.
    - **Crucial**: Ensure the loaded model's identifier is set to **`leesplank-municipal`**. The plugin code explicitly requests this model name.
4.  **Start Server**: Click "Start Server". ensure it is running on `http://localhost:1234` (default).

The frontend is configured (via `vite.config.ts`) to proxy requests from `/lm-studio` to `http://127.0.0.1:1234/v1`.

## How to Run in Word

1.  **Sideload the Add-in**:
    - **Word on the Web**: Go to Insert > Add-ins > Manage My Add-ins > Upload My Add-in. Select the `manifest.xml` file located in the `frontend` folder (if available).
    - **Word Desktop (Mac/Windows)**: Follow Microsoft's official guide on [sideloading Office Add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/test-debug-office-add-ins).

2.  **Verify Connection**:
    - Open the task pane in Word.
    - Ensure LM Studio server is running with the correct model.
    - Select text and try the "Simplify" feature to test usage of the model.