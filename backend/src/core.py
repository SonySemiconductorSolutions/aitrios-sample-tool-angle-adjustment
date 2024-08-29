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

import base64
from prisma import Prisma

from src.config import APP_SECRET_KEY
from cryptography.fernet import Fernet
db = Prisma()

# Create fernet encryption/decryption instance
key = bytes(APP_SECRET_KEY, encoding="utf-8")
base64_encoded_key = base64.urlsafe_b64encode(key)
fernet = Fernet(base64_encoded_key)
