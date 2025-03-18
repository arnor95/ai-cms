# Project Structure

This document outlines the structure of the AI CMS project, describing the purpose of key directories and files.

## Directory Organization

```
AI CMS/
├── agents/                  # Python-based AI agents 
│   ├── sitemap_agent.py     # AI agent for sitemap generation
│   ├── sitemap_agent_simple.py # Simplified sitemap generation
│   └── brand_guide_agent.py # AI agent for brand guide generation
│
├── docs/                    # Project documentation
│   ├── designdoc.md         # Overall design document
│   ├── techstack.md         # Technology stack information
│   └── implementation.md    # Implementation plan
│
├── public/                  # Static assets
│
├── src/                     # Source code
│   ├── components/          # React components
│   │   ├── layout/          # Layout components
│   │   ├── sitemap/         # Sitemap-related components
│   │   └── ui/              # UI components (shadcn)
│   │
│   ├── lib/                 # Utility functions and shared code
│   │
│   ├── middleware/          # Middleware components
│   │   └── pythonRunner.ts  # Python script execution handler
│   │
│   ├── pages/               # Page components (Next.js Pages Router)
│   │   ├── api/             # API routes
│   │   │   ├── generate-sitemap.ts  # Sitemap generation API
│   │   │   └── generate-website.ts  # Website generation API
│   │   │
│   │   ├── _app.tsx         # Next.js App component
│   │   ├── brand.tsx        # Brand guide page
│   │   ├── generate.tsx     # Code generation page
│   │   ├── index.tsx        # Homepage with multi-step form
│   │   ├── sitemap.tsx      # Sitemap display/edit page
│   │   └── website.tsx      # Website generation page
│   │
│   └── styles/              # CSS and styling files
│       └── globals.css      # Global CSS styles
│
├── .env                     # Environment variables
└── package.json             # Project dependencies and scripts
```

## Key Files and Their Purpose

### Agents

- `sitemap_agent.py`: Claude AI-powered agent that generates a sitemap structure based on restaurant data
- `brand_guide_agent.py`: Agent for generating brand guides with color palettes and typography choices

### Pages

- `index.tsx`: Multi-step form for collecting restaurant information
- `sitemap.tsx`: Displays and allows editing of the generated sitemap
- `brand.tsx`: Allows selection of brand guide elements (colors, typography)
- `website.tsx`: Final step to generate the complete website based on collected data

### API Routes

- `generate-sitemap.ts`: API endpoint that calls the Python sitemap agent
- `generate-website.ts`: API endpoint for generating the full website

### Components

- `sitemap/SitemapDisplay.tsx`: Component for displaying the sitemap structure
- `layout/Layout.tsx`: Main layout component with header and footer

### Middleware

- `pythonRunner.ts`: Utility for executing Python scripts and managing their environment variables

## Data Flow

1. User inputs restaurant data via the multi-step form (`index.tsx`)
2. Data is stored in `sessionStorage` for use across pages
3. Sitemap is generated via AI and stored in `sessionStorage`
4. Brand guide options are selected and stored in `sessionStorage`
5. All data is combined and sent to generate the final website 