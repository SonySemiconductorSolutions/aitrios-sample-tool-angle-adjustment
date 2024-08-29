# ------------------------------------------------------------------------
# Copyright 2024 Sony Semiconductor Solutions Corp. All rights reserved.

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

# http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------

"Security Util Class"

import base64

from cryptography.fernet import Fernet

from src.config import APP_SECRET_KEY

if APP_SECRET_KEY is not None:
    # Create fernet encryption/decryption instance
    key = bytes(APP_SECRET_KEY, encoding="utf-8")
    base64_encoded_key = base64.urlsafe_b64encode(key)
    fernet = Fernet(base64_encoded_key)

def encrypt_data(plain_data: str) -> str:
    """Encrypts the data

    Args:
        plain_data (str): data which needs to be encrypted

    Returns:
        str: encrypted data
    """
    plain_data_in_bytes = plain_data.encode("utf-8")
    # decode the bytes data returned from fernet into string
    return fernet.encrypt(plain_data_in_bytes).decode('utf-8')

def decrypt_data(encrypted_data: str) -> str:
    """Decrypts the data

    Args:
        encrypted_data (str): data which needs to be decrypted

    Returns:
        str: decrypted data
    """
    # decode the bytes data returned from fernet into string
    return fernet.decrypt(encrypted_data).decode("utf-8")
