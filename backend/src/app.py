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

from .api import register_apis
from .config import validate_missing_environments
from .core import db
from .exceptions import register_exceptions, handle_api_exception
from .libs import auth, cors
from .logger import get_json_logger

logger = get_json_logger()

def create_app():
    db.connect()
    app = Flask(__name__)

    # 3rd-party modules
    logger.info(f"Cors init is started")
    cors.init_app(app)
    
    logger.info(f"Cors init is completed")

    logger.info(f"auth init is started")

    auth.init_app(app)

    logger.info(f"auth init is completed")

    # Custom modules
    
    logger.info(f"Registering exceptions")

    register_exceptions(app)
    
    logger.info(f"Registering exceptions completed")

    # Handle custom API exceptions
    handle_api_exception(app)


    logger.info(f"Registering APIs")

    register_apis(app)
    
    logger.info(f"Registering APIs completed")


    if os.environ.get("DEBUG") is True:
        logger.debug(app.url_map)

    validate_missing_environments()

    logger.info(f"Validation of missing env completed")

    return app
