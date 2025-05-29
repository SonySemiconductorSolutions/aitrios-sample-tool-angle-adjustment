/*
------------------------------------------------------------------------
Copyright 2024 Sony Semiconductor Solutions Corp. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
------------------------------------------------------------------------
*/

// Returns the differing substring between two strings.
export const stringDifference = (currentValue: string, newValue: string): string => {
  // Find the index of the first differing character
  let prefixLength = 0;
  while (prefixLength < currentValue.length && currentValue[prefixLength] === newValue[prefixLength]) {
    prefixLength++;
  }

  // If all characters are the same at first, return the part of newValue that's additional
  if (prefixLength === currentValue.length) {
    return newValue.slice(prefixLength);
  }

  // Find the index of the last differing character from the end
  let suffixLength = 0;
  while (
    suffixLength < currentValue.length &&
    currentValue[currentValue.length - 1 - suffixLength] === newValue[newValue.length - 1 - suffixLength]
  ) {
    suffixLength++;
  }

  return newValue.slice(prefixLength, newValue.length - suffixLength);
};

// Validates a string against a given regex pattern.
export const validateString = (value: string, type: 'LOGIN_ID' | 'LOGIN_PASSWORD' | 'URL' | 'NAME' | 'TIMESTAMP'): boolean => {
  if (!value) return true;

  const regexPatterns: Record<string, RegExp> = {
    LOGIN_ID: /^[\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9]+(?:[_-][\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9]+)*$/,
    LOGIN_PASSWORD: /^(?=.{8,})(?!.*\s)(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[_\-!$#%@])|(?=.*[a-z])(?=.*\d)(?=.*[_\-!$#%@])|(?=.*[A-Z])(?=.*\d)(?=.*[_\-!$#%@])).+$/,
    URL: /^(https?|ftp):\/\/[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\/\S*)?$/,
    NAME: /^(?:[A-Za-z0-9\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FF])(?:[\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9_\- ]*[A-Za-z0-9\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FF])?$/,
    TIMESTAMP: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+]00:00$/,
  };

  const regex = regexPatterns[type];
  return regex.test(value);
};
