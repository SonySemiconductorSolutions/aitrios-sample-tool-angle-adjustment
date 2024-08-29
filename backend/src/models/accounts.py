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

from datetime import datetime, timedelta, timezone
import jwt
from flask_login import UserMixin
from prisma.models import admin
from werkzeug.security import check_password_hash

from src.config import APP_SECRET_KEY, DEFAULT_JWT_EXPIRED_MINUTES
from src.core import db


class Account(admin, UserMixin):
    @staticmethod
    def get_user(login_id: str):
        """
        Retrieves an account by login ID.
        
        Args:
            login_id (str): The login ID of the admin.
        
        Returns:
            Account: An instance of Account if found, otherwise None.
        """
        account_model = db.admin.find_first(where={"login_id": login_id})
        if not account_model:
            return None

        return Account(**account_model.model_dump())

    def validate_password(self, password: str):
        """
        Validates the given input against the stored hash.
        
        Returns:
            bool: True if the input is valid else False.
        """
        return check_password_hash(self.admin_password, password)

    def create_jwt_token(self):
        """
        Creates a JWT token.
        
        Returns:
            str: A JWT token string.
        """
        payload = {
            "login_id": self.login_id,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=DEFAULT_JWT_EXPIRED_MINUTES),
        }
        return jwt.encode(payload, APP_SECRET_KEY)
