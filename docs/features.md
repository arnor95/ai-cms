# Features Documentation

This document provides detailed information about the implemented features in the AI CMS project, their current status, and how they work.

## Core Features

### Multi-Step Restaurant Information Collection

**Status:** Implemented ✅

The system guides users through a multi-step form to collect detailed information about their restaurant:

1. **Basic Information**: Name, description, and location
2. **Menu & Hours**: Menu items and operating hours
3. **Contact Information**: Phone, email, and social media links

The form includes:
- Field validation to ensure required information is provided
- Progress tracking via a stepper component
- Option to pre-fill with test data for quick testing
- Responsive design that works on different screen sizes

All collected data is stored in `sessionStorage` to persist between page navigations and is used for subsequent steps in the website generation process.

### AI-Powered Sitemap Generation

**Status:** Implemented ✅

The system generates a comprehensive sitemap for the restaurant website using Claude AI:

1. Collected restaurant data is sent to the `/api/generate-sitemap` endpoint
2. The API calls the Python-based `sitemap_agent.py` which uses the Claude API
3. The agent analyzes the restaurant information and generates an appropriate sitemap structure
4. A fallback simple agent (`sitemap_agent_simple.py`) is available if AI generation fails
5. The generated sitemap is returned to the frontend and stored in `sessionStorage`

The sitemap includes:
- Recommended pages (Home, About, Menu, Contact, etc.)
- Suggested sections for each page based on restaurant type and offerings
- Descriptions of content for each section

### Sitemap Editing

**Status:** Implemented ✅

Users can view and edit the AI-generated sitemap:

1. The `sitemap.tsx` page displays the complete sitemap structure
2. Users can add, remove, or edit pages
3. For each page, users can add, remove, or edit sections
4. Changes are stored in `sessionStorage` for use in website generation

The editing interface includes:
- Visual representation of sitemap hierarchy
- Form controls for modifying page and section names/descriptions
- Preview of the complete sitemap structure

### Brand Guide Creation

**Status:** Implemented ✅

The brand guide feature allows users to define the visual identity of their website:

1. The `brand.tsx` page presents color palette options and typography choices
2. Users can select from predefined color palettes (Classic, Modern, Natural, Vibrant)
3. Typography options include font pairings optimized for different styles
4. Selected options are stored in `sessionStorage` as the brand guide

Future enhancement: AI-powered custom palette generation based on restaurant description.

### Website Generation

**Status:** Partially Implemented ⚠️

The website generation feature combines all collected data to create a complete website:

1. The `website.tsx` page displays a summary of collected data (restaurant info, sitemap, brand guide)
2. Users can initiate the website generation process with a single click
3. The API at `/api/generate-website` will process the data and generate the website code
4. Generated website includes all pages from the sitemap, styled according to the brand guide

Current limitations:
- Backend code generation is simulated (returns mock response)
- Actual Python agent for code generation is pending implementation
- Preview functionality for generated website is not yet implemented

### Environment Variable Handling

**Status:** Implemented ✅

The project includes robust environment variable handling for API keys:

1. Anthropic API key is stored in `.env` file
2. Environment variables are properly passed to Python scripts
3. Middleware checks for necessary environment variables
4. Error handling for missing API keys with appropriate fallbacks

### Cross-Page Data Persistence

**Status:** Implemented ✅

To maintain a seamless user experience across the multi-page workflow:

1. All user data is stored in `sessionStorage` with appropriate keys:
   - `businessName`: Restaurant name
   - `restaurantData`: Complete restaurant information object
   - `sitemap`: Generated and edited sitemap structure
   - `brandGuide`: Selected brand guide options
2. Each page checks for required data and redirects if necessary
3. Debug logging tracks data persistence for troubleshooting

## UI Components

### Stepper Component

**Status:** Implemented and Fixed ✅

A visual stepper component shows progress through the website creation workflow:

1. Displays 6 steps: Basic Info, Menu, Contact, Sitemap, Style, Complete
2. Highlights the current step and marks completed steps
3. Connecting lines show progress through the workflow
4. Properly aligned using CSS Grid for consistent spacing

Recent fix: Updated to use CSS Grid layout to ensure proper alignment of steps and connecting lines.

### Card-Based UI

**Status:** Implemented ✅

The application uses a card-based UI for organizing content:

1. Each step is presented in a card with consistent header, content, and footer
2. Cards use shadcn UI components for styling
3. Responsive design adapts to different screen sizes

### Form Components

**Status:** Implemented ✅

Custom form components with consistent styling:

1. Input fields with labels and placeholders
2. Textarea for longer text content
3. Button components with different variants (primary, outline)
4. Loading indicators for async operations

## Technical Features

### Python Script Execution

**Status:** Implemented ✅

The system can execute Python scripts and capture their output:

1. `pythonRunner.ts` middleware handles script execution
2. Environment variables are passed to Python processes
3. Execution is async with appropriate timeout handling
4. Multiple Python command formats are supported (python3, python, py)

### Error Handling

**Status:** Implemented ✅

Comprehensive error handling throughout the application:

1. API endpoint errors are captured and returned with appropriate status codes
2. Frontend displays error messages to users when operations fail
3. Timeout handling prevents hanging requests
4. Fallback mechanisms when AI operations fail

### Logging

**Status:** Implemented ✅

Extensive logging for debugging and monitoring:

1. Python scripts include detailed logging of execution steps
2. Frontend logs data handling operations
3. API endpoints log request processing
4. Error conditions are logged with context for troubleshooting

## Planned Features

### Code Generation Agent

**Status:** Planned 📋

The final step will be implementing the AI-powered code generation agent that:

1. Takes the sitemap, brand guide, and restaurant data as input
2. Generates complete Next.js website code
3. Creates a CMS for content management
4. Produces deployable website code

### Website Preview

**Status:** Planned 📋

A preview feature will allow users to view their generated website:

1. Real-time preview of website appearance
2. Interactive navigation of pages
3. Mobile/desktop responsive view toggle 