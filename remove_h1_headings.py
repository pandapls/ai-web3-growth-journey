import os
import re

def remove_h1_headings_and_empty_lines(directory):
    """
    Remove all first-level headings (# headings) and replace consecutive empty lines 
    with a single empty line from .mdx files in the given directory.
    """
    # Counter for tracking processed files
    processed_count = 0
    
    # Walk through the directory and all subdirectories
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.mdx'):
                file_path = os.path.join(root, file)
                
                # Read the file content
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Remove lines that start with a single # (first-level headings)
                # The regex pattern matches lines that start with exactly one # followed by a space
                modified_content = re.sub(r'^# .*$\n?', '', content, flags=re.MULTILINE)
                
                # Replace consecutive empty lines with a single empty line
                # In text files, \n\n represents one empty line, \n\n\n represents two empty lines, etc.
                # We want to replace 2+ empty lines with just one empty line
                modified_content = re.sub(r'\n\n\n+', '\n\n', modified_content)
                
                # Write the modified content back to the file
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(modified_content)
                
                processed_count += 1
                print(f"Processed: {file_path}")
    
    return processed_count

if __name__ == "__main__":
    content_dir = "content"
    
    # Ensure the content directory exists
    if not os.path.isdir(content_dir):
        print(f"Error: The directory '{content_dir}' does not exist.")
        exit(1)
    
    # Process the files
    processed_files = remove_h1_headings_and_empty_lines(content_dir)
    
    if processed_files > 0:
        print(f"Done! Removed first-level headings and reduced consecutive empty lines from {processed_files} .mdx files.")
    else:
        print("No .mdx files found in the content directory.") 