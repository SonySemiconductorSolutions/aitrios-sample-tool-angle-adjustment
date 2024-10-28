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
import re

from flask import Flask, g
import uuid

from .api import register_apis
from .config import validate_missing_environments
from .core import db
from .exceptions import handle_api_exception, register_exceptions
from .libs import auth, cors
from .logger import get_json_logger
from flask import request
from .exceptions import APIException, ErrorCodes

logger = get_json_logger()


def create_app():
    db.connect()
    app = Flask(__name__)

    # Generate a TraceId for each request
    @app.before_request
    def start_trace():
        """
        Before request method to set trace ID
        Args:
            None
        Returns:
            None
        """
        g.trace_id = uuid.uuid4().hex

    @app.before_request
    def ignore_robots_txt():
        """
        Before request method to catch the `robots` URL
        Args:
            None
        Returns:
            None
        """
        # pattern to match /robots12345.txt or /robots.txt
        pattern = r"robots\d*\.txt"
        path = request.path
        # Find all matches in the text
        matches = re.findall(pattern, path)
        if any(matches):
            logger.info(f"Ignoring {path} URL")
            raise APIException(ErrorCodes.URL_NOT_FOUND)

    # 3rd-party modules
    logger.info("Cors init is started")
    cors.init_app(app)

    logger.info("Cors init is completed")

    logger.info("auth init is started")

    auth.init_app(app)

    logger.info("auth init is completed")

    # Custom modules

    logger.info("Registering exceptions")

    register_exceptions(app)

    logger.info("Registering exceptions completed")

    # Handle custom API exceptions
    handle_api_exception(app)

    logger.info("Registering APIs")

    register_apis(app)

    logger.info("Registering APIs completed")

    if os.environ.get("DEBUG") is True:
        logger.debug(app.url_map)

    validate_missing_environments()

    logger.info("Validation of missing env completed")

    return app
