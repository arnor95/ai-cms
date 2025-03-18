# API Endpoints Documentation

This document provides details about the API endpoints available in the AI CMS application, including their purpose, request/response formats, and error handling mechanisms.

## Overview

The AI CMS application uses several API endpoints to handle the generation of sitemaps, brand guides, and website code. These endpoints act as bridges between the frontend React application and the Python-based AI agents.

## Endpoint Details

### Generate Sitemap

**Path:** `/api/generate-sitemap`

**Method:** POST

**Purpose:** Generate a sitemap structure based on restaurant information using Claude AI.

**Request Format:**
```json
{
  "name": "Restaurant Name",
  "description": "Description of the restaurant...",
  "menu": "Menu details...",
  "location": "Address",
  "openingHours": "Opening hours information",
  "phone": "Phone number",
  "email": "contact@email.com",
  "socialMedia": "Social media details"
}
```

**Response Format:**
```json
{
  "success": true,
  "sitemap": {
    "Home": [
      { "type": "Hero Section", "description": "Showcase the restaurant" },
      { "type": "Featured Menu Items", "description": "Highlight popular dishes" }
    ],
    "About": [
      { "type": "Story", "description": "History of the restaurant" }
    ],
    // Other pages and sections
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

**Error Handling:**
- Returns 405 status if method is not POST
- Returns 400 status if required fields are missing
- Returns 500 status for server errors or AI generation failures
- Falls back to a default sitemap if AI generation fails

**Implementation Notes:**
- Uses the Python script at `agents/sitemap_agent.py`
- Passes restaurant data to the script as command-line arguments
- Has a 60-second timeout to prevent hanging requests
- Logs detailed debugging information throughout the process
- Handles errors from the Python script execution
- Saves the generated sitemap to sessionStorage on the client side

### Generate Website

**Path:** `/api/generate-website`

**Method:** POST

**Purpose:** Generate a complete website based on the sitemap, brand guide, and restaurant information.

**Request Format:**
```json
{
  "input_data": {
    "name": "Restaurant Name",
    "description": "Restaurant description",
    "menu": "Menu details",
    "location": "Address",
    "openingHours": "Hours information",
    "phone": "Contact number",
    "email": "Email address",
    "socialMedia": "Social media links"
  },
  "sitemap": {
    "Home": [
      { "type": "Hero", "description": "Main hero section" }
    ],
    // Other pages and sections
  },
  "style_guide": {
    "palette": {
      "name": "Classic",
      "colors": ["#8B4513", "#A0522D", "#CD853F", "#F5DEB3", "#FFFAF0"]
    },
    "fontPair": "Playfair Display & Montserrat"
  }
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Website generated successfully",
  "previewUrl": "/preview/restaurant-name" // Future enhancement
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

**Error Handling:**
- Returns 405 status if method is not POST
- Returns 400 status if required data is missing
- Includes detailed logging for troubleshooting

**Implementation Notes:**
- Currently returns a simulated success response
- Future implementation will execute the `code_action_agent.py` Python script
- Will save input data to JSON files for the Python agent to process
- Will handle execution of the Python script and read its output

## Common API Patterns

All API endpoints in the application follow these common patterns:

### Method Validation

Each endpoint validates the HTTP method:

```typescript
if (req.method !== 'POST') {
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
```

### Request Parsing

Safely parse the request body:

```typescript
try {
  const data = req.body;
  // Process data
} catch (error) {
  console.error("[ERROR] Failed to parse request body:", error);
  return res.status(400).json({ success: false, message: 'Invalid request body' });
}
```

### Logging

Extensive logging for debugging:

```typescript
console.log("[DEBUG] Starting API handler");
// Process request
console.log("[DEBUG] Operation completed successfully");
```

### Error Handling

Consistent error response format:

```typescript
try {
  // Operation that might fail
} catch (error) {
  console.error("[ERROR] Operation failed:", error);
  return res.status(500).json({ 
    success: false, 
    message: `Operation failed: ${error instanceof Error ? error.message : String(error)}` 
  });
}
```

### Response Format

Consistent success response format:

```typescript
return res.status(200).json({
  success: true,
  data: resultData
});
```

## Python Script Integration

The API endpoints integrate with Python scripts as follows:

1. Prepare data for the Python script
2. Execute the script using the `pythonRunner.ts` middleware
3. Handle the script's output
4. Return the results to the client

Example of script execution:

```typescript
import { runPythonScript } from '@/middleware/pythonRunner';

// In the API handler
const scriptResult = await runPythonScript(
  scriptPath,
  [arg1, arg2],
  outputPath
);

if (!scriptResult.success) {
  return res.status(500).json({ 
    success: false, 
    message: `Python script execution failed: ${scriptResult.error}` 
  });
}
```

## Future API Endpoints

Additional endpoints planned for future implementation:

1. **Update Website Content** - For modifying website content after generation
2. **Generate Custom Color Palette** - AI generation of color palettes based on restaurant theme
3. **Website Preview** - For retrieving a preview of the generated website 