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

# setup.py
import pathlib
import subprocess

from setuptools import find_packages, setup


def validate_symlink(path: pathlib.Path) -> bool:
    """
    Validate symlink from file path

    Args:
        path (pathlib.Path): Path of file/folder

    Returns:
        bool: True, if not a symlink
    """
    if not isinstance(path, pathlib.Path):
        path = pathlib.Path(path)
    if path.is_symlink():
        msg = "Symbolic link is not supported. Please use real folder or file"
        raise OSError(f"{msg}", f"{path}")
    return True


def get_version():
    """
    Get version from text file
    """
    filename = "./version.txt"
    if validate_symlink(filename):
        with open(filename, "r", encoding="utf-8") as fh_:
            lines = fh_.read().splitlines()

    version = lines[0].split(",")[0]
    return version


def get_commit_id():
    """
    Get commit ID to include in wheel file
    """
    try:
        commit_id = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"]).strip()
        return commit_id.decode("utf-8")
    except subprocess.CalledProcessError:
        return "unknowncommit"


def get_requirements():
    """
    Get requirements list
    """
    filename = "./requirements.txt"
    if validate_symlink(filename):
        with open(filename, "r", encoding="utf-8") as fh_:
            lines = fh_.read().splitlines()

    # Remove empty lines and comments from the list of lines
    requirements = [line.strip() for line in lines if line.strip() and not line.strip().startswith("#")]
    print(requirements)
    return requirements


PACKAGE_NAME = "caat-helper"
PACKAGE_VERSION = get_version()
COMMIT_ID = get_commit_id()

setup(
    name=PACKAGE_NAME,
    version=f"{PACKAGE_VERSION}+{COMMIT_ID}",
    packages=find_packages(),
    package_data={"": ["./data/prisma/*.prisma", "./data/excel/*.xlsx"]},
    include_package_data=True,
    install_requires=get_requirements(),
    entry_points={
        "console_scripts": [
            "caat-helper=src.cmd_parser:cli",
            "caat-helper-init=src.post_install:main",
        ],
    },
)
