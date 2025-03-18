#!/usr/bin/env python3
"""
Code Action Agent - Generates website code based on sitemap and brand guide.
"""

import json
import os
import sys
import base64
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
import textwrap
import logging
import re

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not found. Please install it with 'pip install anthropic'")
    sys.exit(1)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def indent(text: str, levels: int) -> str:
    """
    Indent text by a specified number of levels (each level = 2 spaces).
    
    Args:
        text: The text to indent
        levels: Number of indentation levels
        
    Returns:
        str: Indented text
    """
    return textwrap.indent(text, "  " * levels)

def clean_code(text: str) -> str:
    """
    Remove markdown code blocks (e.g., ```tsx) and extra whitespace from the code.
    
    Args:
        text: The raw code string
        
    Returns:
        str: Cleaned code
    """
    # Remove ```tsx or ``` blocks
    text = re.sub(r'```(?:tsx)?\s*[\n\r]*(.*?)[\n\r]*```', r'\1', text, flags=re.DOTALL).strip()
    # Remove leading/trailing whitespace and ensure consistent line endings
    return "\n".join(line.strip() for line in text.splitlines() if line.strip())

class CodeActionAgent:
    """
    Agent responsible for generating website code based on sitemap and brand guide.
    """
    
    def __init__(self, output_dir="output", api_key=None):
        """
        Initialize the CodeActionAgent.
        
        Args:
            output_dir: Directory to output generated website (default: "output")
            api_key: The Anthropic API key (optional, will use ANTHROPIC_API_KEY env var if not provided)
        """
        load_dotenv()
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required. Provide it directly or set ANTHROPIC_API_KEY environment variable.")
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.output_dir = output_dir
        
        # Define key directories
        self.app_dir = os.path.join(self.output_dir, "app")
        self.public_dir = os.path.join(self.output_dir, "public")
        self.components_dir = os.path.join(self.app_dir, "components")
        
        # Ensure output directories exist
        for dir_path in [self.app_dir, self.public_dir, os.path.join(self.public_dir, "images"), self.components_dir]:
            os.makedirs(dir_path, exist_ok=True)
    
    def generate_section(self, section_description: str, style_guide: Dict) -> str:
        """
        Generate a full React component for a website section based on description and style guide.
        
        Args:
            section_description: Description of the section
            style_guide: The brand guide defining the style
            
        Returns:
            str: The generated component code
        """
        colors = style_guide.get("colors", {})
        typography = style_guide.get("typography", {"headings": "Playfair Display, serif", "body": "Montserrat, sans-serif"})
        prompt = f"""
        Generate a complete React component in TypeScript for a website section described as: {section_description}.

        Include import statements for React and define the component with props (e.g., title and description).
        Use Tailwind CSS classes for styling, incorporating these colors: {json.dumps(colors)}.
        Use these fonts: headings: {typography['headings']}, body: {typography['body']}.
        Ensure the component is compatible with Next.js and Shadcn UI.

        Return only the code for the component without explanations or markdown.
        """
        
        response = self.client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=4000,
            temperature=0.2,
            system="You are an expert React and Next.js developer. Generate clean, modern TypeScript code compatible with Shadcn UI.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        try:
            response_text = response.content[0].text.strip()
            cleaned_code = clean_code(response_text)
            logger.debug(f"Generated section code for {section_description}: {cleaned_code[:100]}...")  # Log first 100 chars
            if not cleaned_code:
                raise ValueError("Empty response from API after cleaning")
            return cleaned_code
        except Exception as e:
            logger.error(f"Error generating section: {e}")
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
                "content": ["Content item 1", "Content item 2", "Content item 3"]
            }}
        }}
        
        Tailor the content to be appropriate for the type of business or website.
        """
        
        response = self.client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=2000,
            temperature=0.5,
            system="You are a marketing copywriter who creates compelling website content. Return only valid JSON.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        try:
            response_text = response.content[0].text
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                content = json.loads(json_str)
                return content
        except Exception as e:
            logger.error(f"Error generating content: {e}")
        
        return {
            "about": "Welcome to our website. We provide high-quality services to meet your needs.",
            "sections": {"content": ["Item 1", "Item 2", "Item 3"]}
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
            if "," in base64_string:
                base64_string = base64_string.split(",", 1)[1]
            
            img_data = base64.b64decode(base64_string)
            image_path = os.path.join(self.public_dir, "images", filename)
            
            with open(image_path, "wb") as f:
                f.write(img_data)
            
            return f"/images/{filename}"
        except Exception as e:
            logger.error(f"Error saving image: {e}")
            return ""
    
    def create_page(self, page_name: str, sections: List[Dict], style_guide: Dict, input_data: Dict, cms_data: Dict) -> bool:
        """
        Create a Next.js page with AI-generated sections imported as components.
        
        Args:
            page_name: Name of the page
            sections: List of section descriptions
            style_guide: The brand guide defining the style
            input_data: Business data
            cms_data: CMS data for the page (not used without CMS)
            
        Returns:
            bool: True if successful, False otherwise
        """
        page_dir = page_name.lower().replace(" ", "-")
        if page_dir.lower() == "home":
            page_dir = ""  # Homepage goes in the root app directory
            
        page_dir_path = os.path.join(self.app_dir, page_dir)
        os.makedirs(page_dir_path, exist_ok=True)
        
        section_imports = []
        section_jsx = []
        
        for idx, section in enumerate(sections or [{"type": page_name.lower(), "description": f"{page_name} section"}], 1):
            section_name = f"{page_name.replace(' ', '')}{section.get('type', 'Section').replace(' ', '')}{idx}"
            section_code = self.generate_section(section.get("description", f"{page_name} section"), style_guide)
            if not section_code.strip():
                logger.warning(f"Empty section code for {section_name}, using default")
                section_code = self._create_default_section(f"{page_name} section")
            section_file = os.path.join(self.components_dir, f"{section_name}.tsx")
            with open(section_file, "w") as f:
                f.write(section_code)
            section_imports.append(f"import {section_name} from '../components/{section_name}';")  # Relative import
            section_jsx.append(f"      <{section_name} />")
        
        if not section_imports:
            logger.warning("No sections generated, adding default section")
            section_name = f"{page_name.replace(' ', '')}Default1"
            section_code = self._create_default_section(f"{page_name} section")
            section_file = os.path.join(self.components_dir, f"{section_name}.tsx")
            with open(section_file, "w") as f:
                f.write(section_code)
            section_imports.append(f"import {section_name} from '../components/{section_name}';")  # Relative import
            section_jsx.append(f"      <{section_name} />")
        
        page_content = f"""'use client';

import React from 'react';
{chr(10).join(section_imports)}

export default function {page_name.replace(' ', '')}Page() {{
  return (
    <div className="min-h-screen" style={{backgroundColor: '{style_guide.get('colors', {}).get('background', '#F1EDEA')}'}}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" style={{color: '{style_guide.get('colors', {}).get('primary', '#4A6C6F')}', fontFamily: '{style_guide.get('typography', {}).get('headings', 'Playfair Display, serif')}'}}>{page_name}</h1>
{chr(10).join(section_jsx)}
      </div>
    </div>
  );
}}
"""
        
        page_file = os.path.join(page_dir_path, "page.tsx")
        with open(page_file, "w") as f:
            f.write(page_content)
            logger.debug(f"Created page file: {page_file}")
        
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
        logo_path = self.save_image(input_data.get("logo", ""), "logo.png")
        
        # Generate content
        content = self.generate_content(input_data.get("description", ""))
        
        # Create temporary CMS-like data (without CMS setup)
        cms_data = {
            "name": input_data.get("name", "Miðgarður Veitingahús"),
            "description": input_data.get("description", ""),
            "logo": logo_path,
            "colors": style_guide.get("colors", {"primary": "#4A6C6F", "secondary": "#846C5B", "accent": "#9B8357", "text": "#C3B299", "background": "#F1EDEA"}),
            "content": content
        }
        
        # Generate CSS with custom properties
        css_content = """
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
"""
        for color_name, color_value in style_guide.get("colors", {}).items():
            css_content += f"    --{color_name}: {color_value};\n"
        
        css_content += """
  }
  @layer base {
    body {
      @apply bg-background text-foreground;
      font-feature-settings: "rlig" 1, "calt" 1;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: Playfair Display, serif;
    }
    body {
      font-family: Montserrat, sans-serif;
    }
  }
}
"""
        
        with open(os.path.join(self.output_dir, "app", "globals.css"), "w") as f:
            f.write(css_content)
            logger.debug("Created globals.css")
        
        # Generate pages from sitemap
        pages = sitemap.get("pages", []) or (sitemap.get("sitemap_summary", {}).get("pages", []) or sitemap.keys())
        logger.debug(f"Processing pages: {pages}")
        if not pages:
            logger.warning("No pages found in sitemap, using default pages")
            pages = ["home", "about", "menu", "location", "contact"]
        for page_name in pages:
            sections = sitemap.get(page_name, []) if isinstance(sitemap, dict) else []
            logger.debug(f"Generating page: {page_name} with sections: {sections}")
            self.create_page(page_name, sections, style_guide, input_data, cms_data)
        
        # Verify files were created
        if not any(os.listdir(self.app_dir)):
            logger.error("No files generated in app directory")
            raise RuntimeError("Failed to generate any files")
        
        # Return the output directory for manual integration
        return self.output_dir

    def _create_default_section(self, section_description: str) -> str:
        """
        Create a default section component if generation fails.
        
        Args:
            section_description: Description of the section
            
        Returns:
            str: Default section component code
        """
        return f"""import React from 'react';

interface DefaultSectionProps {{
  title: string;
  description: string;
}}

const DefaultSection: React.FC<DefaultSectionProps> = ({ title, description }) => {{
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-primary mb-6">{title}</h2>
        <p className="text-lg text-text leading-relaxed">{description}</p>
      </div>
    </section>
  );
}};

export default DefaultSection;
"""

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python code_action_agent.py <input_data_file> <sitemap_file> <brand_guide_file> [ignored_args...]")
        sys.exit(1)
    
    input_data_file = sys.argv[1]
    sitemap_file = sys.argv[2]
    brand_guide_file = sys.argv[3]
    
    # Warn about extra arguments
    if len(sys.argv) > 4:
        print(f"Warning: Ignoring extra arguments: {sys.argv[4:]}")
    
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
    
    agent = CodeActionAgent()
    output_dir = agent.generate_website(input_data, sitemap, style_guide)
    print(f"Website generated at {output_dir}")