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

import {
    Alert,
    Box,
    Button,
    FormControl,
    FormLabel,
    Modal,
    IconButton,
    Input,
    Snackbar,
    Typography,
} from '@mui/joy';
import {
    AssignmentTurnedInRounded,
    Close,
    CloseRounded,
    FileUpload,
} from "@mui/icons-material";
import { useStore } from "../../../store";
import { ChangeEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { exportData, getCustomers, importData } from "../../../services";

// Interface for Customer details from Response payload
interface CustomerResponse {
    id: number;
    customer_name: string;
    last_updated_by: string;
    last_updated_at_utc: string;
}

export default function ExportImport() {
    const { t } = useTranslation();
    const { currentAccount, customers, setCustomers, setSingleFilter } = useStore();
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [openImportModal, setOpenImportModal] = useState<boolean>(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string>("");
    const [openExportModal, setOpenExportModal] = useState<boolean>(false);
    const [exportError, setExportError] = useState<string>("");

    // Handle export data
    const handleExport = async () => {
        if (isExporting) return;

        setSuccessMessage("");
        setOpenSnackbar(false);
        setExportError("");
        setIsExporting(true);

        try {
            const data = await exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const loginId = currentAccount?.login_id || "admin";
            const timeStamp = new Date()
                .toISOString()
                .replace(/[-:T.]/g, "")
                .slice(0, 14);
            const fileName = `AAT_Data_${loginId}_${timeStamp}.json`;
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setSuccessMessage("exportData.success");
            setOpenSnackbar(true);
            handleCloseExportModal();
        } catch (error) {
            setExportError("exportData.errors.exportFailed");
        } finally {
            setIsExporting(false);
        }
    };

    // Handle import data
    const handleImport = async () => {
        if (isImporting) return;
        setSuccessMessage("");
        setOpenSnackbar(false);
        setImportError("");

        if (!importFile) {
            setImportError("importData.errors.noFileSelected");
            return;
        }
        setIsImporting(true);

        try {
            await importData(importFile);
            setSuccessMessage("importData.success");
            setOpenSnackbar(true);
            handleCloseImportModal();
            await updateCustomers(); // Refresh customers after import
        } catch (error) {
            setImportError("importData.errors.importFailed");
        } finally {
            setIsImporting(false);
        }
    };

    const updateCustomers = async () => {
        if (!currentAccount) return;

        const customers = await getCustomers();
        if (customers?.data?.length) {
            setSingleFilter({ key: "customerId", value: customers.data?.[0]?.id });
            setCustomers(customers.data.map((value: CustomerResponse) => ({
                id: value.id,
                customerName: value.customer_name,
                lastUpdatedBy: value.last_updated_by,
                lastUpdatedTime: value.last_updated_at_utc,
            })));
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportError("");

            if (file.type !== "application/json") {
                setImportError("importData.errors.invalidFileType");
                setOpenSnackbar(true);
                return;
            }

            setImportFile(file);
        }
    };

    const handleCloseExportModal = () => {
        setOpenExportModal(false);
        setExportError("");
    }

    const handleCloseImportModal = () => {
        setOpenImportModal(false);
        setImportFile(null);
        setImportError("");
    };

    return (
        <>
            <Box display="flex" gap={2} alignItems="center">
                {customers.length > 0 && (
                    <Button
                        variant="solid"
                        disabled={isExporting || isImporting}
                        onClick={() => setOpenExportModal(true)}
                        data-testid="export-data-btn"
                    >
                        {t("settingsPage.exportData")}
                    </Button>
                )}
                <Button
                    variant="solid"
                    disabled={isExporting || isImporting}
                    onClick={() => setOpenImportModal(true)}
                    data-testid="import-data-btn"
                >
                    {t("settingsPage.importData")}
                </Button>
            </Box >

            {/* Export Modal */}
            <Modal
                open={openExportModal}
                onClose={handleCloseExportModal}
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
                            {t('exportData.title')}
                        </Typography>
                        <IconButton onClick={handleCloseExportModal} size="sm" variant="plain" aria-label="Close">
                            <Close />
                        </IconButton>
                    </Box>
                    <Typography level="body-sm" mb={1}>
                        {t('exportData.description')}
                    </Typography>
                    <Typography level="body-xs" mb={2} color="warning">
                        {t('exportData.note')}
                    </Typography>

                    {exportError && (
                        <Alert
                            color="danger"
                            variant="soft"
                            sx={{ mb: 2 }}
                        >
                            {t(exportError)}
                        </Alert>
                    )}

                    <Button
                        onClick={handleExport}
                        fullWidth
                        loading={isExporting}
                        loadingPosition="start"
                        data-testid="export-data-confirm-btn"
                    >
                        {t('exportData.buttons.export')}
                    </Button>
                </Box>
            </Modal>

            {/* Import Modal */}
            <Modal
                open={openImportModal}
                onClose={handleCloseImportModal}
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
                            {t('importData.title')}
                        </Typography>
                        <IconButton onClick={handleCloseImportModal} size="sm" variant="plain" aria-label="Close">
                            <Close />
                        </IconButton>
                    </Box>
                    <Box mb={2}>
                        <FormControl>
                            <FormLabel htmlFor="jsonFileInput" required>
                                {t('importData.labels.importJsonFile')}
                            </FormLabel>
                            <Input
                                id="jsonFileInput"
                                readOnly
                                value={importFile ? importFile.name : ''}
                                placeholder={t('importData.labels.importJsonFile')}
                                endDecorator={
                                    <Button onClick={handleFileButtonClick} size="sm" aria-label="Upload File">
                                        <FileUpload />
                                    </Button>
                                }
                                fullWidth
                                required
                            />
                            <input
                                id="jsonFileInput"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept=".json"
                                required
                            />
                        </FormControl>
                    </Box>
                    <Typography level="body-xs" mb={2} color="warning">
                        {t('importData.note')}
                    </Typography>

                    {importError && (
                        <Alert
                            color="danger"
                            variant="soft"
                            sx={{ mb: 2 }}
                        >
                            {t(importError)}
                        </Alert>
                    )}

                    <Button
                        onClick={handleImport}
                        fullWidth
                        loading={isImporting}
                        loadingPosition="start"
                        data-testid="import-data-confirm-btn"
                    >
                        {t('importData.buttons.import')}
                    </Button>
                </Box>
            </Modal>

            {(successMessage) ? <Snackbar
                variant="soft"
                size="lg"
                open={openSnackbar}
                onClose={() => setOpenSnackbar(false)}
                autoHideDuration={6000}
                color="success"
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                startDecorator={<AssignmentTurnedInRounded />}
                endDecorator={
                    <IconButton
                        color="success"
                        onClick={() => setOpenSnackbar(false)}
                    >
                        <CloseRounded />
                    </IconButton>
                }
                sx={{ zIndex: 10001 }}
            >
                {t(successMessage)}
            </Snackbar> : null}
        </>
    );
}
