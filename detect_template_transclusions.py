# -*- coding: utf-8 -*-
"""
This script scans wiki pages and detects pages that transclude specific templates:
1. Template:Youtaite Wiki Infobox
2. Template:Infobox character
3. Template:Singer (based on the uploaded template file)

It also reports whether the pages are admin-protected.

Usage:
    python detect_template_transclusions.py [options]

Dependencies:
    Python Wiki Bot (PWB)
    Bot Password (generate your own bot password on Special:BotPasswords page of your wiki

Options:
    -dry               Performs a dry run (doesn't make any changes, just reports)
    -limit:N           Only process N pages total
    -start:PAGE        Start processing from PAGE
    -namespace:N       Only process pages in namespace N (default is 0 for main namespace)
    -login             Force login before running
    -csv               Output results to a CSV file
    -detail            Show detailed information for each page
"""

import re
import pywikibot
from pywikibot import pagegenerators
import sys
import csv
from datetime import datetime
import os
import requests
import io

# Set up proper UTF-8 encoding for stdout and stderr
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def fix_encoding(text):
    """Fix encoding issues with non-ASCII text"""
    if text is None:
        return ""
    
    if isinstance(text, str) and re.search(r'繧[ｦ-ｯｱ-ﾝ]', text):
        try:
            bytes_data = text.encode('latin1')
            return bytes_data.decode('utf-8', errors='replace')
        except Exception:
            print(f"Warning: Could not fix encoding for text: {text[:50]}...")
            return text
    
    return text

def get_raw_content(page):
    """Get the raw content of a page using ?action=raw"""
    site = page.site
    try:
        raw_content = page.site.getUrl(
            page.title(as_url=True),
            extend_url=True,
            query_params={'action': 'raw'}
        )
        if isinstance(raw_content, bytes):
            return raw_content.decode('utf-8')
        return raw_content
    except Exception as e:
        raw_url = f"{site.protocol()}://{site.hostname()}{site.path()}/{page.title(as_url=True)}?action=raw"
        response = requests.get(raw_url)
        if response.status_code == 200:
            response.encoding = 'utf-8'
            return response.text
        else:
            raise Exception(f"Failed to get raw content: HTTP {response.status_code}")

def is_admin_protected(page):
    """Check if a page is protected for admin-only editing"""
    try:
        protection_info = page.protection()
        if 'edit' in protection_info:
            if protection_info['edit'][0] == 'sysop':
                return True
        return False
    except Exception as e:
        print(f"Error checking protection status for {page.title()}: {e}")
        return False

def detect_transclusions(text):
    """
    Detect template transclusions in the page text.
    Returns a dictionary with boolean flags for each template.
    """
    # Define regex patterns for each template
    patterns = {
        'singer_template': re.compile(r'{{[\s_]*[Ss]inger\b'),
        'youtaite_infobox': re.compile(r'{{[\s_]*[Yy]outaite[\s_]*[Ww]iki[\s_]*[Ii]nfobox\b'),
        'character_infobox': re.compile(r'{{[\s_]*[Ii]nfobox[\s_]*[Cc]haracter\b')
    }
    
    # Check for each template
    results = {}
    for template_name, pattern in patterns.items():
        results[template_name] = bool(re.search(pattern, text))
    
    return results

def main():
    # Parse command line arguments
    local_args = pywikibot.handle_args()
    
    limit = None
    start_page = None
    namespace = 0  # Default to main namespace
    force_login = False
    output_csv = False
    show_detail = False
    
    for arg in local_args:
        if arg.startswith('-limit:'):
            limit = int(arg[7:])
        elif arg.startswith('-start:'):
            start_page = arg[7:]
        elif arg.startswith('-namespace:'):
            namespace = int(arg[11:])
        elif arg == '-login':
            force_login = True
        elif arg == '-csv':
            output_csv = True
        elif arg == '-detail':
            show_detail = True
    
    # Get site and check login status
    site = pywikibot.Site()
    print(f"Current user: {site.username()}")
    print(f"Logged in: {site.logged_in()}")
    
    if force_login or not site.logged_in():
        print("Attempting to login...")
        try:
            site.login()
            print(f"Login attempt result - User: {site.username()}, Logged in: {site.logged_in()}")
        except Exception as e:
            print(f"Login error: {e}")
    
    # Create a generator for all pages in the specified namespace
    print(f"Processing pages in namespace {namespace}")
    gen = pagegenerators.AllpagesPageGenerator(namespace=namespace, site=site)
    
    # Start from specific page if requested
    if start_page:
        print(f"Starting from page: {start_page}")
        start_processing = False
        filtered_gen = []
        for page in gen:
            if page.title() == start_page:
                start_processing = True
            if start_processing:
                filtered_gen.append(page)
        gen = filtered_gen
    
    # Limit number of pages if requested
    if limit:
        print(f"Limiting to {limit} pages")
        gen = list(gen)[:limit]
    
    # Initialize counters and storage
    processed_count = 0
    singer_template_count = 0
    youtaite_infobox_count = 0
    character_infobox_count = 0
    admin_protected_count = 0
    
    # Counts for protected pages with each template
    protected_with_singer = 0
    protected_with_youtaite = 0
    protected_with_character = 0
    
    page_details = []
    
    # Process pages
    for page in gen:
        processed_count += 1
        page_info = {
            'title': page.title(),
            'singer_template': False,
            'youtaite_infobox': False,
            'character_infobox': False,
            'is_admin_protected': False
        }
        
        try:
            # Check if the page is admin-protected
            admin_protected = is_admin_protected(page)
            page_info['is_admin_protected'] = admin_protected
            
            if admin_protected:
                admin_protected_count += 1
            
            # Get the raw page text
            text = get_raw_content(page)
            
            # Ensure text is properly decoded as UTF-8
            if isinstance(text, bytes):
                text = text.decode('utf-8')
            
            # Detect template transclusions
            template_results = detect_transclusions(text)
            
            # Update page info and counters
            page_info['singer_template'] = template_results['singer_template']
            page_info['youtaite_infobox'] = template_results['youtaite_infobox']
            page_info['character_infobox'] = template_results['character_infobox']
            
            if template_results['singer_template']:
                singer_template_count += 1
                if admin_protected:
                    protected_with_singer += 1
            
            if template_results['youtaite_infobox']:
                youtaite_infobox_count += 1
                if admin_protected:
                    protected_with_youtaite += 1
            
            if template_results['character_infobox']:
                character_infobox_count += 1
                if admin_protected:
                    protected_with_character += 1
            
            page_details.append(page_info)
            
            # Output detailed info if requested
            if show_detail:
                try:
                    print(f"Page #{processed_count}: {fix_encoding(page.title())}")
                    if page_info['singer_template']:
                        print("  Transcludes {{Singer}} template")
                    if page_info['youtaite_infobox']:
                        print("  Transcludes {{Youtaite Wiki Infobox}} template")
                    if page_info['character_infobox']:
                        print("  Transcludes {{Infobox character}} template")
                    if page_info['is_admin_protected']:
                        print("  Is protected (admin-only)")
                except UnicodeEncodeError:
                    print(f"Page #{processed_count}: {page.title().encode('ascii', 'replace').decode('ascii')}")
            else:
                if processed_count % 10 == 0:
                    print(f"Processed {processed_count} pages...")
                
        except Exception as e:
            print(f"Error processing page {page.title()}: {e}")
    
    # Output the results
    print("\n============ TEMPLATE TRANSCLUSION RESULTS ============")
    print(f"Total pages processed: {processed_count}")
    print(f"Pages that transclude {{Singer}} template: {singer_template_count}")
    print(f"Pages that transclude {{Youtaite Wiki Infobox}} template: {youtaite_infobox_count}")
    print(f"Pages that transclude {{Infobox character}} template: {character_infobox_count}")
    print(f"Pages that are admin-protected: {admin_protected_count}")
    
    print("\n============ PROTECTION STATISTICS ============")
    print(f"Admin-protected pages with {{Singer}} template: {protected_with_singer}")
    print(f"Admin-protected pages with {{Youtaite Wiki Infobox}} template: {protected_with_youtaite}")
    print(f"Admin-protected pages with {{Infobox character}} template: {protected_with_character}")
    
    # Calculate percentages
    if singer_template_count > 0:
        percent_protected_singer = (protected_with_singer / singer_template_count) * 100
        print(f"Percentage of {{Singer}} pages that are protected: {percent_protected_singer:.2f}%")
    
    if youtaite_infobox_count > 0:
        percent_protected_youtaite = (protected_with_youtaite / youtaite_infobox_count) * 100
        print(f"Percentage of {{Youtaite Wiki Infobox}} pages that are protected: {percent_protected_youtaite:.2f}%")
    
    if character_infobox_count > 0:
        percent_protected_character = (protected_with_character / character_infobox_count) * 100
        print(f"Percentage of {{Infobox character}} pages that are protected: {percent_protected_character:.2f}%")
    
    # Output to CSV if requested
    if output_csv:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"template_transclusion_scan_{timestamp}.csv"
        
        with open(csv_filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            fieldnames = ['title', 'singer_template', 'youtaite_infobox', 'character_infobox', 'is_admin_protected']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for page_info in page_details:
                # Create a new dictionary with properly normalized UTF-8 strings
                normalized_info = {}
                for key, value in page_info.items():
                    if key == 'title' and isinstance(value, str):
                        normalized_info[key] = fix_encoding(value)
                    else:
                        normalized_info[key] = value
                
                try:
                    writer.writerow(normalized_info)
                except UnicodeEncodeError as e:
                    print(f"Encoding error for page {page_info['title']}: {e}")
                    safe_info = {}
                    for k, v in normalized_info.items():
                        if isinstance(v, str):
                            safe_info[k] = v.encode('utf-8', 'replace').decode('utf-8')
                        else:
                            safe_info[k] = v
                    writer.writerow(safe_info)
        
        print(f"\nResults saved to CSV file: {os.path.abspath(csv_filename)}")

if __name__ == "__main__":
    main()
