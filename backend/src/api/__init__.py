# ------------------------------------------------------------------------
# Copyright 2024, 2025 Sony Semiconductor Solutions Corp. All rights reserved.

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

# -------------------------------------------------------------------
# Note: Do not sort the imports, as it causes circular import issue.
# -------------------------------------------------------------------
from flask import Flask

from .health import api as health_api
from .login import api as login_api
from .reviews import api as reviews_api
from .facilities import api as facility_api
from .customers import api as customer_api
from .devices import api as device_api
from .device_types import api as device_type_api
from .facility_types import api as facility_type_api
from .data_migration import api as data_migration_api
from .facility_update import api as facility_update_api
from .customers_qr_codes import api as customers_qr_codes_api
from .admins import api as admins_api


def register_apis(app: Flask):
    """
    Register all API blueprints with the Flask app.
    """
    for api in [
        login_api,
        reviews_api,
        facility_api,
        health_api,
        customer_api,
        device_api,
        device_type_api,
        facility_type_api,
        data_migration_api,
        facility_update_api,
        customers_qr_codes_api,
        admins_api,
    ]:
        app.register_blueprint(api)
