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
import subprocess

from src.db.connection_manager import get_db_instance
from src.utils.logger import get_json_logger
from src.utils.util_resources import get_prisma_file, get_resource_path

logger = get_json_logger()


def push_prisma_schema():
    """
    Apply the Prisma schema to the database.
    This ensures that the database exists before pushing the schema.
    """
    try:
        if not os.getenv("DATABASE_URL"):
            logger.error("Error: The DATABASE_URL environment variable is not set. Please set it and try again.")
            return False
        # Following check is to make sure the database exists in the given DATABASE_URL.
        # If database doesn't exists, skip pushing the prisma schema changes.
        # Reason: The `prisma db push` will create new database if it doesn't exist,
        #   possibly with higher configuration (higher cost).
        if get_db_instance():
            logger.info("Applying Prisma schema to database...")

            # Get the Prisma file and path
            prisma_file = get_prisma_file()
            prisma_path = get_resource_path(prisma_file)

            # Run the prisma db push command
            prisma_dbpush_cmd = ["prisma", "db", "push", "--schema", prisma_path]
            result = subprocess.run(prisma_dbpush_cmd, capture_output=True, text=True, check=True)

            if result.returncode != 0:
                logger.error("Failed to apply Prisma schema to database")

            logger.info("Applying prisma schema to database is completed.")
        else:
            logger.error(
                "\nFailed to connect to the database and unable to apply Prisma schema.\n"
                "Please ensure the database exists and the DATABASE_URL is correct, then try again."
            )
    except Exception:
        logger.error(
            "\nFailed to connect to the database and unable to apply Prisma schema.\n"
            "Please ensure the database exists and the DATABASE_URL is correct, then try again."
        )
