# Dutch Municipal Writer - Office Add-in

This is a Word Add-in designed to assist with writing municipal documents. It detects complex language and suggests simplifications.

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

## Deployment
Build the project for production:
```bash
npm run build
```
The output will be in `dist/`. You can host these static files on any HTTPS-enabled web server (Azure Static Web Apps, Vercel, etc.). Update the URLs in `manifest.xml` to point to your production details.
