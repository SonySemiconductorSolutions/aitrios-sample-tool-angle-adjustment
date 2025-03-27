# ------------------------------------------------------------------------
# Copyright 2025 Sony Semiconductor Solutions Corp. All rights reserved.

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

"""
File: backend/src/services/aitrios_strategy.py
"""
from abc import ABC, abstractmethod

# Strategy Interface
class AitriosServiceStrategy(ABC):
    @abstractmethod
    def get_device_image(self, device_id: str, base_url: str, access_token: str):
        pass

    @abstractmethod
    def get_devices(self, base_url: str, access_token: str, device_ids: str):
        pass
