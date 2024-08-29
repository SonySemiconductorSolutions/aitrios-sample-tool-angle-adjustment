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

import os

DATABASE_URL = os.getenv("DATABASE_URL", None)
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", None)
DEFAULT_PAGE_SIZE = int(os.getenv("DEFAULT_PAGE_SIZE", 100))
DEFAULT_JWT_EXPIRED_MINUTES = int(os.getenv("DEFAULT_JWT_EXPIRED_MINUTES", 1440))
SSL_VERIFICATION = True
HTTP_TIMEOUT = 55


# Section to check missing env
class MissingEnvironmentVariableException(Exception):
    pass


def validate_missing_environments():
    """
    Validates that all required environment variables are set.
    
    Raises:
        MissingEnvironmentVariableException: If any required environment variable is missing.
    """
    required_envs = ["DATABASE_URL", "APP_SECRET_KEY"]

    for required_env in required_envs:
        if not os.getenv(required_env):
            raise MissingEnvironmentVariableException(f"Missing required environment variable: {required_env}")
