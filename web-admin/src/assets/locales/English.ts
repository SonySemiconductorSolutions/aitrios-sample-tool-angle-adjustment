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
const translations = {
    language: "English",
    version: "v2.1.0",
    appTitle: "Angle Adjustment Tool (Admin)",
    appTitleShort: "AAT (Admin)",

    // Sidebar
    sidebar: {
        dashboard: "Dashboard",
        reviewRequest: "Review Request",
        settings: "Settings",
        addCustomer: "Add Customer",
        editCustomer: "Edit Customer",
        generateQr: "Generate QR",
        manageDevices: "Manage Devices",

        // Account
        account: {
            title: "Account",
            logout: "Log out",
        },

        // Admin
        admin: {
            title: "Admin",
            addAdmin: "Add Admin",
        },
    },

    addAdmin: {
        title: "Add Admin",
        loginId: "Login ID",
        pass: "Password",
        createAdmin: "Create Admin",
        success: "Admin created successfully.",
        saveNote: "Important: Make sure to copy the Login ID and Password now, as they will not be displayed again!",
    },

    // DashboardPage
    dashboardPage: {
        applicationList: "Application List",
        thereAre: "There are ",
        pendingApplications: " pending applications. ",
        thereHaveBeen: "There have been ",
        applicationsInLast: " applications in last ",
        minutes: " minutes.",
        showing: "Showing ",
        outOf: " out of ",
        items: " item(s) ",
        returnToTop: "Return to Top",

        // Filter
        customerName: "Customer Name",
        noCustomerFound: "No customer found",
        select: "--Select option--",
        prefecture: "State",
        municipality: "City",
        facilityName: "Facility Name",
        enterText: "Enter text",
        applicationStatus: "Application Status",
        filterModifiedInfo: "Filter modified. Click 'Search' to see the latest results.",
        search: "Search",
        clear: "Clear",

        // Table
        slNo: "No",
        facilityType: "Facility Type",
        deviceName: "Device Name",
        deviceId: "Device ID",
        deviceConnectionStatus: "Device Connection State",
        deviceApplicationStatus: "Status",
        applicationDateTime: "Application Date & Time",
        reviewDateTime: "Review Date & Time",
        angleConfirmation: "Action",
        details: "Details",
        noData: "There is no corresponding data.",
        moreItemsInNextPage: "More items available on next page...",

        // View Tab
        list: "List",
        tiled: "Tiled",
        small: "Small",
        medium: "Medium",
        large: "Large",
    },

    // Review Request Page
    reviewRequestPage: {
        viewHistory: "View History",
        facilityName: "Facility Name",
        facilityCameraImage: " facility camera image",
        cameraDeviceName: "Camera (Device Name)",
        deviceId: "Device ID",
        imageDateTime: "Image Acquisition Date & Time",
        applicationDateTime: "Application Date & Time",
        reviewDateTime: "Review Date & Time",
        facilityPattern: "Facility Pattern",
        notSubmitted: "Contractor has not submitted the image.",
        submittedImage: "Submitted Image",
        referenceImage: "Reference Image",
        failedToLoadImage: "Failed to load image.",
        showGridLines: "Show Grid Lines",
        preserveAspectRatio: "Preserve Aspect Ratio",
        close: "Close",
        approve: "Approve",
        reject: "Reject",
        adviceForContractors: "Advice for construction contractors",
        approveSuccess: "Review approval successful.",
        rejectSuccess: "Review rejection successful.",

        // Adjust submitted image
        updateReferenceImage: "Update Reference Image",
        restoreReferenceImage: "Restore Reference Image",
        adjustSubmittedImage: "Adjust Submitted image to save as Reference image",
        editHere: "Edit here",
        updateReferenceImageNote: "Updating the Reference image will disable review approval, and if the review is rejected, it will permanently overwrite the existing Reference image.",
        cancel: "Cancel",
        adjustToMatchSampleImage: "Adjust the camera angle of view to match the sample image.",

        // Delete reviews
        delete: "Delete",
        deleteReviews: "Delete Reviews",
        deleteReviewsConfirm: "Are you sure you want to delete all the reviews associated with: ",
        deleteReviewsSuccess: "Reviews deleted successfully.",
    },

    // Review History Page
    reviewHistoryPage: {
        reviewsHistory: "Reviews History",
        slNo: "No",
        deviceApplicationStatus: "Status",
        applicationStatus: "Application Status",
        applicationDateTime: "Application Date & Time",
        reviewDateTime: "Review Date & Time",
        reviewImage: "Review Image",
        reviewComment: "Review Comment",
    },

    // Settings Page
    settingsPage: {
        settings: "Settings",
        customerList: "Customer List",
        slNo: "No",
        customerName: "Customer Name",
        lastUpdatedBy: "Last Updated By",
        lastUpdatedAt: "Last Updated At",
        actions: "Actions",
        addCustomer: "Add Customer",
        editCustomer: "Edit Customer",
        manageDevices: "Manage Devices",
        generateQr: "Generate QR",
        edit: "Edit",
        exportData: "Export Data",
        importData: "Import Data",
        noData: "Start adding customers to use the tool",
    },

    // Export Data
    exportData: {
        title: "Export Data",
        description: "This exports the devices and facilities, their respective types and reference images associated with the admins and customers.",
        note: "Note: Reviews associated with device will not be exported.",
        buttons: {
            cancel: "Cancel",
            export: "Export",
        },
        success: "Data exported successfully.",
        errors: {
            exportFailed: "Failed to export data. Please try again.",
        },
    },

    // Import Data
    importData: {
        title: "Import Data",
        note: "Note: Importing data will overwrite all existing data, including reviews. Data to be imported must be in the same format as the exported data.",
        labels: {
            importJsonFile: "Import JSON File",
        },
        buttons: {
            cancel: "Cancel",
            import: "Import",
        },
        success: "Data imported successfully.",
        errors: {
            noFileSelected: "Please select a file.",
            invalidFileType: "Invalid file type. Please upload a JSON file.",
            importFailed: "Failed to import data. Please validate the file and try again.",
        },
    },

    // Console Credentials Page
    consoleCredentialsPage: {
        // Form
        customerName: "Customer Name",
        clientId: "Client ID",
        clientSecret: "Client Secret",
        baseUrl: "Console Endpoint",
        baseUrlExample: "https://console.aitrios.sony-semicon.com/api/v1",
        authUrl: "Auth URL",
        aitriosDeveloperEdition: "AITRIOS Developer Edition",
        authUrlDeveloperExample: "https://auth.aitrios.sony-semicon.com/oauth2/default/v1/token",
        portalEndpoint: "Portal Endpoint",
        aitriosEnterpriseEdition: "AITRIOS Enterprise Edition",
        authUrlEnterpriseExample: "https://login.microsoftonline.com/<TENANT_ID>",
        changeTenantId: "Change the <TENANT_ID> section",
        example: "Example: ",
        applicationId: "Application ID",
        applicationIdNote: "Application ID is applicable only if AITRIOS is Enterprise Edition",
        save: "Save",
        reset: "Reset",
        next: "Next",
        credentialsUpdated: "Console credentials updated successfully.",
        customerCreated: "Customer created successfully.",
        // Tips
        tip: "Tip: ",
        aitriosPortal: "AITRIOS Portal",
        project: "Project",
        projectManagement: "Project Management",
        clientAppManagement: "Client App Management",
        clientApp: "Client App",
        createNewIfDoesnotExist: "Create new if doesn't exists",
        visibleOnlyOnceWhenCreated: "Visible only once when created",
        noChanges: "No changes detected. Nothing to save.",
    },

    generateQR: {
        title: "Generate QR Code",
        customerName: "Customer Name",
        facilities: "facilities",
        selectCustomer: "Select customers",
        selectFacilities: "Select Facilities",
        selectAll: "Select All",
        note: "Note: The validity of the QR codes will be within the effective start and end time of the facilities. To modify, navigate to \"Manage Devices\" and make necessary changes.",
        generateAndDownload: "Generate & Download",
        errors: {
            fetchFacilities: "Failed to fetch facilities",
            loadFacilities: "Failed to load facilities",
            generateQR: "Failed to generate QR codes"
        },
        buttons: {
            cancel: "Cancel",
            generate: "Generate & Download"
        }
    },

    // Manage Devices Page
    manageDevicesPage: {
        refreshDeviceList: "Refresh Device List",
        selectCustomer: "Select Customer",
        editSelectedDevices: "Batch Edit Selected Devices",
        deregisterSelectedDevices: "Deregister Selected Devices",
        cancel: "Cancel",
        saveSelectedDevices: "Register/Update Selected Devices",
        noDevicesFound: "No Devices Found",
        deviceList: "Device List",
        facility: "Facility",
        deviceType: "Device Type",
        group: "Group",
        status: "Status",
        registered: "Registered",
        notRegistered: "Not Registered",
        createDeviceType: "Create Device Type",
        updateDeviceType: "Update Device Type",
        selectFacility: "Select Facility",
        selectDeviceType: "Select Device Type",
        deregisterSuccess: "Devices deregistered successfully.",
        saveSuccess: "Devices registered/updated successfully.",
        errors: {
            noCustomerFound: "No customer found",
            noCustomerSelected: "No customer selected",
            deviceFetchFailed: "Failed to fetch devices",
            facilityFetchFailed: "Failed to fetch facilities",
            deviceTypeFetchFailed: "Failed to fetch device types",
            customerDataFetchFailed: "Failed to fetch data for customer",
            facilityUpdateFailed: "Failed to update facility",
            deviceTypeUpdateFailed: "Failed to update device type",
            editFailed: "Failed to edit devices",
            deregisterFailed: "Failed to deregister devices",
            saveFailed: "Failed to register/update devices",
            saveNotAllowed: "Register/Update not allowed. Deselect the devices missing Facility or Device Type settings.",
            deregisterNotAllowed: "Deregister not allowed. Deselect the \"Not Registered\" devices.",
        }
    },

    deviceTable: {
        // Table Headers
        deviceName: "Device Name",
        deviceId: "Device ID",
        facilityName: "Facility Name",
        deviceType: "Device Type",
        findOrCreate: "Find or create...",
        status: "Tool Registration Status",
        statusShort: "Status",
        group: "Group",

        // Status Display
        registered: "Registered",
        notRegistered: "Not Registered",

        // Update Status
        updating: "Updating...",

        // Autocomplete Related
        createNew: "Create New",
        editFacility: "Edit Facility",
        editDeviceType: "Edit Device Type",
        selectFacility: "Select Facility",
        selectDeviceType: "Select Device Type",
        noFacilitiesFound: "No facilities found",
        noDeviceTypesFound: "No device types found",

        // Modal Related
        closeModal: "Close",
        cancel: "Cancel",
        save: "Save",

        // Error Messages
        errorUpdatingFacility: "Error occurred while updating facility",
        errorUpdatingDeviceType: "Error occurred while updating device type",
    },

    selectWithAddAndEdit: {
        add: "Add",
        edit: "Edit",
    },

    facility: {
        // Modal related
        submitting: "Submitting...",
        updateFacility: "Update Facility",
        createFacility: "Create Facility",
        closeModal: "Close",
    },

    facilityForm: {
        editTitle: "Edit Facility",
        addTitle: "Add Facility",
        customerName: "Customer Name",
        facilityName: "Facility Name",
        facilityType: "Facility Type",
        prefecture: "State",
        municipality: "City",
        effectiveStartDate: "Effective Start Date",
        effectiveEndDate: "Effective End Date",
        failedToAddFacilityType: "Failed to add facility type",
        failedToCreateFacility: "Failed to create facility",
        failedToUpdateFacility: "Failed to update facility",
        selectFacilityType: "Select Facility Type",
        updateFacility: "Update Facility",
        createFacility: "Create Facility",
        closeModal: "Close",
        findOrCreate: "Find or create...",
        noChanges: "No changes detected. Nothing to update.",
    },
    facilityType: {
        addTitle: "Add Facility Type",
        typeName: "Facility Type Name",
        add: "Add",
        errors: {
            required: "Facility type name is required.",
            createFailed: "Failed to create facility type.",
        }
    },

    addDeviceType: {
        deviceTypeName: "Device Type Name",
        referenceImage: "Reference Image",
        note: "Note: Please upload an image in .jpg, .jpeg, or .png format, with a maximum file size of 1MB.",
        errors: {
            invalidFileType: "Invalid file type. Please upload a JPG or PNG file.",
            fileTooLarge: "File size exceeds 1MB limit.",
            requiredImage: "Reference image is required.",
            requiredName: "Device type name is required.",
            createFailed: "Failed to create device type.",
            updateFailed: "Failed to update device type."
        },
        modal: {
            addTitle: "Add Device Type",
            editTitle: "Edit Device Type",
            addButton: "Add",
            editButton: "Save"
        }
    },

    deviceType: {
        add: {
            title: "Add Device Type",
            button: "Add"
        },
        edit: {
            title: "Edit Device Type",
            button: "Save"
        }
    },

    editDevices: {
        title: "Edit Selected Devices",
        facilityName: {
            label: "Facility Name",
            placeholder: "Find or create facility name",
            noFacilities: "No facilities available"
        },
        deviceType: {
            label: "Device Type",
            placeholder: "Find or create device type"
        },
        buttons: {
            cancel: "Cancel",
            apply: "Apply"
        },
        errors: {
            invalidProps: "Invalid props: facilities and deviceTypes must be arrays"
        }
    },

    deregisterDevices: {
        title: "Deregister Devices",
        message: "Are you sure you want to deregister the following devices from {{customerName}}?",
        buttons: {
            deregister: "Deregister",
            cancel: "Cancel",
        },
        note: "Note: Deregistering the devices will remove the reviews history associated with them.",
    },

    // Login Page
    loginPage: {
        loginId: "Login ID",
        pass: "Password",
        login: "Login",
    },

    // Invalid Page
    invalidPage: {
        pageNotFound: "Page not found.",
        reviewHistoryNotFound: "Device Review History not found.",
        returnToDashboard: "The requested page does not exist. Please return to the dashboard.",
    },

    // Application Status
    statusList: {
        initialState: "Initial State",
        requesting: "Requesting for Review",
        rejected: "Rejected",
        approved: "Approved",
    },

    // Error messages
    errorCodes: {
        ERR_NETWORK: "Unable to Connect! Please check your network connection and try again.",
        10000: "Unknown error, please try again.",
        10001: "You have reached the character limit of 255.",
        10002: "You have reached the character limit of 127.",
        10003: "No special characters allowed other than spaces, hyphens, and underscores.",
        10004: "Input must be in a valid URL format.",
        10005: "Invalid input. Please check the values.",
        10006: "No special characters allowed other than hyphens and underscores.",
        10007: `1. Password must be at least 8 characters long.
                2. Password must contain any three characters from the following categories:
                    - Lowercase (a-z)
                    - Uppercase (A-Z)
                    - Digits (0-9)
                    - Special characters (_, -, !, $, #, %, @)
                3. Password must not contain spaces.`,
        40004: "Sorry, we encountered an error while processing your request.",
        40005: "Sorry, we encountered an error while processing your request.",
        40006: "Sorry, we encountered an error while processing your request.",
        40007: "Please provide a comment while rejecting a review.",
        40008: "Sorry, we encountered an error while processing your request.",
        40009: "Sorry, we encountered an error while processing your request.",
        40010: "Sorry, we encountered an error while processing your request.",
        40015: "Customer name already taken. Please choose a different name.",
        40016: "Login ID already taken. Please choose a different Login ID.",
        40107: "Invalid Account or Password.",
        40301: "Sorry, we encountered an error while processing your request.",
        40303: "Review approval failed as the current review is not the latest one.",
        40304: "Review rejection failed as the current review is not the latest one.",
        40305: "Invalid Client ID / Client Secret / Auth URL provided.",
        40306: "Invalid Client ID / Client Secret / Auth URL / Application ID provided.",
        40307: "Invalid Console Endpoint.",
        40308: "Console credentials verification failed.",
        40309: "Invalid Client ID provided.",
        40310: "Invalid Client Secret provided.",
        40401: "Facility not found.",
        40402: "Image file not found.",
        40403: "Device not found.",
        40404: "Review not found.",
        40407: "Customer not found.",
        50002: "Sorry, we encountered an error while processing your request.",
        50008: "Sorry, we encountered an error while processing your request.",
        50009: "Sorry, we encountered an error while processing your request.",
        50010: "Sorry, we failed to load review image.",
        50011: "Unable to fetch the device connection state. Please check the console credentials.",
        50013: "Sorry, we encountered an error while fetching Console credentials.",
        50301: "Unable to connect to the server. Please try again after some time.",
        50401: "Sorry, the request timed out. Please try again.",
    }
}

export default translations
