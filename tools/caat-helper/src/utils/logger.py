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

"""
File: src/logger.py
Description: Utility module to log in JSON format
"""

import inspect
import json
import logging
import os
import sys
import traceback


class FormatterJSON(logging.Formatter):
    """
    Class for formatting logs to JSON
    """

    log_level = "DEBUG"
    service_name = "caat-helper"

    def format(self, record):
        supported_keys = {}  # Initialize supported_keys as an empty dictionary
        if self.usesTime():
            record.asctime = self.formatTime(record, self.datefmt)
            # Define supporting Fields (keys)
            supported_keys = {
                "LogLevel": record.levelname.replace("CRITICAL", "FATAL"),
                "DateTime": f"{record.asctime}.{int(record.msecs)}Z",
                "TraceId": getattr(record, "TraceId", "-"),
                "LogMessage": record.getMessage(),
                "Resources": record.name,
                "Caller": f"{record.filename}:{record.lineno}",
                "FunctionName": record.funcName,
                "ErrorCode": getattr(record, "ErrorCode", "-"),
            }
        # Add to Fields (key) to support stack traces
        if record.exc_info:
            exception_data = traceback.format_exc().splitlines()
            supported_keys["StackTrace"] = exception_data

        # Add user defined Fields (keys)
        for i in inspect.getmembers(record):
            if not i[0].startswith("_") and not inspect.ismethod(i[1]):
                existed_keys = [
                    "args",
                    "asctime",
                    "created",
                    "exc_info",
                    "exc_text",
                    "filename",
                    "funcName",
                    "levelname",
                    "levelno",
                    "lineno",
                    "module",
                    "msecs",
                    "msg",
                    "name",
                    "pathname",
                    "process",
                    "processName",
                    "relativeCreated",
                    "stack_info",
                    "thread",
                    "threadName",
                ]
                if not i[0] in existed_keys:
                    supported_keys[i[0]] = i[1]

        return json.dumps(supported_keys, ensure_ascii=False)


def get_json_logger(name: str = FormatterJSON.service_name, log_level: str = FormatterJSON.log_level):
    """Get Json logger handle

    Args:
        name (str): Service Name
        log_level (str, optional): Log Level. Defaults to FormatterJSON.log_level.

    Returns:
        json_logger: Handle to Json Logger
    """

    json_logger = logging.getLogger(name)
    handler = logging.StreamHandler(sys.stdout)
    if json_logger.hasHandlers():
        json_logger.handlers.clear()
    json_logger.addHandler(handler)

    min_log_level = logging.INFO
    log_level = log_level.upper()
    if log_level == "DEBUG":
        min_log_level = logging.DEBUG
    elif log_level == "INFO":
        min_log_level = logging.INFO
    elif log_level == "WARN":
        min_log_level = logging.WARN
    elif log_level == "ERROR":
        min_log_level = logging.ERROR
    else:
        min_log_level = logging.INFO

    json_logger.setLevel(min_log_level)
    json_logger.propagate = False
    return json_logger
