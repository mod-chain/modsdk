import mod as c
import hashlib
import secrets
import json
from typing import Optional, Dict, Any

print = c.print

class UserAuth:
    def __init__(self, storage_path: str = '~/.fix/cache/users.json'):
        self.storage_path = c.os.path.expanduser(storage_path)
        c.os.makedirs(c.os.path.dirname(self.storage_path), exist_ok=True)
        self.users = self._load_users()
        self.sessions = {}

    def _load_users(self) -> Dict:
        if c.os.path.exists(self.storage_path):
            with open(self.storage_path, 'r') as f:
                return json.load(f)
        return {}

    def _save_users(self):
        with open(self.storage_path, 'w') as f:
            json.dump(self.users, f, indent=2)

    def _hash_password(self, password: str, salt: str = None) -> tuple:
        if salt is None:
            salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return pwd_hash.hex(), salt

    def register(self, username: str, password: str) -> Dict[str, Any]:
        if username in self.users:
            return {'success': False, 'message': 'User already exists'}
        pwd_hash, salt = self._hash_password(password)
        self.users[username] = {'password_hash': pwd_hash, 'salt': salt}
        self._save_users()
        return {'success': True, 'message': 'User registered successfully'}

    def sign_in(self, username: str, password: str) -> Dict[str, Any]:
        if username not in self.users:
            return {'success': False, 'message': 'Invalid credentials'}
        user = self.users[username]
        pwd_hash, _ = self._hash_password(password, user['salt'])
        if pwd_hash != user['password_hash']:
            return {'success': False, 'message': 'Invalid credentials'}
        token = secrets.token_urlsafe(32)
        self.sessions[token] = username
        return {'success': True, 'message': 'Signed in successfully', 'token': token, 'username': username}

    def sign_out(self, token: str) -> Dict[str, Any]:
        if token in self.sessions:
            del self.sessions[token]
            return {'success': True, 'message': 'Signed out successfully'}
        return {'success': False, 'message': 'Invalid token'}

    def verify_token(self, token: str) -> Optional[str]:
        return self.sessions.get(token)

    def set_key_instance(self, token: str, key: str, value: Any) -> Dict[str, Any]:
        username = self.verify_token(token)
        if not username:
            return {'success': False, 'message': 'Unauthorized'}
        if username not in self.users:
            return {'success': False, 'message': 'User not found'}
        if 'data' not in self.users[username]:
            self.users[username]['data'] = {}
        self.users[username]['data'][key] = value
        self._save_users()
        return {'success': True, 'message': 'Key set successfully', 'key': key, 'value': value}

    def get_key_instance(self, token: str, key: str) -> Dict[str, Any]:
        username = self.verify_token(token)
        if not username:
            return {'success': False, 'message': 'Unauthorized'}
        if username not in self.users or 'data' not in self.users[username]:
            return {'success': False, 'message': 'Key not found'}
        value = self.users[username]['data'].get(key)
        if value is None:
            return {'success': False, 'message': 'Key not found'}
        return {'success': True, 'key': key, 'value': value}

    def get_user_header(self, token: str) -> Dict[str, Any]:
        username = self.verify_token(token)
        if not username:
            return {'success': False, 'message': 'Unauthorized'}
        return {'success': True, 'username': username, 'Authorization': f'Bearer {token}'}