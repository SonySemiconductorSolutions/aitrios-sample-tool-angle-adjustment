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

from flask import Flask

from .health import api as health_api
from .login import api as login_api
from .reviews import api as reviews_api
from .facilities import api as facility_api
from .customers import api as customer_api
from .devices import api as device_api

def register_apis(app: Flask):
    for api in [login_api, reviews_api, facility_api, health_api, customer_api, device_api]:
        app.register_blueprint(api)
