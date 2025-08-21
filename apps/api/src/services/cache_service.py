"""
Cache management service for TinyTroupe API
Handles session-scoped caches and cleanup
"""

import os
import time
import glob
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class CacheService:
    """Manages session-scoped caches following TinyTroupe patterns"""
    
    def __init__(self, cache_root: str = "cache"):
        self.cache_root = cache_root
        self.sessions_dir = os.path.join(cache_root, "sessions")
        self.global_dir = os.path.join(cache_root, "global")
        
        # Ensure directories exist
        os.makedirs(self.sessions_dir, exist_ok=True)
        os.makedirs(self.global_dir, exist_ok=True)
        
        # Cache cleanup policy (hours)
        self.session_cache_ttl = 24  # 24 hours
        self.global_cache_ttl = 168  # 1 week
    
    def get_session_cache_path(self, session_id: str) -> str:
        """Get cache file path for a session"""
        return os.path.join(self.sessions_dir, f"session_{session_id}.json")
    
    def get_global_cache_path(self, cache_name: str) -> str:
        """Get cache file path for global data"""
        return os.path.join(self.global_dir, f"{cache_name}.json")
    
    def cleanup_expired_sessions(self) -> Dict[str, Any]:
        """Clean up expired session caches"""
        cutoff_time = time.time() - (self.session_cache_ttl * 3600)
        cleanup_results = {"removed": 0, "errors": []}
        
        try:
            session_files = glob.glob(os.path.join(self.sessions_dir, "*.json"))
            
            for cache_file in session_files:
                try:
                    file_time = os.path.getmtime(cache_file)
                    if file_time < cutoff_time:
                        os.remove(cache_file)
                        cleanup_results["removed"] += 1
                except Exception as e:
                    cleanup_results["errors"].append(f"Failed to remove {cache_file}: {str(e)}")
                    
        except Exception as e:
            cleanup_results["errors"].append(f"Cleanup failed: {str(e)}")
        
        return cleanup_results
    
    def clear_all_sessions(self) -> Dict[str, Any]:
        """Clear all session caches (use carefully!)"""
        results = {"removed": 0, "errors": []}
        
        try:
            session_files = glob.glob(os.path.join(self.sessions_dir, "*.json"))
            
            for cache_file in session_files:
                try:
                    os.remove(cache_file)
                    results["removed"] += 1
                except Exception as e:
                    results["errors"].append(f"Failed to remove {cache_file}: {str(e)}")
                    
        except Exception as e:
            results["errors"].append(f"Clear all failed: {str(e)}")
        
        return results
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        stats = {
            "session_caches": 0,
            "global_caches": 0, 
            "total_size_mb": 0.0,
            "oldest_session": None,
            "newest_session": None
        }
        
        try:
            # Count session caches
            session_files = glob.glob(os.path.join(self.sessions_dir, "*.json"))
            stats["session_caches"] = len(session_files)
            
            # Count global caches  
            global_files = glob.glob(os.path.join(self.global_dir, "*.json"))
            stats["global_caches"] = len(global_files)
            
            # Calculate total size
            all_files = session_files + global_files
            total_size = sum(os.path.getsize(f) for f in all_files if os.path.exists(f))
            stats["total_size_mb"] = round(total_size / (1024 * 1024), 2)
            
            # Find oldest and newest sessions
            if session_files:
                file_times = [(f, os.path.getmtime(f)) for f in session_files]
                oldest = min(file_times, key=lambda x: x[1])
                newest = max(file_times, key=lambda x: x[1])
                
                stats["oldest_session"] = {
                    "file": os.path.basename(oldest[0]),
                    "created": datetime.fromtimestamp(oldest[1]).isoformat()
                }
                stats["newest_session"] = {
                    "file": os.path.basename(newest[0]), 
                    "created": datetime.fromtimestamp(newest[1]).isoformat()
                }
                
        except Exception as e:
            stats["error"] = str(e)
        
        return stats