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

// Import packages
import { useEffect, useState } from "react";
// Import assets
import errorLoading from "../../assets/images/error-load.svg";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

// ImageWithFallback component displayed to show error image if actual image load failed
export const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc,
}: ImageWithFallbackProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsError(true);
    } else {
      setImageSrc(errorLoading);
      setIsError(true);
    }
  };

  return (
    <>
      <img
        src={imageSrc}
        style={{
          width: "100%",
          objectFit: `${isError ? "scale-down" : "contain"}`,
        }}
        alt={alt}
        onError={handleError}
      />
    </>
  );
};
