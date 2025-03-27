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
import { useStore } from "../store";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { Box, Stack, Typography, styled } from "@mui/joy";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import Draggable, { DraggableBounds, DraggableEvent } from "react-draggable";

interface GridOverlayProps {
    gridcolor: string;
    gridrows: number; // Number of rows
    gridcolumns: number; // Number of columns
}

interface PositionProps {
    x: number;
    y: number;
}

interface ImageWithFallbackProps {
    src: string | undefined;
    alt: string;
    height: React.CSSProperties["height"];
    aspectRatio: number;
    fallbackIconSize: number;
    fallbackWithIconOnly?: boolean;
    showGrid?: boolean;
    preserveAspectRatio?: boolean;
    draggable?: boolean;
    draggedPosition?: PositionProps;
    setDraggedPosition?: React.Dispatch<React.SetStateAction<PositionProps>>;
    setDraggedImage?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const GRID_ROWS = 4;
const GRID_COLUMNS = 4;
const IMAGE_NOT_SUBMITTED = "NoImageSubmitted";
const IMAGE_BG_FILL_COLOR = "#BCC3D0";
const IMAGE_CANVAS_FILL_COLOR = "#ECF3F9";

const GridOverlay = styled(Box)<GridOverlayProps>(({ gridcolor, gridrows, gridcolumns }) => ({
    display: "grid",
    gridTemplateRows: `repeat(${gridrows}, 1fr)`,
    gridTemplateColumns: `repeat(${gridcolumns}, 1fr)`,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    "& > div": {
        borderRight: `2px solid ${gridcolor}`,
        borderBottom: `2px solid ${gridcolor}`,
        [`&:nth-of-type(${gridcolumns}n)`]: {
            borderRight: "none",
        },
        [`&:nth-last-of-type(-n+${gridcolumns})`]: {
            borderBottom: "none",
        },
    },
}));


export const ImageWithFallback = ({
    src,
    alt,
    height,
    aspectRatio,
    fallbackIconSize,
    draggedPosition,
    setDraggedImage,
    setDraggedPosition,
    showGrid = false,
    draggable = false,
    preserveAspectRatio = true,
    fallbackWithIconOnly = false,
    ...props
}: ImageWithFallbackProps) => {
    const { gridLine } = useStore();
    const { t } = useTranslation();

    const imageRef = useRef<HTMLImageElement>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [dragCursor, setDragCursor] = useState<React.CSSProperties["cursor"]>("grab");
    const [imageBounds, setImageBounds] = useState<DraggableBounds>({ left: 0, right: 0, top: 0, bottom: 0 });

    // Function to determine the image error based on the image src
    const getImageError = (imageSrc: string | undefined) => {
        if (!imageSrc) {
            return "reviewRequestPage.failedToLoadImage"; // src is undefined or empty string
        }

        if (imageSrc === IMAGE_NOT_SUBMITTED) {
            return "reviewRequestPage.notSubmitted"; // Contractor has not submitted the review
        }

        return null;
    };

    // Function to calculate draggable bounds using image dimension
    const calculateBounds = () => {
        const imageElement = imageRef.current;
        if (imageElement) {
            const rect = imageElement.getBoundingClientRect();
            const newBounds = {
                left: -rect.width / 4,
                right: rect.width / 4,
                top: -rect.height / 4,
                bottom: rect.height / 4,
            };
            // Adjust dragged position within the new bounds
            setDraggedPosition?.(prevPosition => {
                const newX = Math.max(newBounds.left, Math.min(prevPosition.x, newBounds.right));
                const newY = Math.max(newBounds.top, Math.min(prevPosition.y, newBounds.bottom));
                return { x: newX, y: newY };
            });
            setImageBounds(newBounds);
        }
    };

    // Effect to update imageError when src changes
    useEffect(() => {
        const error = getImageError(src);
        setImageError(error);

        // This ensures that if the window is resized, the draggable bounds
        // are updated according to the new dimensions of the image
        window.addEventListener("resize", calculateBounds);
        return () => {
            window.removeEventListener("resize", calculateBounds);
        }
    }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handles Image error
    const handleImageError = () => {
        setImageError("reviewRequestPage.failedToLoadImage");
    };

    // Function to create the image after the drag
    const getDraggedImage = (data: PositionProps): string | undefined => {
        const imageElement = imageRef.current;

        if (!imageElement) return;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) return;

        // Set canvas dimensions to match the natural size of the image
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;

        // Fill the canvas background fill
        context.fillStyle = IMAGE_CANVAS_FILL_COLOR;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate the scale factor between the current and natural dimensions
        const scaleX = imageElement.naturalWidth / imageElement.width;
        const scaleY = imageElement.naturalHeight / imageElement.height;

        // Scale the drag position to match the natural size
        const scaledX = data.x * scaleX;
        const scaledY = data.y * scaleY;

        // Draw the image onto the canvas with the updated (scaled) position
        context.drawImage(imageElement, scaledX, scaledY, imageElement.naturalWidth, imageElement.naturalHeight);

        // Convert the canvas to a data URL (base64 string)
        return canvas.toDataURL("image/jpeg");
    };

    // Handles Image drag start
    const handleDragStart = () => {
        setDragCursor("grabbing");
    };

    // Handles Image drag move
    const handleDragMove = (_: DraggableEvent, data: PositionProps) => {
        setDraggedPosition?.({ x: data.x, y: data.y });
    };

    // Handles Image drag stop
    const handleDragStop = (_: DraggableEvent, data: PositionProps) => {
        const draggedImage = getDraggedImage(data);
        if (draggedImage) setDraggedImage?.(draggedImage);
        setDragCursor("grab");
    };

    // Function to render the image HTML
    const renderImage = () => (
        <img
            ref={imageRef}
            src={src}
            alt={alt}
            onError={handleImageError}
            onLoad={calculateBounds}
            style={{
                width: "100%",
                height: "100%",
                cursor: draggable ? dragCursor : "default",
                objectFit: preserveAspectRatio ? "contain" : "fill",
            }}
            {...props}
        />
    );

    return imageError ? (
        <Stack
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height={height}
            bgcolor={IMAGE_BG_FILL_COLOR}
        >
            <ImageNotSupportedOutlined sx={{ fontSize: fallbackIconSize }} />
            {!fallbackWithIconOnly && <Typography textAlign="center">{t(imageError)}</Typography>}
        </Stack>
    ) : (
        <Box
            position="relative"
            maxWidth="100%"
            maxHeight={height}
            bgcolor={showGrid && gridLine.visibility ? IMAGE_BG_FILL_COLOR : undefined}
            sx={{ mx: "auto", aspectRatio: aspectRatio, overflow: "hidden" }}
        >
            {draggable ? (
                <Draggable
                    nodeRef={imageRef}
                    bounds={imageBounds}
                    position={draggedPosition}
                    onStart={handleDragStart}
                    onDrag={handleDragMove}
                    onStop={handleDragStop}
                    onMouseDown={(e: MouseEvent) => e.preventDefault()}
                >
                    {renderImage()}
                </Draggable>
            ) : (
                renderImage()
            )}
            {showGrid && gridLine.visibility && (
                <GridOverlay gridcolor={gridLine.color} gridrows={GRID_ROWS} gridcolumns={GRID_COLUMNS} data-testid="grid-overlay">
                    {Array.from({ length: GRID_ROWS * GRID_COLUMNS }).map((_, index) => (
                        <Box key={index} />
                    ))}
                </GridOverlay>
            )}
        </Box>
    );
};
