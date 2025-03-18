#!/usr/bin/env python3
"""
Code Action Agent - Generates website code based on sitemap and brand guide.
"""

import json
import os
import sys
import base64
import shutil
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not found. Please install it with 'pip install anthropic'")
    sys.exit(1)

class CodeActionAgent:
    """
    Agent responsible for generating website code based on sitemap and brand guide.
    """
    
    def __init__(self, sections_dir="components/sections", output_dir="src", api_key=None):
        """
        Initialize the CodeActionAgent.
        
        Args:
            sections_dir: Directory containing pre-made sections
            output_dir: Directory to output generated website
            api_key: The Anthropic API key (optional, will use ANTHROPIC_API_KEY env var if not provided)
        """
        # Load environment variables from .env file
        load_dotenv()
        
        # Use provided API key or get from environment
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required. Provide it directly or set ANTHROPIC_API_KEY environment variable.")
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.sections_dir = sections_dir
        self.output_dir = output_dir
        
        # Define key directories
        self.components_dir = os.path.join(self.output_dir, "components")
        self.app_dir = os.path.join(self.output_dir, "app")
        self.public_dir = os.path.join(self.output_dir, "public")
        self.data_dir = os.path.join(self.output_dir, "data")
        
        # Ensure output directories exist
        for dir_path in [
            self.components_dir, 
            self.app_dir, 
            self.public_dir,
            os.path.join(self.components_dir, "ui"),
            os.path.join(self.components_dir, "sections"),
            os.path.join(self.public_dir, "images"),
            self.data_dir
        ]:
            os.makedirs(dir_path, exist_ok=True)
    
    def fetch_section(self, section_description: str) -> str:
        """
        Fetch a pre-made section or generate a new one.
        
        Args:
            section_description: Description of the section
            
        Returns:
            str: The section component code
        """
        section_map = {
            "hero": "hero.tsx",
            "features": "features.tsx",
            "about": "about.tsx",
            "menu": "menu.tsx",
            "location": "location.tsx",
            "contact_form": "contact.tsx",
            "testimonials": "testimonials.tsx",
            "pricing": "pricing.tsx",
            "services": "services.tsx",
            "team": "team.tsx",
            "gallery": "gallery.tsx",
            "content": "content.tsx"
        }
        
        # Check if this section matches a known section type
        section_type = None
        for key in section_map.keys():
            if key in section_description.lower():
                section_type = key
                break
        
        if section_type:
            section_file = section_map[section_type]
            section_path = os.path.join(self.sections_dir, section_file)
            if os.path.exists(section_path):
                with open(section_path, "r") as f:
                    return f.read()
        
        # If we don't have a pre-made section, generate one
        return self.generate_section(section_description)
    
    def generate_section(self, section_description: str) -> str:
        """
        Generate a new section using AI.
        
        Args:
            section_description: Description of the section
            
        Returns:
            str: The generated section code
        """
        prompt = f"""
        Generate a React component for a website section described as: {section_description}.
        
        Use Tailwind CSS classes for styling and modern React.
        The component should be a functional component written in TypeScript.
        
        Return only the code for the component without any explanation, as I need to directly use the code.
        """
        
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.2,
            system="You are an expert React and Next.js developer. Generate clean, modern TypeScript code. Return only the code without explanations or markdown tags.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the code from the response
        try:
            response_text = response.content[0].text
            
            # Check if the response is wrapped in code blocks and remove them
            if response_text.startswith("```") and response_text.endswith("```"):
                code_start = response_text.find("\n") + 1
                code_end = response_text.rfind("```")
                return response_text[code_start:code_end].strip()
            
            return response_text.strip()
        except Exception as e:
            print(f"Error generating section: {e}")
            return self._create_default_section(section_description)
    
    def generate_content(self, description: str) -> Dict:
        """
        Generate AI-driven content for a website.
        
        Args:
            description: Description of the business
            
        Returns:
            Dict: The generated content
        """
        prompt = f"""
        Generate unique content for a website based on this description: {description}.
        
        Return a JSON object with the following structure:
        {{
            "about": "A paragraph about the business...",
            "sections": {{
                "featured": ["Item 1", "Item 2", "Item 3"],
                "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
            }}
        }}
        
        Tailor the content to be appropriate for the type of business or website.
        """
        
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=2000,
            temperature=0.5,
            system="You are a marketing copywriter who creates compelling website content. Return only valid JSON.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the JSON from the response
        try:
            response_text = response.content[0].text
            # Find the JSON part - look for the first { and last }
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                content = json.loads(json_str)
                return content
        except Exception as e:
            print(f"Error generating content: {e}")
        
        # Default content if generation fails
        return {
            "about": "Welcome to our website. We provide high-quality services to meet your needs.",
            "sections": {
                "featured": ["Featured Item 1", "Featured Item 2", "Featured Item 3"],
                "benefits": ["Quality", "Reliability", "Customer Service"]
            }
        }
    
    def save_image(self, base64_string: str, filename: str) -> str:
        """
        Save base64 image to public directory.
        
        Args:
            base64_string: Base64 encoded image data
            filename: Name to save the image as
            
        Returns:
            str: The path to the saved image
        """
        if not base64_string:
            return ""
        
        try:
            # Handle images with data URI scheme
            if "," in base64_string:
                base64_string = base64_string.split(",", 1)[1]
            
            img_data = base64.b64decode(base64_string)
            image_path = os.path.join(self.public_dir, "images", filename)
            
            with open(image_path, "wb") as f:
                f.write(img_data)
            
            return f"/images/{filename}"
        except Exception as e:
            print(f"Error saving image: {e}")
            return ""
    
    def create_page(self, page_name: str, sections: List[Dict], style_guide: Dict, cms_data: Dict) -> bool:
        """
        Create a Next.js page with the specified sections.
        
        Args:
            page_name: Name of the page
            sections: List of section objects
            style_guide: The brand style guide
            cms_data: CMS data for the page
            
        Returns:
            bool: True if successful, False otherwise
        """
        # Convert page name to a valid directory name
        page_dir = page_name.lower().replace(" ", "-")
        if page_dir.lower() == "home":
            page_dir = ""  # Homepage goes in the root app directory
            
        page_dir_path = os.path.join(self.app_dir, page_dir)
        os.makedirs(page_dir_path, exist_ok=True)
        
        # Generate page content
        imports = ["import React from 'react';", "import { useEffect } from 'react';"]
        sections_jsx = []
        
        for i, section in enumerate(sections):
            section_type = section.get("type", "content")
            section_desc = section.get("description", "")
            
            # Generate or fetch the section component
            section_content = self.fetch_section(f"{section_type} section: {section_desc}")
            section_filename = f"{section_type.lower().replace(' ', '_')}.tsx"
            
            # Save the section component if it doesn't exist
            section_path = os.path.join(self.components_dir, "sections", section_filename)
            if not os.path.exists(section_path):
                with open(section_path, "w") as f:
                    f.write(section_content)
            
            # Create import statement and JSX
            component_name = ''.join(word.capitalize() for word in section_type.split('_'))
            imports.append(f"import {component_name} from '@/components/sections/{section_filename.replace('.tsx', '')}';")
            sections_jsx.append(f"      <{component_name} data={{cms.content?.sections}} />")
        
        # Create the page content
        page_content = f"""'use client';

{chr(10).join(list(set(imports)))}

export default function {page_name.replace(" ", "")}Page() {{
  const [cms, setCms] = React.useState({{
    name: "{cms_data.get('name', '')}",
    description: "{cms_data.get('description', '')}",
    content: {json.dumps(cms_data.get('content', {}))}
  }});
  
  useEffect(() => {{
    // Fetch CMS data
    async function fetchCMS() {{
      try {{
        const res = await fetch('/api/cms');
        if (res.ok) {{
          const data = await res.json();
          setCms(data);
        }}
      }} catch (error) {{
        console.error('Error fetching CMS data:', error);
      }}
    }}
    
    fetchCMS();
  }}, []);

  return (
    <div className="min-h-screen bg-[{style_guide.get('colors', {}).get('background', '#FFFFFF')}]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 font-serif text-[{style_guide.get('colors', {}).get('primary', '#000000')}]">{page_name}</h1>
{chr(10).join(sections_jsx)}
      </div>
    </div>
  );
}}
"""
        
        # Write the page file
        page_file = os.path.join(page_dir_path, "page.tsx")
        with open(page_file, "w") as f:
            f.write(page_content)
        
        return True
    
    def setup_cms(self) -> bool:
        """
        Set up a basic CMS API and edit page.
        
        Returns:
            bool: True if successful, False otherwise
        """
        # Create API route for CMS
        cms_api_dir = os.path.join(self.app_dir, "api", "cms")
        os.makedirs(cms_api_dir, exist_ok=True)
        
        api_content = """
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'cms.json');
    
    if (!fs.existsSync(dataPath)) {
      const defaultData = { 
        name: "Website",
        description: "A website generated by AI CMS",
        content: {
          about: "Welcome to our website.",
          sections: {}
        }
      };
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
    const dataPath = path.join(process.cwd(), 'src', 'data', 'cms.json');
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating CMS data:', error);
    return NextResponse.json({ error: 'Failed to update CMS data' }, { status: 500 });
  }
}
"""
        
        api_file = os.path.join(cms_api_dir, "route.ts")
        with open(api_file, "w") as f:
            f.write(api_content)
        
        # Create CMS edit page
        cms_page_dir = os.path.join(self.app_dir, "cms")
        os.makedirs(cms_page_dir, exist_ok=True)
        
        cms_page_content = """'use client';

import React, { useState, useEffect } from 'react';

export default function CMSPage() {
  const [cms, setCms] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/cms');
        if (!response.ok) throw new Error('Failed to fetch CMS data');
        const data = await response.json();
        setCms(data);
      } catch (err) {
        setError(err.message);
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
        body: JSON.stringify(cms),
      });
      
      if (!response.ok) throw new Error('Failed to save changes');
      alert('Changes saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  }
  
  function handleChange(key, value) {
    setCms({
      ...cms,
      [key]: value
    });
  }
  
  function handleContentChange(key, value) {
    setCms({
      ...cms,
      content: {
        ...cms.content,
        [key]: value
      }
    });
  }
  
  if (isLoading) return <div className="p-8">Loading CMS data...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!cms) return <div className="p-8">No CMS data available</div>;
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">CMS Editor</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Website Name</label>
        <input
          type="text"
          value={cms.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Website Description</label>
        <textarea
          value={cms.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full p-2 border rounded min-h-[100px]"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">About Text</label>
        <textarea
          value={cms.content?.about || ''}
          onChange={(e) => handleContentChange('about', e.target.value)}
          className="w-full p-2 border rounded min-h-[150px]"
        />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">All Content (JSON)</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px] text-sm">
          {JSON.stringify(cms, null, 2)}
        </pre>
      </div>
      
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save Changes
      </button>
    </div>
  );
}
"""
        
        cms_page_file = os.path.join(cms_page_dir, "page.tsx")
        with open(cms_page_file, "w") as f:
            f.write(cms_page_content)
        
        return True
    
    def generate_website(self, input_data: Dict, sitemap: Dict, style_guide: Dict) -> str:
        """
        Generate a website based on sitemap and brand guide.
        
        Args:
            input_data: Business data (name, description, logo, etc.)
            sitemap: The sitemap defining the pages and sections
            style_guide: The brand guide defining the style
            
        Returns:
            str: The path to the generated website
        """
        # Save the logo if provided
        logo_path = ""
        if input_data.get("logo"):
            logo_path = self.save_image(input_data.get("logo"), "logo.png")
        
        # Generate content for the website
        content = self.generate_content(input_data.get("description", ""))
        
        # Create CMS data
        cms_data = {
            "name": input_data.get("name", ""),
            "description": input_data.get("description", ""),
            "logo": logo_path,
            "colors": style_guide.get("colors", {"primary": "#000000", "secondary": "#ffffff"}),
            "content": content,
            "style_guide": style_guide
        }
        
        # Save CMS data
        os.makedirs(os.path.join(self.output_dir, "data"), exist_ok=True)
        with open(os.path.join(self.output_dir, "data", "cms.json"), "w") as f:
            json.dump(cms_data, f, indent=2)
        
        # Generate CSS with custom properties for the brand colors
        css_content = """
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
"""
        
        # Add color variables
        for color_name, color_value in style_guide.get("colors", {}).items():
            css_content += f"    --{color_name}: {color_value};\n"
        
        css_content += """  }
}

@layer base {
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  h1, h2, h3, h4, h5, h6 {
"""
        
        # Add typography styles
        headings_font = style_guide.get("typography", {}).get("headings", "Playfair Display, serif")
        body_font = style_guide.get("typography", {}).get("body", "Inter, sans-serif")
        
        css_content += f"    font-family: {headings_font};\n  }}\n\n"
        css_content += f"  body {{\n    font-family: {body_font};\n  }}\n}}"
        
        # Save the global CSS
        with open(os.path.join(self.output_dir, "app", "globals.css"), "w") as f:
            f.write(css_content)
        
        # Set up the CMS components
        self.setup_cms()
        
        # Generate pages from sitemap
        for page_name, sections in sitemap.items():
            self.create_page(page_name, sections, style_guide, cms_data)
        
        return self.output_dir
    
    def _create_default_section(self, section_description: str) -> str:
        """
        Create a default section component if generation fails.
        
        Args:
            section_description: Description of the section
            
        Returns:
            str: Default section component code
        """
        section_type = "Content"
        if "hero" in section_description.lower():
            section_type = "Hero"
        elif "feature" in section_description.lower():
            section_type = "Features"
        elif "about" in section_description.lower():
            section_type = "About"
        elif "contact" in section_description.lower():
            section_type = "Contact"
        
        return f"""import React from 'react';

interface {section_type}Props {{
  data?: any;
}}

export default function {section_type}({{ data }}: {section_type}Props) {{
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">{section_type} Section</h2>
        <p className="text-lg mb-8">
          {section_description}
        </p>
      </div>
    </section>
  );
}}
"""


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python code_action_agent.py <input_data_file> <sitemap_file> <brand_guide_file>")
        sys.exit(1)
    
    input_data_file = sys.argv[1]
    sitemap_file = sys.argv[2]
    brand_guide_file = sys.argv[3]
    
    # Load input files
    try:
        with open(input_data_file, 'r') as f:
            input_data = json.load(f)
        
        with open(sitemap_file, 'r') as f:
            sitemap = json.load(f)
        
        with open(brand_guide_file, 'r') as f:
            style_guide = json.load(f)
    except Exception as e:
        print(f"Error loading input files: {e}")
        sys.exit(1)
    
    # Generate the website
    agent = CodeActionAgent()
    output_dir = agent.generate_website(input_data, sitemap, style_guide)
    print(f"Website generated at {output_dir}") 