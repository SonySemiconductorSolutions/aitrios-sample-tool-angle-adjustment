# ------------------------------------------------------------------------
# Copyright 2025 Sony Semiconductor Solutions Corp. All rights reserved.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------

from flask import Blueprint
from flask_login import current_user, login_required
from flask_pydantic import validate
from src.core import db
from src.exceptions import APIException, ErrorCodes
from src.schemas.accounts import AdminCreateRequestSchema
from src.schemas.response import ResponseHTTPSchema
from werkzeug.security import generate_password_hash

api = Blueprint("admins", __name__, url_prefix="/admins")


@api.post("")
@login_required
@validate()
def create_admin(body: AdminCreateRequestSchema):
    """
    Create a new admin account.
    POST /admins

    payload = {
        "login_id": "replace-with-new-admin",
        "password": "replace-with-password",
    }
    """

    # Check if login_id already exists
    existing = db.admin.find_first(where={"login_id": body.login_id})
    if existing:
        raise APIException(ErrorCodes.ADMIN_ALREADY_EXISTS)

    # Fetch current admin's name from DB
    creator = db.admin.find_first(where={"id": current_user.id})
    admin_name = creator.login_id if creator and hasattr(creator, "login_id") else current_user.login_id

    hashed_password = generate_password_hash(body.password)
    admin = db.admin.create(
        data={
            "login_id": body.login_id,
            "admin_password": hashed_password,
            "created_by": admin_name,
            "last_updated_by": admin_name,
        }
    )
    return ResponseHTTPSchema(status_code=201, message="Admin created", data={"id": admin.id}).make_response()
