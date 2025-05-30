/*
------------------------------------------------------------------------
Copyright 2025 Sony Semiconductor Solutions Corp. All rights reserved.

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
import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    FormControl,
    FormLabel,
    IconButton,
    Input,
    Modal,
    Stack,
    Typography,
} from "@mui/joy";
import { useTranslation } from "react-i18next";
import { createNewAdmin } from "src/services";
import { InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff, ContentCopy, Close } from "@mui/icons-material";
import { validateString } from "src/utils";

interface AddAdminProps {
    open: boolean;
    onClose: () => void;
}

const CHARACTER_LIMIT = 255; // 文字数制限

export const AddAdmin: React.FC<AddAdminProps> = ({
    open,
    onClose
}) => {
    const { t } = useTranslation();

    const errorCodes: Record<number, string> = t("errorCodes", { returnObjects: true });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ userId: "", pass: "" });
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isAdminCreated, setIsAdminCreated] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleError = (error: any) => {
        if (error?.error_code && error.error_code in errorCodes) {
            setErrorMessage(`errorCodes.${error.error_code}`);
        } else {
            setErrorMessage("errorCodes.10000");
        }
    };

    // Handles admin create submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData.userId || !formData.pass || isSubmitting) return;

        // Validate userId and pass
        if (
            !validateString(formData.userId, "LOGIN_ID") ||
            !validateString(formData.pass, "LOGIN_PASSWORD")
        ) {
            setErrorMessage("errorCodes.10005");
            return;
        }

        setIsSubmitting(true);

        await createNewAdmin(formData.userId, formData.pass)
            .then(() => setIsAdminCreated(true))
            .catch((err) => {
                setIsAdminCreated(false);
                handleError(err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleClose = () => {
        if (isSubmitting) return;

        // Reset form data and error message
        setFormData({ userId: "", pass: "" });
        setErrorMessage("");
        setShowPassword(false);
        setIsAdminCreated(false);
        onClose();
    };

    const handleMouseDownPassword = (event: React.MouseEvent) => {
        event.preventDefault();
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    bgcolor: 'white',
                    boxShadow: 'sm',
                    p: 3,
                    width: '400px',
                    maxWidth: '90%',
                    borderRadius: 'md',
                    position: 'relative',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography level="h4">
                        {t("addAdmin.title")}
                    </Typography>
                    <IconButton onClick={handleClose} size="sm" variant="plain" aria-label="Close">
                        <Close />
                    </IconButton>
                </Box>

                {isAdminCreated ? (
                    <>
                        <Typography level="title-sm" color="success" mb={2}>
                            {t("addAdmin.success")}
                        </Typography>
                        <Box
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                bgcolor: "background.level1",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                position: "relative",
                                mb: 2,
                            }}
                        >
                            <Typography sx={{
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                <strong>{t("addAdmin.loginId")}:</strong> {formData.userId}
                            </Typography>
                            <Typography sx={{
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                <strong>{t("addAdmin.pass")}:</strong> {formData.pass}
                            </Typography>
                            <IconButton
                                aria-label="copy credentials"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        `${t("addAdmin.loginId")}: ${formData.userId}\n${t("addAdmin.pass")}: ${formData.pass}`
                                    )
                                }
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                }}
                            >
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Box>
                        <Typography level="body-xs" mb={2} color="warning">
                            {t("addAdmin.saveNote")}
                        </Typography>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} role="form" autoComplete="off">
                        <Stack spacing={2.5}>
                            <FormControl>
                                <FormLabel required>{t("addAdmin.loginId")}</FormLabel>
                                <Input
                                    name="userId"
                                    data-testid="admin-loginId-input"
                                    type="text"
                                    slotProps={{
                                        "input": {
                                            maxLength: CHARACTER_LIMIT,
                                            autoComplete: "off"
                                        }
                                    }}
                                    value={formData.userId}
                                    onChange={handleInputChange}
                                    error={!validateString(formData.userId, "LOGIN_ID")}
                                    required
                                />
                                {formData.userId && (
                                    <Typography
                                        level="body-xs"
                                        sx={{
                                            color: !validateString(formData.userId, "LOGIN_ID")
                                                ? "danger.500"
                                                : formData.userId.length >= CHARACTER_LIMIT
                                                    ? "warning.400"
                                                    : "inherit",
                                        }}
                                    >
                                        {!validateString(formData.userId, "LOGIN_ID")
                                            ? t("errorCodes.10006")
                                            : formData.userId.length >= CHARACTER_LIMIT
                                                ? t("errorCodes.10001")
                                                : ""}
                                    </Typography>
                                )}
                            </FormControl>

                            <FormControl>
                                <FormLabel required>{t("addAdmin.pass")}</FormLabel>
                                <Input
                                    name="pass"
                                    data-testid="admin-pass-input"
                                    type={showPassword ? 'text' : 'password'}
                                    slotProps={{
                                        "input": {
                                            maxLength: CHARACTER_LIMIT,
                                            autoComplete: "new-password",
                                        }
                                    }}
                                    value={formData.pass}
                                    onChange={handleInputChange}
                                    error={!validateString(formData.pass, "LOGIN_PASSWORD")}
                                    endDecorator={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onMouseDown={handleMouseDownPassword}
                                                onClick={handleClickShowPassword}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    required
                                />
                                {formData.pass && (
                                    <Typography
                                        level="body-xs"
                                        sx={{
                                            whiteSpace: "pre-line",
                                            color: !validateString(formData.pass, "LOGIN_PASSWORD")
                                                ? "danger.500"
                                                : formData.pass.length >= CHARACTER_LIMIT
                                                    ? "warning.400"
                                                    : "inherit",
                                        }}
                                    >
                                        {!validateString(formData.pass, "LOGIN_PASSWORD")
                                            ? t("errorCodes.10007")
                                            : formData.pass.length >= CHARACTER_LIMIT
                                                ? t("errorCodes.10001")
                                                : ""}
                                    </Typography>
                                )}
                            </FormControl>

                            {errorMessage && (
                                <Alert
                                    color="danger"
                                    variant="soft"
                                    sx={{ mb: 2 }}
                                >
                                    {t(errorMessage)}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="solid"
                                loadingPosition="start"
                                loading={isSubmitting}
                                data-testid="create-admin-btn"
                            >
                                {t("addAdmin.createAdmin")}
                            </Button>
                        </Stack>
                    </form>)}
            </Box>
        </Modal>
    );
};
