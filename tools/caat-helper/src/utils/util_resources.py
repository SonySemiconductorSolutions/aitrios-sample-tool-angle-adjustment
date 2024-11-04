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
import os
import sys
import mimetypes

import pkg_resources
from src.utils.logger import get_json_logger

logger = get_json_logger()

def get_resource_path(file_path):
    """Returns the absolute path to given file within the package."""
    resource_path = os.path.join("../", file_path)
    return pkg_resources.resource_filename(__name__, resource_path)


def image_to_base64(image_path):
    """Converts image to base64 string

    Args:
        image_path (str): Path to the image

    Returns:
        str: base64 string
    """
    try:
        # Open the image file in binary mode
        with open(image_path, "rb") as image_file:
            # Read the binary data of the image
            image_data = image_file.read()
            # Encode the binary data to base64
            base64_encoded = base64.b64encode(image_data)
            # Convert the base64 bytes to a string
            base64_string = base64_encoded.decode("utf-8")
            mime_type = mimetypes.guess_type(image_path)[0]
            base64_string = f"data:{mime_type};base64,{base64_string}"
        return base64_string
    except Exception as _exec:
        logger.exception(f"Error converting the sample image to base64 string {_exec}")
        sys.exit(1)


def get_prisma_file():
    """
    Check if APP_ENV is set
    if set to local/aws -> postgres prisma
    if set to azure -> sqlserver prisma
    """

    app_env = os.getenv("APP_ENV", "azure")
    if app_env.lower() == "local" or app_env.lower() == "aws":
        logger.info("APP_ENV is %s, using prisma with postgres DB", app_env)
        prisma_file = "data/prisma/schema.postgres.prisma"
    else:
        logger.info("APP_ENV is azure, using prisma with sqlserver DB")
        prisma_file = "data/prisma/schema.prisma"
    return prisma_file
