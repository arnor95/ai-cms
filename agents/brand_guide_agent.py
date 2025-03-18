#!/usr/bin/env python3
"""
Brand Guide Agent - Generates a brand style guide for a website based on input prompts.
"""

import json
import os
import sys
import base64
from typing import Dict, List, Optional, Union

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not found. Please install it with 'pip install anthropic'")
    sys.exit(1)

class BrandGuideAgent:
    """
    Agent responsible for generating a website brand guide based on user input.
    """
    
    def __init__(self, api_key: str):
        """
        Initialize the BrandGuideAgent.
        
        Args:
            api_key: The Anthropic API key
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.output_file = "brand-guide.json"
    
    def generate_style_guide(self, 
                           business_name: str, 
                           business_description: str,
                           logo_base64: Optional[str] = None,
                           color_preferences: Optional[Dict[str, str]] = None) -> Dict:
        """
        Generate a brand style guide based on business inputs.
        
        Args:
            business_name: Name of the business
            business_description: Description of the business
            logo_base64: Optional base64-encoded logo image
            color_preferences: Optional color preferences
            
        Returns:
            Dict: The generated brand guide
        """
        prompt = f"""
        You are a brand designer tasked with creating a style guide for {business_name}.
        Business description: {business_description}
        
        Create a comprehensive brand guide that would best represent this business.
        The brand guide should include:
        1. A color palette (primary, secondary, accent, background, text colors)
        2. Typography choices (heading and body fonts)
        3. UI style preferences (modern, classic, minimalist, etc.)
        4. Component styling recommendations
        
        Output the brand guide as a JSON object where the keys include:
        - "colors": an object with color hex values for primary, secondary, accent, background, and text
        - "typography": an object with font families for headings and body
        - "ui_style": a string describing the overall UI style
        - "components": an object with styling recommendations for buttons, cards, forms, etc.
        """
        
        if color_preferences:
            prompt += "\n\nColor preferences: " + json.dumps(color_preferences)
        
        if logo_base64:
            # If we had image analysis capabilities, we would use the logo here
            prompt += "\n\nNote: A logo has been provided. Please ensure the color palette complements the logo."
        
        # Make API call to Claude
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.7,
            system="You are a brand design expert who creates detailed style guides for businesses.",
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
                brand_guide = json.loads(json_str)
            else:
                # Fallback if no JSON is found
                brand_guide = self._create_default_brand_guide(business_name)
        except Exception as e:
            print(f"Error parsing response: {e}")
            brand_guide = self._create_default_brand_guide(business_name)
        
        # If there are color preferences, ensure they are incorporated
        if color_preferences and "colors" in brand_guide:
            for color_key, color_value in color_preferences.items():
                if color_key in brand_guide["colors"]:
                    brand_guide["colors"][color_key] = color_value
        
        # Save the brand guide to file
        self._save_brand_guide(brand_guide)
        
        return brand_guide
    
    def edit_style_guide(self, edits: Dict) -> Dict:
        """
        Edit an existing brand guide.
        
        Args:
            edits: Dictionary containing edits to apply to the brand guide
            
        Returns:
            Dict: The updated brand guide
        """
        if not os.path.exists(self.output_file):
            return {}
        
        try:
            with open(self.output_file, 'r') as f:
                brand_guide = json.load(f)
                
            # Apply edits (recursive merge)
            self._deep_update(brand_guide, edits)
                
            # Save updated brand guide
            self._save_brand_guide(brand_guide)
            
            return brand_guide
        except Exception as e:
            print(f"Error editing brand guide: {e}")
            return {}
    
    def _save_brand_guide(self, brand_guide: Dict) -> None:
        """
        Save the brand guide to a file.
        
        Args:
            brand_guide: The brand guide to save
        """
        try:
            with open(self.output_file, 'w') as f:
                json.dump(brand_guide, f, indent=2)
            print(f"Brand guide saved to {self.output_file}")
        except Exception as e:
            print(f"Error saving brand guide: {e}")
    
    def _create_default_brand_guide(self, business_name: str) -> Dict:
        """
        Create a default brand guide if generation fails.
        
        Args:
            business_name: Name of the business
            
        Returns:
            Dict: A default brand guide
        """
        return {
            "colors": {
                "primary": "#3B82F6",  # Blue
                "secondary": "#10B981",  # Emerald
                "accent": "#F59E0B",  # Amber
                "background": "#FFFFFF",  # White
                "text": "#1F2937"  # Gray 800
            },
            "typography": {
                "headings": "Playfair Display, serif",
                "body": "Inter, sans-serif"
            },
            "ui_style": "Modern and clean",
            "components": {
                "buttons": {
                    "primary": {
                        "background": "#3B82F6",
                        "text": "#FFFFFF",
                        "border_radius": "0.375rem"
                    },
                    "secondary": {
                        "background": "transparent",
                        "text": "#3B82F6",
                        "border": "1px solid #3B82F6",
                        "border_radius": "0.375rem"
                    }
                },
                "cards": {
                    "background": "#FFFFFF",
                    "border_radius": "0.5rem",
                    "shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                },
                "forms": {
                    "input_border": "1px solid #D1D5DB",
                    "input_border_radius": "0.375rem",
                    "input_padding": "0.5rem 0.75rem"
                }
            }
        }
    
    def _deep_update(self, original: Dict, updates: Dict) -> Dict:
        """
        Recursively update a dictionary.
        
        Args:
            original: The original dictionary to update
            updates: The updates to apply
            
        Returns:
            Dict: The updated dictionary
        """
        for key, value in updates.items():
            if isinstance(value, dict) and key in original and isinstance(original[key], dict):
                self._deep_update(original[key], value)
            else:
                original[key] = value
        return original


if __name__ == "__main__":
    # Simple CLI interface
    if len(sys.argv) < 3:
        print("Usage: python brand_guide_agent.py <business_name> <business_description> [logo_file] [color_primary:color_secondary]")
        sys.exit(1)
    
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)
    
    business_name = sys.argv[1]
    business_description = sys.argv[2]
    
    # Process logo if provided
    logo_base64 = None
    if len(sys.argv) > 3 and os.path.exists(sys.argv[3]):
        try:
            with open(sys.argv[3], 'rb') as logo_file:
                logo_data = logo_file.read()
                logo_base64 = base64.b64encode(logo_data).decode('utf-8')
        except Exception as e:
            print(f"Error processing logo: {e}")
    
    # Process color preferences if provided
    color_preferences = {}
    if len(sys.argv) > 4:
        try:
            color_pairs = sys.argv[4].split(',')
            for pair in color_pairs:
                key, value = pair.split(':')
                color_preferences[key] = value
        except Exception as e:
            print(f"Error processing color preferences: {e}")
    
    agent = BrandGuideAgent(api_key)
    brand_guide = agent.generate_style_guide(business_name, business_description, logo_base64, color_preferences)
    print(json.dumps(brand_guide, indent=2)) 