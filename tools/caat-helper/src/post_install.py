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

from src.prisma_generate import generate_prisma_client
from src.utils.logger import get_json_logger

logger = get_json_logger()


def main():
    """
    Main function to generate the Prisma client and apply schema to the database
    """
    try:
        # First generate the Prisma client
        result = generate_prisma_client()

        # Apply the Prisma schema to the database
        if result:
            from src.prisma_push import push_prisma_schema

            push_prisma_schema()

    except Exception:
        logger.error("Unknown error occurred, please try again")
