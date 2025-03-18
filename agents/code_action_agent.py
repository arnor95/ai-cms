#!/usr/bin/env python3
"""
Code Action Agent - Generates website code based on sitemap and brand guide.
"""

import json
import os
import sys
import shutil
from typing import Dict, List, Optional, Any, Tuple

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not found. Please install it with 'pip install anthropic'")
    sys.exit(1)

class CodeActionAgent:
    """
    Agent responsible for generating website code based on sitemap and brand guide.
    """
    
    def __init__(self, api_key: str):
        """
        Initialize the CodeActionAgent.
        
        Args:
            api_key: The Anthropic API key
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.sitemap_file = "sitemap.json"
        self.brand_guide_file = "brand-guide.json"
        self.output_dir = "src"
        self.components_dir = os.path.join(self.output_dir, "components")
        self.sections_dir = os.path.join(self.components_dir, "sections")
        self.pages_dir = os.path.join(self.output_dir, "app")
        self.templates_dir = os.path.join(self.output_dir, "templates")
        
        # Ensure output directories exist
        os.makedirs(self.sections_dir, exist_ok=True)
        os.makedirs(self.pages_dir, exist_ok=True)
        os.makedirs(self.templates_dir, exist_ok=True)
    
    def generate_website(self) -> bool:
        """
        Generate website code based on sitemap and brand guide.
        
        Returns:
            bool: True if the generation was successful, False otherwise
        """
        # Load sitemap and brand guide
        sitemap = self._load_json(self.sitemap_file)
        brand_guide = self._load_json(self.brand_guide_file)
        
        if not sitemap or not brand_guide:
            print("Error: Could not load sitemap or brand guide")
            return False
        
        # Create brand-specific components and UI library based on brand guide
        if not self._generate_ui_components(brand_guide):
            print("Warning: Failed to generate UI components")
        
        # Generate sections for each page
        for page_name, sections in sitemap.items():
            page_filename = self._page_name_to_filename(page_name)
            
            # Create directory for page if it doesn't exist
            page_dir = os.path.join(self.pages_dir, page_filename)
            os.makedirs(page_dir, exist_ok=True)
            
            # Generate sections for the page
            page_sections = []
            for section in sections:
                section_component = self._generate_section(section, brand_guide)
                if section_component:
                    page_sections.append((section["type"], section_component))
            
            # Generate the page itself
            if not self._generate_page(page_name, page_sections, page_dir, brand_guide):
                print(f"Warning: Failed to generate page {page_name}")
        
        # Generate default layout for the site
        if not self._generate_layout(brand_guide):
            print("Warning: Failed to generate site layout")
        
        # Generate CMS components for editing
        if not self._generate_cms_components():
            print("Warning: Failed to generate CMS components")
        
        return True
    
    def _load_json(self, file_path: str) -> Dict:
        """
        Load JSON from file.
        
        Args:
            file_path: Path to the JSON file
            
        Returns:
            Dict: The loaded JSON data or an empty dict if loading fails
        """
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            return {}
    
    def _page_name_to_filename(self, page_name: str) -> str:
        """
        Convert a page name to a valid filename.
        
        Args:
            page_name: The name of the page
            
        Returns:
            str: A valid filename for the page
        """
        # Handle special case for homepage
        if page_name.lower() == "home" or page_name.lower() == "homepage":
            return ""
        
        # Convert to lowercase, replace spaces with hyphens
        return page_name.lower().replace(" ", "-")
    
    def _generate_ui_components(self, brand_guide: Dict) -> bool:
        """
        Generate UI components based on the brand guide.
        
        Args:
            brand_guide: The brand guide
            
        Returns:
            bool: True if successful, False otherwise
        """
        # Create a UI directory for brand-specific components
        ui_dir = os.path.join(self.components_dir, "ui")
        os.makedirs(ui_dir, exist_ok=True)
        
        # Generate button component
        button_content = self._generate_component_code(
            "button",
            brand_guide,
            "A styled button component that follows the brand guidelines."
        )
        if button_content:
            self._write_file(os.path.join(ui_dir, "button.tsx"), button_content)
        
        # Generate card component
        card_content = self._generate_component_code(
            "card",
            brand_guide,
            "A styled card component that follows the brand guidelines."
        )
        if card_content:
            self._write_file(os.path.join(ui_dir, "card.tsx"), card_content)
        
        # Generate input component
        input_content = self._generate_component_code(
            "input",
            brand_guide,
            "A styled input component that follows the brand guidelines."
        )
        if input_content:
            self._write_file(os.path.join(ui_dir, "input.tsx"), input_content)
        
        return True
    
    def _generate_section(self, section: Dict, brand_guide: Dict) -> str:
        """
        Generate code for a section component.
        
        Args:
            section: The section definition
            brand_guide: The brand guide
            
        Returns:
            str: The component name or an empty string if generation fails
        """
        section_type = section.get("type", "content")
        section_description = section.get("description", "")
        
        # Check if we already have a pre-built section of this type
        if self._section_exists(section_type):
            return section_type
        
        # Generate a new section
        section_content = self._generate_component_code(
            section_type,
            brand_guide,
            f"A {section_type} section with the following description: {section_description}"
        )
        
        if section_content:
            section_filename = f"{section_type}.tsx"
            self._write_file(os.path.join(self.sections_dir, section_filename), section_content)
            return section_type
        
        return ""
    
    def _section_exists(self, section_type: str) -> bool:
        """
        Check if a section component already exists.
        
        Args:
            section_type: The type of section
            
        Returns:
            bool: True if the section exists, False otherwise
        """
        section_filename = f"{section_type}.tsx"
        return os.path.exists(os.path.join(self.sections_dir, section_filename))
    
    def _generate_page(self, page_name: str, sections: List[Tuple[str, str]], page_dir: str, brand_guide: Dict) -> bool:
        """
        Generate a page component.
        
        Args:
            page_name: The name of the page
            sections: List of (section_type, component_name) tuples
            page_dir: Directory to write the page to
            brand_guide: The brand guide
            
        Returns:
            bool: True if successful, False otherwise
        """
        # Generate the page content using AI
        prompt = f"""
        You are generating a Next.js page component for a page named "{page_name}".
        This page should include the following sections:
        {", ".join([f"{s[0]}" for s in sections])}
        
        The brand guide specifies:
        - Primary color: {brand_guide.get("colors", {}).get("primary", "#000000")}
        - Typography: {brand_guide.get("typography", {}).get("headings", "sans-serif")} for headings
        - UI style: {brand_guide.get("ui_style", "modern")}
        
        Generate a TypeScript React component for this page. Import each section at the top of the file.
        For example:
        ```typescript
        import Hero from '@/components/sections/hero';
        import Features from '@/components/sections/features';
        ```
        
        Then render these components in the page with appropriate props.
        """
        
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.2,
            system="You are an expert React and Next.js developer. Generate clean, modern TypeScript code.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the code from the response
        try:
            response_text = response.content[0].text
            # Extract code between triple backticks
            code_start = response_text.find("```") + 3
            code_end = response_text.rfind("```")
            
            # Handle different code block formats
            if "typescript" in response_text[code_start:code_start+20]:
                code_start = response_text.find("\n", code_start) + 1
            
            if code_start >= 3 and code_end > code_start:
                page_content = response_text[code_start:code_end].strip()
            else:
                # Fallback if no code is found
                page_content = self._create_default_page(page_name, sections)
        except Exception as e:
            print(f"Error generating page {page_name}: {e}")
            page_content = self._create_default_page(page_name, sections)
        
        # Write the page file
        page_file = os.path.join(page_dir, "page.tsx")
        return self._write_file(page_file, page_content)
    
    def _generate_layout(self, brand_guide: Dict) -> bool:
        """
        Generate the main layout for the website.
        
        Args:
            brand_guide: The brand guide
            
        Returns:
            bool: True if successful, False otherwise
        """
        prompt = f"""
        Generate a Next.js layout component for the entire website.
        This layout should include:
        - A header with navigation links
        - A footer
        - A main content area
        
        The brand guide specifies:
        - Primary color: {brand_guide.get("colors", {}).get("primary", "#000000")}
        - Background color: {brand_guide.get("colors", {}).get("background", "#ffffff")}
        - Typography: {brand_guide.get("typography", {}).get("body", "sans-serif")} for body text
        - UI style: {brand_guide.get("ui_style", "modern")}
        
        Generate a TypeScript React component for this layout.
        """
        
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.2,
            system="You are an expert React and Next.js developer. Generate clean, modern TypeScript code.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the code from the response
        try:
            response_text = response.content[0].text
            # Extract code between triple backticks
            code_start = response_text.find("```") + 3
            code_end = response_text.rfind("```")
            
            # Handle different code block formats
            if "typescript" in response_text[code_start:code_start+20]:
                code_start = response_text.find("\n", code_start) + 1
            
            if code_start >= 3 and code_end > code_start:
                layout_content = response_text[code_start:code_end].strip()
            else:
                # Fallback if no code is found
                layout_content = self._create_default_layout(brand_guide)
        except Exception as e:
            print(f"Error generating layout: {e}")
            layout_content = self._create_default_layout(brand_guide)
        
        # Write the layout file
        layout_file = os.path.join(self.pages_dir, "layout.tsx")
        return self._write_file(layout_file, layout_content)
    
    def _generate_cms_components(self) -> bool:
        """
        Generate CMS components for editing the website.
        
        Returns:
            bool: True if successful, False otherwise
        """
        # Create CMS API route
        cms_api_dir = os.path.join(self.pages_dir, "api", "cms")
        os.makedirs(cms_api_dir, exist_ok=True)
        
        api_route_content = """
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the CMS data file
    const dataPath = path.join(process.cwd(), 'public', 'cms-data.json');
    
    if (!fs.existsSync(dataPath)) {
      // Create default CMS data if it doesn't exist
      const defaultData = { pages: {} };
      fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2), 'utf8');
      return NextResponse.json(defaultData);
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in CMS API:', error);
    return NextResponse.json({ error: 'Failed to read CMS data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Write the updated CMS data
    const dataPath = path.join(process.cwd(), 'public', 'cms-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in CMS API:', error);
    return NextResponse.json({ error: 'Failed to update CMS data' }, { status: 500 });
  }
}
"""
        self._write_file(os.path.join(cms_api_dir, "route.ts"), api_route_content)
        
        # Create CMS page
        cms_page_dir = os.path.join(self.pages_dir, "cms")
        os.makedirs(cms_page_dir, exist_ok=True)
        
        cms_page_content = """
'use client';

import { useState, useEffect } from 'react';

interface CMSData {
  pages: Record<string, any>;
}

export default function CMSPage() {
  const [data, setData] = useState<CMSData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/cms');
        if (!response.ok) throw new Error('Failed to fetch CMS data');
        const cmsData = await response.json();
        setData(cmsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  async function handleSave() {
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to save CMS data');
      alert('Changes saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }
  
  if (isLoading) return <div className="p-8">Loading CMS...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8">No CMS data available</div>;
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">CMS Editor</h1>
      
      <div className="mb-8">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
      
      <div className="space-y-6">
        {Object.entries(data.pages).map(([pageName, pageData]) => (
          <div key={pageName} className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">{pageName}</h2>
            
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(pageData, null, 2)}
            </pre>
            
            {/* Add editors for specific fields here */}
          </div>
        ))}
      </div>
    </div>
  );
}
"""
        self._write_file(os.path.join(cms_page_dir, "page.tsx"), cms_page_content)
        
        return True
    
    def _generate_component_code(self, component_type: str, brand_guide: Dict, description: str) -> str:
        """
        Generate code for a React component.
        
        Args:
            component_type: The type of component to generate
            brand_guide: The brand guide
            description: Description of the component
            
        Returns:
            str: The generated component code or empty string if generation fails
        """
        prompt = f"""
        Generate a React component for a {component_type} component.
        
        Description: {description}
        
        The brand guide specifies:
        - Primary color: {brand_guide.get("colors", {}).get("primary", "#000000")}
        - Secondary color: {brand_guide.get("colors", {}).get("secondary", "#cccccc")}
        - Typography: {brand_guide.get("typography", {}).get("body", "sans-serif")} for body text
        - UI style: {brand_guide.get("ui_style", "modern")}
        
        For specific component styling:
        {json.dumps(brand_guide.get("components", {}).get(component_type, {}), indent=2)}
        
        Generate a TypeScript React component for this {component_type}.
        Make sure to use modern React practices with functional components and hooks.
        Use the appropriate styling based on the brand guide.
        """
        
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.2,
            system="You are an expert React developer. Generate clean, modern TypeScript code.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the code from the response
        try:
            response_text = response.content[0].text
            # Extract code between triple backticks
            code_start = response_text.find("```") + 3
            code_end = response_text.rfind("```")
            
            # Handle different code block formats
            if "typescript" in response_text[code_start:code_start+20]:
                code_start = response_text.find("\n", code_start) + 1
            
            if code_start >= 3 and code_end > code_start:
                return response_text[code_start:code_end].strip()
        except Exception as e:
            print(f"Error generating component {component_type}: {e}")
        
        return ""
    
    def _create_default_page(self, page_name: str, sections: List[Tuple[str, str]]) -> str:
        """
        Create default page code.
        
        Args:
            page_name: The name of the page
            sections: List of (section_type, component_name) tuples
            
        Returns:
            str: Default page code
        """
        imports = []
        section_jsx = []
        
        for section_type, component_name in sections:
            # Convert section type to PascalCase for component name
            pascal_case = "".join(word.capitalize() for word in section_type.split("_"))
            imports.append(f"import {pascal_case} from '@/components/sections/{section_type}';")
            section_jsx.append(f"      <{pascal_case} />")
        
        return f"""
import React from 'react';
{"\n".join(imports)}

export default function {page_name.replace(" ", "")}Page() {{
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{page_name}</h1>
{"\n".join(section_jsx)}
    </div>
  );
}}
"""
    
    def _create_default_layout(self, brand_guide: Dict) -> str:
        """
        Create default layout code.
        
        Args:
            brand_guide: The brand guide
            
        Returns:
            str: Default layout code
        """
        primary_color = brand_guide.get("colors", {}).get("primary", "#000000")
        background_color = brand_guide.get("colors", {}).get("background", "#ffffff")
        body_font = brand_guide.get("typography", {}).get("body", "sans-serif")
        
        return f"""
import React from 'react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import './globals.css';

export const metadata = {{
  title: 'Generated Website',
  description: 'A website generated by AI CMS',
}};

export default function RootLayout({{
  children,
}}: {{
  children: React.ReactNode;
}}) {{
  return (
    <html lang="en">
      <body>
        <header className="bg-[{primary_color}] text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-xl font-bold">Logo</div>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li><a href="/about" className="hover:underline">About</a></li>
                <li><a href="/contact" className="hover:underline">Contact</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="min-h-screen bg-[{background_color}]">
          {{children}}
        </main>
        
        <footer className="bg-gray-800 text-white p-6">
          <div className="container mx-auto">
            <div className="text-center">
              <p>© {{new Date().getFullYear()}} Generated Website. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}}
"""
    
    def _write_file(self, file_path: str, content: str) -> bool:
        """
        Write content to a file.
        
        Args:
            file_path: Path to the file
            content: Content to write
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'w') as f:
                f.write(content)
            
            print(f"Written file: {file_path}")
            return True
        except Exception as e:
            print(f"Error writing file {file_path}: {e}")
            return False


if __name__ == "__main__":
    # Check for API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)
    
    # Check if sitemap and brand guide exist
    if not os.path.exists("sitemap.json"):
        print("Error: sitemap.json not found")
        sys.exit(1)
    
    if not os.path.exists("brand-guide.json"):
        print("Error: brand-guide.json not found")
        sys.exit(1)
    
    # Generate the website
    agent = CodeActionAgent(api_key)
    if agent.generate_website():
        print("Website generation completed successfully")
    else:
        print("Website generation failed") 