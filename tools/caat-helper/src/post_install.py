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

from src.utils.util_resources import get_prisma_file, get_resource_path
from src.utils.logger import get_json_logger

logger = get_json_logger()

def main():
    """
    Generate prisma client
    """
    logger.info(f"Generating prisma client...")
    # get which prisma file to use based on BUILD_ENV (cloud/local)
    prisma_file = get_prisma_file()
    prisma_path = get_resource_path(prisma_file)

    prisma_generate_cmd = ["prisma", "generate", "--schema", prisma_path]
    subprocess.run(prisma_generate_cmd)
    prisma_dbpush_cmd = ["prisma", "db", "push", "--schema", prisma_path]
    subprocess.run(prisma_dbpush_cmd)
