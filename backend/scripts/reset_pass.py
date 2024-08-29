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

import argparse
import datetime

from prisma import Prisma
from werkzeug.security import generate_password_hash


def reset_password(login_id: str, new_passwd: str) -> None:
    """
    Method to reset user's credentials
    """

    db = Prisma()
    db.connect()

    # Check if the user exists
    user = db.admin.find_unique(where={"login_id": login_id})
    if not user:
        print(f"User with login_id '{login_id}' does not exist.")
        db.disconnect()
        return

    hashed_password = generate_password_hash(new_passwd)

    db.admin.update(
        where={"login_id": login_id},
        data={
            "admin_password": hashed_password,
            "last_updated_at_utc": datetime.datetime.now(datetime.timezone.utc),
            "last_updated_by": "admin",
        },
    )

    print(f"Password for user '{login_id}' has been reset.")
    db.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reset AAT admin's password")

    parser.add_argument("-l", "--login-id", type=str,
                         help="The login ID of the admin", required=True)
    parser.add_argument("-p", "--pwd", type=str,
                         help="The new password for the admin", required=True)

    args = parser.parse_args()

    _login_id = args.login_id
    new_pass = args.pwd

    reset_password(_login_id, new_pass)
