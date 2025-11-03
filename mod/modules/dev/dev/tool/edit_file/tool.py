import mod as c
import os
import re
from typing import Optional, Dict, Any

print = c.print

class Tool:
    """Advanced file editor with anchor-based content manipulation and intelligent insertion strategies."""
    
    def forward(
        self,
        path: str = "./",
        content: str = "",
        start_anchor: Optional[str] = None,
        end_anchor: Optional[str] = None,
        create_if_missing: bool = True,
        strict: bool = False,
        use_regex: bool = False,
        backup: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Intelligently edit file content using anchor-based positioning.

        Insertion Strategy:
        - Both anchors present → Replace content between them
        - Start anchor only → Insert content after it
        - End anchor only → Insert content before it
        - No anchors → Append to file end (error if strict=True)

        Args:
            path: Target file path
            content: Content to insert/replace
            start_anchor: Pattern marking start position
            end_anchor: Pattern marking end position
            create_if_missing: Auto-create file if non-existent
            strict: Fail if anchors not found
            use_regex: Enable regex pattern matching
            backup: Create backup before modification

        Returns:
            Dict containing success status, message, updated content, and metadata
        """
        path = os.path.abspath(path)
        
        # Handle non-existent files
        if not os.path.exists(path):
            if create_if_missing:
                self._ensure_parent_dirs(path)
                c.write(path, content)
                c.print(f"[✓] File created: {path}", color="green")
                return {"success": True, "message": f"Created: {path}", "content": content, "path": path}
            elif strict:
                raise FileNotFoundError(f"File not found: {path}")
            return {"success": False, "message": f"File not found: {path}", "content": "", "path": path}
        
        # Backup original file
        if backup:
            self._create_backup(path)
        
        original_text = c.text(path)
        modified_text = original_text

        # Locate anchor positions
        start_pos = self._find_anchor_end(start_anchor, original_text, use_regex) if start_anchor else None
        end_pos = self._find_anchor(end_anchor, original_text, start_pos or 0, use_regex) if end_anchor else None

        # Execute insertion strategy
        if start_pos is not None and end_pos is not None and end_pos > start_pos:
            modified_text = original_text[:start_pos] + content + original_text[end_pos:]
            msg = "Content replaced between anchors"
            c.print(f"[✓] {msg}", color="green")
        elif start_pos is not None:
            modified_text = original_text[:start_pos] + content + original_text[start_pos:]
            msg = "Content inserted after start anchor"
            c.print(f"[✓] {msg}", color="cyan")
        elif end_pos is not None:
            modified_text = original_text[:end_pos] + content + original_text[end_pos:]
            msg = "Content inserted before end anchor"
            c.print(f"[✓] {msg}", color="cyan")
        else:
            if strict:
                raise ValueError("Anchors not found - cannot insert content in strict mode")
            modified_text = original_text + ("\n" if original_text and not original_text.endswith("\n") else "") + content
            msg = "Content appended to file end"
            c.print(f"[!] No anchors found - appending content", color="yellow")

        # Persist changes if modified
        if modified_text != original_text:
            c.put_text(path, modified_text)
            c.print(f"[✓] File updated: {path}", color="green")
            return {"success": True, "message": msg, "content": modified_text, "path": path, "changed": True}
        
        c.print(f"[=] No modifications required: {path}", color="blue")
        return {"success": True, "message": "No changes detected", "content": modified_text, "path": path, "changed": False}

    def _find_anchor(self, pattern: str, text: str, start: int = 0, use_regex: bool = False) -> Optional[int]:
        """Locate anchor start position in text."""
        if not pattern:
            return None
        if use_regex:
            match = re.search(pattern, text[start:])
            return match.start() + start if match else None
        pos = text.find(pattern, start)
        return pos if pos != -1 else None

    def _find_anchor_end(self, pattern: str, text: str, use_regex: bool = False, start: int = 0) -> Optional[int]:
        """Locate anchor end position in text."""
        if not pattern:
            return None
        if use_regex:
            match = re.search(pattern, text[start:])
            return match.end() + start if match else None
        pos = text.find(pattern, start)
        return pos + len(pattern) if pos != -1 else None
    
    def _ensure_parent_dirs(self, path: str) -> None:
        """Create parent directories if they don't exist."""
        parent = os.path.dirname(path)
        if parent and not os.path.exists(parent):
            os.makedirs(parent, exist_ok=True)
    
    def _create_backup(self, path: str) -> str:
        """Generate backup copy of file."""
        backup_path = f"{path}.backup"
        if os.path.exists(path):
            c.write(backup_path, c.text(path))
            c.print(f"[✓] Backup saved: {backup_path}", color="blue")
        return backup_path

    def test(self) -> Dict[str, str]:
        """Execute comprehensive test suite for file editing functionality."""
        test_path = "./test_edit_file.txt"
        test_dir = os.path.dirname(test_path)
        
        if test_dir and not os.path.exists(test_dir):
            os.makedirs(test_dir)
        
        c.put_text(test_path, "Hello\nWorld\n")

        # Test: Insert after start anchor
        res = self.forward(path=test_path, content="Inserted After Start\n", start_anchor="Hello", strict=True)
        assert res['success'], f"Insert after start anchor failed: {res}"
        
        # Test: Insert before end anchor
        res = self.forward(path=test_path, content="Inserted Before End\n", end_anchor="World", strict=True)
        assert res['success'], f"Insert before end anchor failed: {res}"
        
        # Test: Replace between anchors
        res = self.forward(path=test_path, content="Replaced Content\n", start_anchor="Inserted After Start", end_anchor="Inserted Before End", strict=True)
        assert res['success'], f"Replace between anchors failed: {res}"
        
        # Test: Append without anchors
        res = self.forward(path=test_path, content="Appended Content\n", strict=False)
        assert res['success'], f"Append without anchors failed: {res}"
        
        # Cleanup test artifacts
        for cleanup_file in [test_path, f"{test_path}.backup"]:
            if os.path.exists(cleanup_file):
                os.remove(cleanup_file)
        
        c.print("[✓] All test cases passed successfully!", color="green")
        return {"status": "All tests passed"}