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

# File not used
# from flask import Blueprint
# from flask_login import login_required
# from flask_pydantic import validate

# from src.core import db
# from src.schemas import ListFacilityTypesRequestSchema, FacilityTypeGetResponseSchema, FacilityTypeListResponseSchema

# api = Blueprint("facility_types", __name__, url_prefix="/facility_types")

# -- API not used --
# @api.get("")
# @login_required
# @validate()
# def list_facility_types(query: ListFacilityTypesRequestSchema):
#     where = {}
#     if query.type:
#         where["type"] = query.type
#     facility_types = db.facility_types.find_many(where=where)

#     data = list()
#     for facility_type in facility_types:
#         model = FacilityTypeGetResponseSchema.model_validate(facility_type.model_dump())
#         model.load_image()
#         data.append(model)

#     return FacilityTypeListResponseSchema(data=data).make_response()
