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

from flask import Flask
from flask_cors import CORS


def init_app(app: Flask):
    """
    Initializes the Flask application with CORS settings.
    
    Args:
        app (Flask): The Flask application instance to initialize.
    """
    CORS(app)
    app.config["CORS_HEADERS"] = "Content-Type"
