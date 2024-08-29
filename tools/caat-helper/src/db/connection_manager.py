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

"""Connection Manager for database"""

from prisma import Prisma


# Singleton class- Checks if the db is initialized
class SingletonDB:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(SingletonDB, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "db"):
            self.db = None


def get_db_instance():
    """
    Return existing DB instance if not None
    Else, create an instance, connect to DB and return db instance
    """
    singleton_db = SingletonDB()

    if singleton_db.db is None:
        singleton_db.db = Prisma()
        singleton_db.db.connect()

    return singleton_db.db
