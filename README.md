# AI CMS

AI-powered CMS that creates unique, responsive websites using AI-driven layouts and modular components.

## Overview

This project uses a modular workflow to generate websites:
- SitemapAgent generates a sitemap
- BrandGuideAgent creates a brand guide
- CodeActionAgent builds the website using these inputs

## Tech Stack

- **Languages**: Python (agents), TypeScript (frontend)
- **Frameworks/Libraries**:
  - Next.js (App Router, TypeScript)
  - Tailwind CSS
  - Shadcn UI
  - Fontsource
  - Transformers
  - Claude API
- **Tools**: Docker, npm, Git

## Setup

1. **Clone the repository**
   ```
   git clone https://github.com/arnor95/ai-cms.git
   cd ai-cms
   ```

2. **Using Docker**
   ```
   docker build -t ai-cms:latest .
   docker run -it --rm -p 3000:3000 ai-cms:latest bash
   ```

3. **Manual Setup**
   ```
   npm install
   npm run dev
   ```

## Project Structure

- `/agents`: Python agents for sitemap and brand guide generation
- `/docs`: Project documentation
- `/src`: Next.js application
  - `/app`: App Router pages
  - `/components`: React components
  - `/templates`: Template inspirations

## Development Workflow

1. Generate sitemap with SitemapAgent
2. Create brand guide with BrandGuideAgent
3. Build website with CodeActionAgent using the sitemap and brand guide 