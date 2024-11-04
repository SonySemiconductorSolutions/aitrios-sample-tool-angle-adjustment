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

import subprocess

from src.utils.logger import get_json_logger
from src.utils.util_resources import get_prisma_file, get_resource_path

logger = get_json_logger()


def generate_prisma_client():
    """
    Generate the Prisma client using the appropriate schema
    """
    logger.info("Generating Prisma client...")

    # Get which Prisma file to use based on APP_ENV (local/azure/aws)
    prisma_file = get_prisma_file()
    prisma_path = get_resource_path(prisma_file)

    # Run the prisma generate command
    prisma_generate_cmd = ["prisma", "generate", "--schema", prisma_path]
    result = subprocess.run(prisma_generate_cmd, capture_output=True, text=True, check=True)

    if result.returncode != 0:
        logger.error("Failed to generate Prisma client")
        return False

    logger.info("Generating prisma client is completed.")
    return True
