# Frontend Source Code (`src`)

This directory contains the source code for the frontend of the Word plugin.

## Directory Structure

- **assets/**: Contains static assets such as images and icons used throughout the application.
- **components/**: Contains the React components that make up the plugin's user interface.
  - `App.tsx`: The core component containing the main logic and layout of the plugin task pane.
  - `SettingsView.tsx`: View component for configuration and settings.
  - `SimplifyView.tsx`: View component for the text simplification workflow.
  - `SuggestionCard.tsx` & `SuggestionList.tsx`: Components responsible for rendering individual suggestions and lists of suggestions.
- **context/**: React Context definitions used for global state management across the application.
- **data/**: Static data resources, including `jargon.json` used for text analysis rules.
- **services/**: Business logic and integration layers.
  - `analysisService.ts`: Logic for analyzing text against jargon and complexity rules.
  - `wordService.ts`: Wrapper functions and utilities for interacting with the Microsoft Word JavaScript API.

## Key Files

- **main.tsx**: The entry point of the React application, mounting the root component to the DOM.
- **App.tsx**: The root wrapper component for the application.
- **theme.ts**: UI theme definitions, likely configuring Fluent UI or similar design systems.
- **index.css**: Global stylesheets.
- **App.css**: Styles specific to the App component.
