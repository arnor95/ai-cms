#!/usr/bin/env python3
"""
Sitemap Agent - Generates a sitemap for a website based on input prompts.
"""

import json
import os
import sys
from typing import Dict, List, Optional
from dotenv import load_dotenv

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not found. Please install it with 'pip install anthropic'")
    sys.exit(1)

class SitemapAgent:
    """
    Agent responsible for generating a website sitemap based on user input.
    """
    
    def __init__(self, api_key=None):
        """
        Initialize the SitemapAgent.
        
        Args:
            api_key: The Anthropic API key (optional, will use ANTHROPIC_API_KEY env var if not provided)
        """
        # Load environment variables from .env file
        load_dotenv()
        
        # Use provided API key or get from environment
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required. Provide it directly or set ANTHROPIC_API_KEY environment variable.")
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.output_file = "sitemap.json"
    
    def generate_sitemap(self, business_name: str, business_description: str, layout_prompt: Optional[str] = None) -> Dict:
        """
        Generate a sitemap based on business inputs.
        
        Args:
            business_name: Name of the business
            business_description: Description of the business
            layout_prompt: Optional specific layout requirements
            
        Returns:
            Dict: The generated sitemap
        """
        prompt = f"""
        Generate a sitemap for a website based on this description: {business_description} for {business_name}.
        
        Suggest key pages (e.g., Homepage, About Us) and sections (e.g., hero section, about section).
        
        The sitemap should include:
        1. A list of pages (e.g., Home, About, Services, Contact)
        2. For each page, a list of sections that should appear on that page
        3. For each section, a brief description of what content should be in that section
        
        Output the sitemap as a JSON object where:
        - Keys are page names
        - Values are arrays of section objects, each with a "type" and "description"
        """
        
        if layout_prompt:
            prompt += f"\n\nAdditional layout requirements: {layout_prompt}"
        
        # Make API call to Claude
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.7,
            system="You are a website architecture expert who creates detailed sitemaps for businesses. Return only valid JSON.",
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
                sitemap = json.loads(json_str)
            else:
                # Fallback if no JSON is found
                sitemap = self._create_default_sitemap(business_name)
        except Exception as e:
            print(f"Error parsing response: {e}")
            sitemap = self._create_default_sitemap(business_name)
        
        # Save the sitemap to file
        self._save_sitemap(sitemap)
        
        return sitemap
    
    def edit_sitemap(self) -> Dict:
        """
        Allow manual editing of the sitemap.
        
        Returns:
            Dict: The edited sitemap
        """
        if not os.path.exists(self.output_file):
            print(f"Error: {self.output_file} not found")
            return {}
        
        try:
            print(f"Edit {self.output_file} manually and save changes.")
            # In a real application, this would open a UI editor
            # For now, just inform the user to edit the file manually
            input("Press Enter after editing the sitemap file...")
            
            with open(self.output_file, 'r') as f:
                sitemap = json.load(f)
            
            return sitemap
        except Exception as e:
            print(f"Error editing sitemap: {e}")
            return {}
    
    def _save_sitemap(self, sitemap: Dict) -> None:
        """
        Save the sitemap to a file.
        
        Args:
            sitemap: The sitemap to save
        """
        try:
            with open(self.output_file, 'w') as f:
                json.dump(sitemap, f, indent=2)
            print(f"Sitemap saved to {self.output_file}")
        except Exception as e:
            print(f"Error saving sitemap: {e}")
    
    def _create_default_sitemap(self, business_name: str) -> Dict:
        """
        Create a default sitemap if generation fails.
        
        Args:
            business_name: Name of the business
            
        Returns:
            Dict: A default sitemap
        """
        return {
            "Home": [
                {"type": "hero", "description": f"Welcome to {business_name}"},
                {"type": "features", "description": "Highlight key features or services"}
            ],
            "About": [
                {"type": "content", "description": "About the company"}
            ],
            "Contact": [
                {"type": "contact_form", "description": "Contact form and information"}
            ]
        }


if __name__ == "__main__":
    # Simple CLI interface
    if len(sys.argv) < 3:
        print("Usage: python sitemap_agent.py <business_name> <business_description> [layout_prompt]")
        sys.exit(1)
    
    business_name = sys.argv[1]
    business_description = sys.argv[2]
    layout_prompt = sys.argv[3] if len(sys.argv) > 3 else None
    
    agent = SitemapAgent()
    sitemap = agent.generate_sitemap(business_name, business_description, layout_prompt)
    print("Generated sitemap:", json.dumps(sitemap, indent=2))
    # Pause for manual editing
    edited_sitemap = agent.edit_sitemap()
    print("Edited sitemap:", json.dumps(edited_sitemap, indent=2)) 