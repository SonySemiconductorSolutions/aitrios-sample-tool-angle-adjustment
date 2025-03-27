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

from datetime import datetime, timedelta, timezone
from typing import List

from prisma import Prisma
from src.schemas import *
from src.utils import to_list
from werkzeug.exceptions import BadRequest


# def build_review_query(connection: Prisma, parameters: ReviewListSchema):
#     """
#     Method to build review query
#     Args:
#         connection (Prisma connection)
#         parameters (ReviewListSchema): Query parameters
#     """
#     take = None
#     skip = None
#     where = dict()
#     # Include customer table
#     include = {"facility": {}, "customer": {}, "device": {}}

#     sort = [{"last_updated_by": "desc"}]

#     if parameters.pagination:
#         take = parameters.page_size
#         if parameters.page > 0:
#             skip = (parameters.page - 1) * parameters.page_size
#             total_records = connection.review.count()
#             take = min(parameters.page_size, total_records - skip)
#             skip = skip if take > 0 else None

#     if any(
#         [
#             parameters.facility_name,
#             parameters.prefecture,
#             parameters.municipality,
#             parameters.status,
#             parameters.customer_id
#         ]
#     ):
#         and_conditions = []

#         if parameters.facility_name:
#             facility_names = to_list(parameters.facility_name, split_char=" ")
#             for facility_name in facility_names:
#                 and_conditions.append({"facility": {"some": {"facility_name": {"contains": facility_name}}}})

#         if parameters.prefecture:
#             and_conditions.append({"facility": {"some": {"prefecture": {"in": to_list(parameters.prefecture)}}}})

#         if parameters.municipality:
#             and_conditions.append({"facility": {"some": {"municipality": {"contains": parameters.municipality}}}})

#         if parameters.status:
#             and_conditions.append({"facility": {"some": {"status": {"in": status_to_list(parameters.status)}}}})
#         # Check if customer ID is provided and apply condition.
#         if parameters.customer_id:
#             and_conditions.append({"customer_id": int(parameters.customer_id)})

#         if and_conditions:
#             where["AND"] = and_conditions

#     data = connection.review.find_many(take=take, skip=skip, where=where, include=include, order=sort)

#     count = connection.review.count(where=where)

#     return data, count


def build_device_query(connection: Prisma, customer_id: int, parameters: ReviewListSchema):
    """
    Method to query the devices with the given filters
    Args:
        connection (Prisma connection)
        customer_id (str): Customer ID to filter the devices
        parameters (ReviewListSchema): Query parameters
    """
    take = None
    skip = None

    # By default, query by customer ID
    where = {"facility": {"customer_id": customer_id}}
    # Include facility record
    include = {"facility": {"include": {"facility_type": True}}}

    # Initialize the status count filter
    status_count_filters = []

    if parameters.pagination:
        take = parameters.page_size
        if parameters.page > 0:
            skip = (parameters.page - 1) * parameters.page_size
            total_records = connection.device.count()
            take = min(parameters.page_size, total_records - skip)
            skip = skip if take > 0 else None

    # Check if any parameters are provided
    if any(
        [
            parameters.facility_name,
            parameters.prefecture,
            parameters.municipality,
            parameters.status,
        ]
    ):
        and_conditions = []

        # Filter by facility name
        if parameters.facility_name:
            facility_names = to_list(parameters.facility_name, split_char=" ")
            for facility_name in facility_names:
                and_conditions.append({"facility": {"facility_name": {"contains": facility_name}}})

        # Filter by prefecture
        if parameters.prefecture:
            and_conditions.append({"facility": {"prefecture": {"in": to_list(parameters.prefecture)}}})

        # Filter by municipality
        if parameters.municipality:
            and_conditions.append({"facility": {"municipality": {"contains": parameters.municipality}}})

        # Set the result count conditions
        status_count_filters = and_conditions.copy()
        # Filter by device result
        if parameters.status:
            and_conditions.append({"result": {"in": status_to_list(parameters.status)}})

        if and_conditions:
            where["AND"] = and_conditions

    # Query with the given parameters
    data = connection.device.find_many(take=take, skip=skip, where=where, include=include)
    _where = {"facility": {"customer_id": customer_id}}

    # Check if the any filters are provided by user
    if status_count_filters:
        _where["AND"] = status_count_filters

    # Get the status count with user provided condition
    status_counts = connection.device.group_by(
        by=["result"],
        where=_where,
        count={"result": True},
    )

    # Set status count
    result_count = {}
    for status_count in status_counts:
        if status_count["result"] == DeviceReviewAllowedEnums.INITIAL_STATE.value:
            # 1
            result_count["initial_state"] = status_count["_count"]["result"]
        if status_count["result"] == DeviceReviewAllowedEnums.REQUESTING_FOR_REVIEW.value:
            # 2
            result_count["requesting"] = status_count["_count"]["result"]
        if status_count["result"] == DeviceReviewAllowedEnums.REJECTED.value:
            # 3
            result_count["rejected"] = status_count["_count"]["result"]
        if status_count["result"] == DeviceReviewAllowedEnums.APPROVED.value:
            # 4
            result_count["approved"] = status_count["_count"]["result"]

    total_records = connection.device.count(where=where)
    return data, total_records, result_count


def get_checking_reviews_info(data: List[ReviewSchema], late_minutes: int) -> dict:
    """
    Calculates the number of current and late reviews based on the provided data.

    Args:
        data (List[ReviewSchema]): A list of review objects conforming to the ReviewSchema.
        late_minutes (int): The threshold in minutes to determine if a review is late.

    Returns:
        dict: A dictionary containing the count of late reviews, current reviews, and the late minutes threshold.
    """
    late = 0
    current = 0
    for review in data:
        result = review.result
        # If the device review status is applied, skip.
        if result != DeviceReviewAllowedEnums.REQUESTING_FOR_REVIEW.value:
            continue

        current = current + 1
        # Difference bw the created datetime and the current time
        diff = datetime.now(tz=timezone.utc) - review.created_at_utc
        # Check if the difference is less than the late minutes
        if review.created_at_utc and diff.seconds < late_minutes * 60:
            late = late + 1

    info = {
        "late": late,
        "current": current,
        "minutes": late_minutes,
    }

    return info


def status_to_list(status_parameter: str) -> List[int]:
    """
    Status need to use special converter to list.
    In the UI, 未申請 will filter two status: 未確認 (0), 施設確認済み (1), thus we will split element 01 from api
    to two elements 0 and 1.

    :param status_parameter: str, status parameter

    :return: list of integers, which is all status need to filter.
    """
    temp_list: List[str] = to_list(status_parameter)
    if "01" in temp_list:
        temp_list.remove("01")
        temp_list.extend(["0", "1"])

    try:
        return [int(element) for element in temp_list]
    except ValueError:
        raise BadRequest("Bad request parameter: status")
