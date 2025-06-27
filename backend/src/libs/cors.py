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

from flask import Flask
from flask_cors import CORS


def init_app(app: Flask):
    """
    Initializes the Flask application with CORS settings.
    
    Args:
        app (Flask): The Flask application instance to initialize.
    """

    # Add allowed origins from environment variable ADMIN_APP_URL, CONTRACTOR_APP_URL
    allowed_origins = []
    admin_app_url = os.environ.get("ADMIN_APP_URL", None)
    contractor_app_url = os.environ.get("CONTRACTOR_APP_URL", None)

    if os.environ.get("APP_ENV", None) == "local":
        # In local environment, allow all origins
        allowed_origins.append("*")
    else:
        if admin_app_url:
            allowed_origins.append(admin_app_url)

        if contractor_app_url:
            allowed_origins.append(contractor_app_url)

    CORS(app, origins=allowed_origins, supports_credentials=True, max_age=3600)

    # Initialize CORS with the allowed origins
    app.config["CORS_ORIGINS"] = allowed_origins
    app.config["CORS_HEADERS"] = "Content-Type"
