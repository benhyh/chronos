import os
import shutil
import tkinter as tk
from tkinter import filedialog

class FileAPI:
    def scan_folder(self, folder_path):
        """Scans a folder and returns its contents"""
        print(f"Scanning folder: {folder_path}")
        
        result = []
        
        if not os.path.exists(folder_path):
            print(f"Folder does not exist: {folder_path}")
            return result
            
        try:
            for item in os.listdir(folder_path):
                item_path = os.path.join(folder_path, item)
                
                if os.path.isdir(item_path):
                    # It's a directory
                    dir_files = []
                    
                    for file_name in os.listdir(item_path):
                        file_path = os.path.join(item_path, file_name)
                        if os.path.isfile(file_path):
                            _, extension = os.path.splitext(file_name)
                            
                            file_stat = os.stat(file_path)
                            size_bytes = file_stat.st_size
                            size_str = self._format_size(size_bytes)
                            
                            dir_files.append({
                                "id": f"file-{file_name}",
                                "name": file_name,
                                "type": "folder",
                                "size": size_str,
                                "extension": extension.lower(),
                                "path": file_path
                            })
                    
                    result.append({
                        "id": f"folder-{item}",
                        "name": item,
                        "type": "folder",
                        "path": item_path,
                        "children": dir_files
                    })
            
            print(f"Found {len(result)} folders")
            return result
            
        except Exception as e:
            print(f"Error scanning folder: {e}")
            return []
    
    def organize_files(self, files_to_move, rules):
        """Moves files to their correct folders based on rules"""
        print(f"Organizing {len(files_to_move)} files")
        
        results = []
        
        for file in files_to_move:
            source_path = file.get("path")
            if not source_path or not os.path.exists(source_path):
                results.append({
                    "id": file.get("id"),
                    "success": False,
                    "error": "File not found"
                })
                continue
                
            # Find correct folder based on rules
            correct_folder = file.get("correctFolder")
            if not correct_folder:
                results.append({
                    "id": file.get("id"),
                    "success": False,
                    "error": "No target folder specified"
                })
                continue
            
            # Create target path
            base_dir = os.path.dirname(os.path.dirname(source_path))
            target_dir = os.path.join(base_dir, correct_folder)
            
            # Create directory if it doesn't exist
            if not os.path.exists(target_dir):
                os.makedirs(target_dir)
                
            # Move file
            target_path = os.path.join(target_dir, os.path.basename(source_path))
            
            try:
                shutil.move(source_path, target_path)
                results.append({
                    "id": file.get("id"),
                    "success": True,
                    "newPath": target_path
                })
            except Exception as e:
                results.append({
                    "id": file.get("id"),
                    "success": False,
                    "error": str(e)
                })
        
        print(f"Organized files: {len([r for r in results if r.get('success')])}/{len(results)}")
        return results
        
    def _format_size(self, size_bytes):
        """Format file size from bytes to human-readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024:
                return f"{size_bytes:.2f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.2f} PB"