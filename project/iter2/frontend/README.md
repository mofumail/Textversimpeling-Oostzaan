# Prototype Iteration 2: Dutch Municipal Writer - Office Add-in

This is the **prototype of iteration 2** for the Word Add-in designed to assist with writing municipal documents. It detects complex language and suggests simplifications.

## Features
- **Complexity Analysis**: Highlights difficult words and passive voice.
- **Sidebar Interface**: Review and apply suggestions one by one.
- **Live/Advisory Modes**: Choose between continuous checking or manual triggers.

## Setup

### Prerequisites
- Node.js (v18+)
- Microsoft Word

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd plugin/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Development Server

```bash
npm run dev
```
The server will start at `https://localhost:3000`.

### Sideloading (Mac)
1. Copy `manifest.xml` to the Word WEF folder:
   ```bash
   cp manifest.xml ~/Library/Containers/com.microsoft.Word/Data/Documents/wef/
   ```
2. Restart Word.
3. Go to **Insert > Add-ins > My Add-ins**.
4. Select **Dutch Municipal Writer** from the Developer/Shared folder dropdown if available, or it might appear automatically in the "My Add-ins" list under "Developer" or "Shared".

*(Note: Sideloading on Mac can be tricky. Refer to [Microsoft's documentation](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing) for the latest steps.)*

### Sideloading (Windows)

1. **Share the extracted folder**:
   - Navigate to the `plugin/frontend` folder in File Explorer.
   - Right-click the folder > **Properties** > **Sharing** > **Share**.
   - Share with yourself or "Everyone" and note the **Network Path** (e.g., `\\Desktop-Name\Users\You\...\plugin\frontend`).

2. **Add as Trusted Catalog**:
   - Open Word on Windows.
   - Go to **File > Options > Trust Center > Trust Center Settings > Trusted Add-in Catalogs**.
   - In "Catalog Url", paste the **Network Path** you copied.
   - Click **Add Catalog**.
   - Check the **"Show in Menu"** box for the new item.
   - Click **OK** twice to save and close.

3. **Load the Add-in**:
   - Restart Word.
   - Go to **Insert > My Add-ins**.
   - Click on **SHARED FOLDER**.
   - Select **Dutch Municipal Writer** and click **Add**.

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