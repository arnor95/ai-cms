# User Flow Documentation

This document outlines the step-by-step journey that users take through the AI CMS system when creating a restaurant website.

## Overview

The AI CMS guides users through a structured, multi-step process to collect information, generate a sitemap, create a brand guide, and ultimately build a complete restaurant website. The process is designed to be intuitive, with a clear progression and visual feedback on progress.

```
Restaurant Info → Sitemap Generation → Brand Guide Selection → Website Generation
```

## Detailed User Journey

### 1. Landing Page - Restaurant Information Collection

**URL:** `/` (index.tsx)

The user begins on the landing page, which presents a stepper component showing all stages of the process. The initial step focuses on collecting fundamental information about the restaurant.

#### Step 1: Basic Information
- Enter restaurant name
- Provide a description of the restaurant
- Input the restaurant's location
- Click "Next" to proceed

#### Step 2: Menu and Hours
- Enter menu information (formatted text with sections for appetizers, main courses, etc.)
- Input opening hours for different days of the week
- Click "Next" to proceed

#### Step 3: Contact Information
- Enter phone number (required)
- Provide email address (required)
- Add social media information
- Click "Generate Sitemap" to proceed

**Data Storage:** All information is stored in `sessionStorage` under two keys:
- `businessName`: The restaurant name
- `restaurantData`: A JSON object containing all entered information

### 2. Sitemap Page - View and Edit Sitemap

**URL:** `/sitemap` (sitemap.tsx)

After submitting the restaurant information, the user is automatically redirected to the sitemap page, where they can view and edit the AI-generated sitemap.

#### Sitemap Structure
- Pages are represented as cards (e.g., Home, About, Menu, Contact)
- Each page contains sections with descriptions
- Visual representation of the hierarchical structure

#### Editing Functionality
- Add new pages to the sitemap
- Remove existing pages
- Add sections to pages
- Edit section names and descriptions
- Rearrange sections within pages

**User Actions:**
- Make any desired changes to the sitemap
- Click "Continue" to proceed to the brand guide

**Data Storage:** The edited sitemap is stored in `sessionStorage` under the key `sitemap`

### 3. Brand Guide Page - Select Visual Style

**URL:** `/brand` (brand.tsx)

After finalizing the sitemap, the user proceeds to the brand guide page, where they can define the visual identity of their website.

#### Color Palette Selection
- Choose from predefined color palettes:
  - Classic (warm browns and beige)
  - Modern (bold blues, oranges, reds)
  - Natural (earthy greens and browns)
  - Vibrant (blues, reds, and teals)
- Option to generate a custom palette using AI (future enhancement)

#### Typography Selection
- Select from font pairings optimized for different styles:
  - Playfair Display & Montserrat (classic pairing)
  - Oswald & Open Sans (modern pairing)

**User Actions:**
- Select preferred color palette
- Choose preferred typography pairing
- Click "Continue" to proceed to website generation

**Data Storage:** The selected brand guide options are stored in `sessionStorage` under the key `brandGuide`

### 4. Website Generation Page - Create the Website

**URL:** `/website` (website.tsx)

The final step is the website generation page, where all collected information is combined to create a complete website.

#### Data Overview
- Summary of restaurant information
- Sitemap structure overview
- Brand guide selections displayed

#### Generation Process
- Click "Start Website Generation" to begin
- System displays a loading indicator during processing
- Upon completion, success message is displayed

**User Actions:**
- Review collected data
- Initiate website generation
- View generated website (future enhancement)

## Navigation and Flow Control

The user flow includes several built-in navigation and control mechanisms:

1. **Progress Tracking:** The stepper component at the top of each page shows progress through the workflow
2. **Back Navigation:** Each page includes a "Back" button to return to the previous step
3. **Data Validation:** Required fields are validated before proceeding to the next step
4. **Form Prefill:** Test data can be loaded with one click for quick testing
5. **Error Handling:** Clear error messages if any step fails
6. **Session Persistence:** All data is preserved in `sessionStorage` to prevent loss during page navigation

## Edge Cases and Error Handling

The application includes handling for various edge cases:

1. **Missing Data:** If a user navigates directly to a later page without completing earlier steps, they are redirected to the appropriate starting point
2. **API Failures:** If the AI sitemap generation fails, a fallback simple sitemap is provided
3. **Timeout Handling:** Long-running operations have timeouts with appropriate error messages
4. **Incomplete Information:** Form validation prevents progression without required fields

## Future Enhancements

Planned enhancements to the user flow include:

1. **AI-Generated Custom Color Palettes:** Allow the system to generate custom color palettes based on restaurant description and style preferences
2. **Interactive Website Preview:** Add real-time preview of the generated website during the building process
3. **Content Editing:** Enable editing of generated website content after creation
4. **Save/Load Progress:** Allow users to save their progress and return later to continue 