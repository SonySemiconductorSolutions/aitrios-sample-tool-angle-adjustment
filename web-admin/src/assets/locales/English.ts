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
    version: "v1.4.0",
    appTitle: "Angle Adjustment Tool (Admin)",
    appTitleShort: "AAT (Admin)",

    // Navigator
    navigator: {
        logOut: "Log out",
    },

    // Sidebar
    sidebar: {
        dashboard: "Dashboard",
        reviewRequest: "Review Request",
        consoleConfiguration: "Console Configuration",
        editConfiguration: "Edit Configuration",
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
        prefectures: "State/Province/Region",
        select: "--Select option--",
        selectMultiple: "--Select options--",
        municipalities: "City/Town",
        searchByFacilityName: "Search by Facility name",
        enterText: "Enter text",
        applicationStatus: "Application Status",
        filterModifiedInfo: "Filter modified. Click 'Search' to see the latest results.",
        search: "Search",
        clear: "Clear",

        // Table
        slNo: "No",
        facilityName: "Facility Name",
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

    // Console Configuration Page
    consoleConfigurationPage: {
        configurationList: "Configuration List",
        slNo: "No",
        customerName: "Customer Name",
        lastUpdatedBy: "Last Updated By",
        lastUpdatedAt: "Last Updated At",
        action: "Action",
        edit: "Edit",
    },

    // Edit Configuration Page
    editConfigurationPage: {
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
        credentialsUpdated: "Console credentials updated successfully.",
        // Tips
        tip: "Tip: ",
        aitriosPortal: "AITRIOS Portal",
        project: "Project",
        projectManagement: "Project Management",
        clientAppManagement: "Client App Management",
        clientApp: "Client App",
        createNewIfDoesnotExist: "Create new if doesn't exists",
        visibleOnlyOnceWhenCreated: "Visible only once when created",
    },

    // Login Page
    loginPage: {
        loginId: "Login ID",
        pass: "Password",
        login: "Login",
    },

    // Prefectures Dropdown
    prefecturesList: [
        "Hokkaido",
        "Aomori",
        "Iwate",
        "Miyagi",
        "Akita",
        "Yamagata",
        "Fukushima",
        "Ibaraki",
        "Tochigi",
        "Gunma",
        "Saitama",
        "Chiba",
        "Tokyo",
        "Kanagawa",
        "Niigata",
        "Toyama",
        "Ishikawa",
        "Fukui",
        "Yamanashi",
        "Nagano",
        "Gifu",
        "Shizuoka",
        "Aichi",
        "Mie",
        "Shiga",
        "Kyoto",
        "Osaka",
        "Hyogo",
        "Nara",
        "Wakayama",
        "Tottori",
        "Shimane",
        "Okayama",
        "Hiroshima",
        "Yamaguchi",
        "Tokushima",
        "Kagawa",
        "Ehime",
        "Kochi",
        "Fukuoka",
        "Saga",
        "Nagasaki",
        "Kumamoto",
        "Oita",
        "Miyazaki",
        "Kagoshima",
        "Okinawa"
    ],

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
        40004: "Sorry, we encountered an error while processing your request.",
        40005: "Sorry, we encountered an error while processing your request.",
        40006: "Sorry, we encountered an error while processing your request.",
        40007: "Please provide a comment while rejecting a review.",
        40008: "Sorry, we encountered an error while processing your request.",
        40009: "Sorry, we encountered an error while processing your request.",
        40010: "Sorry, we encountered an error while processing your request.",
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
