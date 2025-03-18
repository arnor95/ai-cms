#!/usr/bin/env python3
"""
Sitemap Agent - Generates a sitemap for a website based on input prompts.
"""

import json
import os
import sys
import time
import traceback
from typing import Dict, List, Optional
from datetime import datetime
from dotenv import load_dotenv

def log_debug(message):
    """Print a debug message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"[DEBUG][{timestamp}] {message}", flush=True)

def log_error(message):
    """Print an error message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"[ERROR][{timestamp}] {message}", flush=True)

def log_info(message):
    """Print an info message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"[INFO][{timestamp}] {message}", flush=True)

log_debug("Script execution started")
log_debug(f"Python version: {sys.version}")
log_debug(f"Current working directory: {os.getcwd()}")
log_debug(f"Script arguments: {sys.argv}")

try:
    import anthropic
    log_debug(f"Anthropic package imported successfully (version: {anthropic.__version__})")
except ImportError as e:
    log_error(f"Anthropic package import error: {e}")
    print("Error: anthropic package not found. Please install it with 'pip install anthropic'")
    sys.exit(1)
except Exception as e:
    log_error(f"Unexpected error importing anthropic: {e}")
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
        log_debug("Initializing SitemapAgent")
        
        # Load environment variables from .env file
        log_debug("Loading environment variables from .env file")
        load_dotenv()
        
        # Use provided API key or get from environment
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        log_debug(f"API key from environment: {'Present (length ' + str(len(self.api_key)) + ')' if self.api_key else 'Missing'}")
        
        if not self.api_key:
            log_error("Anthropic API key is missing")
            raise ValueError("Anthropic API key is required. Provide it directly or set ANTHROPIC_API_KEY environment variable.")
        
        log_debug("Creating Anthropic client")
        try:
            self.client = anthropic.Anthropic(api_key=self.api_key)
            log_debug("Anthropic client created successfully")
        except Exception as e:
            log_error(f"Failed to create Anthropic client: {e}")
            raise
            
        self.output_file = "sitemap.json"
        log_debug(f"Output file will be: {self.output_file}")
    
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
        log_debug(f"Generating sitemap for business: {business_name}")
        log_debug(f"Business description length: {len(business_description)} characters")
        log_debug(f"Layout prompt provided: {bool(layout_prompt)}")
        
        prompt = f"""
        Generate a sitemap for a website based on this description: {business_description} for {business_name}.
        
        Suggest key pages (e.g., Homepage, About Us) and sections (e.g., hero section, about section).
        
        The sitemap should include:
        1. A list of pages (e.g., Home, About, Services, Contact)
        2. For each page, a list of sections that should appear on that page
        3. For each section, a brief description of what content should be in that section (be specific and technical. for example, a two column layout with text on the left side and image on the right)
        
        Output the sitemap as a JSON object where:
        - Keys are page names
        - Values are arrays of section objects, each with a "type" and "description"
        """
        
        if layout_prompt:
            prompt += f"\n\nAdditional layout requirements: {layout_prompt}"
            
        log_debug(f"Prompt length: {len(prompt)} characters")
        log_debug("Making API call to Claude")
        
        # Make API call to Claude
        start_time = time.time()
        try:
            log_debug("Starting API request to Claude")
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=4000,
                temperature=0.7,
                system="You are a website architecture expert who creates detailed sitemaps for businesses. Return only valid JSON.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            request_time = time.time() - start_time
            log_debug(f"API call completed in {request_time:.2f} seconds")
            log_debug(f"Response type: {type(response)}")
            log_debug(f"Response has content? {hasattr(response, 'content') and len(response.content) > 0}")
            
            if hasattr(response, 'content') and len(response.content) > 0:
                log_debug(f"First content item type: {type(response.content[0])}")
                log_debug(f"Content has text? {hasattr(response.content[0], 'text')}")
            
        except Exception as e:
            log_error(f"API call failed after {time.time() - start_time:.2f} seconds")
            log_error(f"API error details: {str(e)}")
            log_error(f"Traceback: {traceback.format_exc()}")
            return self._create_default_sitemap(business_name)
        
        # Extract the JSON from the response
        try:
            log_debug("Extracting JSON from response")
            response_text = response.content[0].text
            log_debug(f"Response text length: {len(response_text)} characters")
            log_debug(f"Response text starts with: {response_text[:100]}")
            
            # Find the JSON part - look for the first { and last }
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            log_debug(f"JSON start position: {json_start}, end position: {json_end}")
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                log_debug(f"Extracted JSON string length: {len(json_str)}")
                log_debug(f"JSON string starts with: {json_str[:100]}")
                
                log_debug("Parsing JSON")
                sitemap = json.loads(json_str)
                log_debug(f"JSON parsed successfully with {len(sitemap)} pages")
                log_debug(f"Pages in sitemap: {', '.join(sitemap.keys())}")
            else:
                # Fallback if no JSON is found
                log_error("No JSON content found in response")
                log_debug("Using default sitemap")
                sitemap = self._create_default_sitemap(business_name)
        except Exception as e:
            log_error(f"Error parsing response: {e}")
            log_error(f"Traceback: {traceback.format_exc()}")
            log_debug("Using default sitemap")
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
        log_debug("Edit sitemap method called")
        
        if not os.path.exists(self.output_file):
            log_error(f"Output file {self.output_file} not found")
            print(f"Error: {self.output_file} not found")
            return {}
        
        try:
            print(f"Edit {self.output_file} manually and save changes.")
            # In a real application, this would open a UI editor
            # For now, just inform the user to edit the file manually
            input("Press Enter after editing the sitemap file...")
            
            log_debug(f"Reading edited sitemap from {self.output_file}")
            with open(self.output_file, 'r') as f:
                sitemap = json.load(f)
            
            log_debug(f"Edited sitemap read successfully with {len(sitemap)} pages")
            return sitemap
        except Exception as e:
            log_error(f"Error editing sitemap: {e}")
            log_error(f"Traceback: {traceback.format_exc()}")
            print(f"Error editing sitemap: {e}")
            return {}
    
    def _save_sitemap(self, sitemap: Dict) -> None:
        """
        Save the sitemap to a file.
        
        Args:
            sitemap: The sitemap to save
        """
        log_debug(f"Saving sitemap to {self.output_file}")
        try:
            # Get the absolute path
            abs_path = os.path.abspath(self.output_file)
            log_debug(f"Absolute path for output: {abs_path}")
            
            # Check if the directory exists and is writable
            output_dir = os.path.dirname(abs_path)
            if output_dir and not os.path.exists(output_dir):
                log_debug(f"Creating directory: {output_dir}")
                os.makedirs(output_dir, exist_ok=True)
            
            # Check write permissions
            if output_dir:
                log_debug(f"Checking if directory {output_dir} is writable")
                if not os.access(output_dir, os.W_OK):
                    log_error(f"Directory {output_dir} is not writable")
            
            log_debug(f"Writing sitemap to file")
            with open(abs_path, 'w') as f:
                json.dump(sitemap, f, indent=2)
            
            log_debug(f"Sitemap saved successfully")
            print(f"Sitemap saved to {self.output_file}")
            
            # Verify the file was created
            if os.path.exists(abs_path):
                log_debug(f"Verified file exists, size: {os.path.getsize(abs_path)} bytes")
            else:
                log_error(f"Failed to verify file exists after saving")
                
        except Exception as e:
            log_error(f"Error saving sitemap: {e}")
            log_error(f"Traceback: {traceback.format_exc()}")
            print(f"Error saving sitemap: {e}")
    
    def _create_default_sitemap(self, business_name: str) -> Dict:
        """
        Create a default sitemap if generation fails.
        
        Args:
            business_name: Name of the business
            
        Returns:
            Dict: A default sitemap
        """
        log_debug(f"Creating default sitemap for {business_name}")
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
    log_debug("Script running as main")
    
    # Simple CLI interface
    if len(sys.argv) < 3:
        log_error("Insufficient arguments provided")
        print("Usage: python sitemap_agent.py <business_name> <business_description> [layout_prompt]")
        sys.exit(1)
    
    business_name = sys.argv[1]
    business_description = sys.argv[2]
    layout_prompt = sys.argv[3] if len(sys.argv) > 3 else None
    
    # Check if this is being called from API (fourth argument "api" indicates API call)
    is_api_call = len(sys.argv) > 4 and sys.argv[4] == "api"
    log_debug(f"Running as API call: {is_api_call}")
    
    log_debug(f"Creating SitemapAgent instance")
    try:
        agent = SitemapAgent()
        log_debug(f"SitemapAgent instance created successfully")
        
        log_debug(f"Calling generate_sitemap method")
        sitemap = agent.generate_sitemap(business_name, business_description, layout_prompt)
        log_debug(f"Sitemap generated successfully with {len(sitemap)} pages")
        
        print("Generated sitemap:", json.dumps(sitemap, indent=2))
        
        # Pause for manual editing only if not called from API
        if not is_api_call:
            log_debug(f"Calling edit_sitemap method")
            edited_sitemap = agent.edit_sitemap()
            log_debug(f"Sitemap edited with {len(edited_sitemap)} pages")
            print("Edited sitemap:", json.dumps(edited_sitemap, indent=2))
        
        log_debug("Script completed successfully")
        
    except Exception as e:
        log_error(f"Unhandled exception: {e}")
        log_error(f"Traceback: {traceback.format_exc()}")
        print(f"Error: {e}")
        sys.exit(1) 