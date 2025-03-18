Project Overview
The Website Generator is an AI-powered tool designed to create complete, production-ready websites in one shot for businesses (e.g., restaurants, portfolios, small businesses) based on minimal inputs (business name, description, logo, brand colors). It includes a CMS for post-generation edits and leverages pre-configured dependencies to eliminate installation overhead per client.
Goals
Generate responsive websites using customizable templates.

Integrate a CMS for easy content updates.

Avoid reinstalling dependencies for each client using containerization.

Deliver production-ready code in a single pass.

Key Features
Input Handling: Accepts business name, description, logo (base64), and brand colors.

Template Customization: AI selects and adapts templates (e.g., restaurant, portfolio) based on inputs.

CMS Integration: Provides a simple JSON-based CMS with API and edit interface.

One-Shot Generation: Produces a full Next.js website without per-client setup.

Deployment Ready: Supports static export or dynamic hosting.

Architecture
Containerized Environment: A Docker container pre-installs Next.js, Tailwind CSS, and Shadcn UI.

CodeActionAgent: A Python-based agent analyzes inputs, customizes templates, and generates code.

Output: A Next.js project in /src with CMS, ready for deployment.

Data Flow
Input: JSON data (e.g., { "name": "Restaurant X", "description": "Icelandic cuisine", "logo": "base64string", "colors": { "primary": "#FF5733", "secondary": "#33FF57" } }).

Processing: Agent selects a template, updates CMS data, and generates content.

Output: Complete Next.js project with CMS in /src.

Constraints
No per-client dependency installations.

Avoids interactive prompts during build.

Supports basic CMS functionality (text, images).

