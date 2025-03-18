#!/usr/bin/env python3
"""
Sitemap Agent - Generates a sitemap for a website based on input prompts.
"""

import json
import os
import sys
from typing import Dict, List, Optional

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not found. Please install it with 'pip install anthropic'")
    sys.exit(1)

class SitemapAgent:
    """
    Agent responsible for generating a website sitemap based on user input.
    """
    
    def __init__(self, api_key: str):
        """
        Initialize the SitemapAgent.
        
        Args:
            api_key: The Anthropic API key
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.output_file = "sitemap.json"
    
    def generate_sitemap(self, 
                        business_name: str, 
                        business_description: str, 
                        layout_prompt: Optional[str] = None) -> Dict:
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
        You are a website architect tasked with creating a sitemap for {business_name}.
        Business description: {business_description}
        
        Create a sitemap for a website that would best represent this business.
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
            system="You are a website architecture expert who creates detailed sitemaps for businesses.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the JSON from the response
        # This is a simplification - in practice, you might need more robust extraction
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
    
    def edit_sitemap(self, edits: Dict) -> Dict:
        """
        Edit an existing sitemap.
        
        Args:
            edits: Dictionary containing edits to apply to the sitemap
            
        Returns:
            Dict: The updated sitemap
        """
        if not os.path.exists(self.output_file):
            return {}
        
        try:
            with open(self.output_file, 'r') as f:
                sitemap = json.load(f)
                
            # Apply edits
            for page, sections in edits.items():
                sitemap[page] = sections
                
            # Save updated sitemap
            self._save_sitemap(sitemap)
            
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
    
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)
    
    business_name = sys.argv[1]
    business_description = sys.argv[2]
    layout_prompt = sys.argv[3] if len(sys.argv) > 3 else None
    
    agent = SitemapAgent(api_key)
    sitemap = agent.generate_sitemap(business_name, business_description, layout_prompt)
    print(json.dumps(sitemap, indent=2)) 