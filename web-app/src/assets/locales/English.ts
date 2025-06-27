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
  version: "2.1.0",
  app_title: "Angle Adjustment Tool",
  camera: "Camera",

  //TopPage
  top_page: {
    para_1: "Please confirm the facility listed below.",
    para_2: "Once confirmed, please proceed with setting up the cameras.",
    facility_name: "Facility Name: ",
    prefecture: "State: ",
    municipality: "City: ",
    error: "ERROR: ",
    qr_para_1: "ERROR: Open the application using a valid QR code of Web URL",
    qr_para_2: "Authentication failed",
    confirm_facility: "Confirm facility",
    loader_text: "Checking authorization",
  },

  //ErrorPage
  error_page: {
    error_msg_1: "There was a problem. Please try again from the beginning.",
    error_btn: "Go to main page",
  },

  // Error Codes and Messages
  error_code: {
    "ERR_NETWORK": "Unable to Connect! Please check your network connection and try again.",
    10000: "Please try again or contact Admin if the issue persists.",
    10002: "Review already submitted by another Contractor.",
    10003: "Review already approved by Admin.",
    40001: "Invalid QR code! Please scan a valid QR.",
    40002: "Review submission failed for the camera.",
    40003: "Invalid QR code! Please scan a valid QR.",
    40004: "Sorry, we encountered an error while processing your request.",
    40005: "Sorry, we encountered an error while processing your request.",
    40006: "Sorry, we encountered an error while processing your request.",
    40008: "Sorry, we encountered an error while processing your request.",
    40009: "Sorry, we encountered an error while processing your request.",
    40010: "Sorry, we encountered an error while processing your request.",
    40101: "Invalid QR code! Please scan a valid QR.",
    40102: "Invalid QR code! Please scan a valid QR.",
    40103: "Expired QR code! Please scan a valid QR.",
    40104: "Invalid QR code! Please scan a valid QR.",
    40105: "Invalid QR code! Please scan a valid QR.",
    40106: "Invalid QR code! Please scan a valid QR.",
    40108: "Invalid QR code! Please scan a valid QR.",
    40301: "Sorry, we encountered an error while processing your request.",
    40302: "Review already approved by Admin.",
    40401: "Unknown error, please contact Admin.",
    40402: "Image file not found!",
    40403: "Unknown error, please contact Admin.",
    40404: "Unknown error, please contact Admin.",
    40405: "No cameras are associated with this Facility.",
    40406: "Image type not found",
    40408: "Invalid QR code! Please scan a valid QR.",
    40409: "Invalid QR code! Please scan a valid QR.",
    50001: "Sorry, we failed to fetch camera image.",
    50002: "Sorry, we encountered an error while processing your request.",
    50003: "Review submission failed for the camera.",
    50004: "Review submission failed for the camera.",
    50006: "Sorry, we failed to fetch camera image.",
    50007: "Sorry, we failed to fetch sample image.",
    50008: "Sorry, we encountered an error while processing your request.",
    50009: "Unknown error, please try again.",
    50011: "Please try again or contact Admin if the issue persists.",
    50014: "Please try again or contact Admin if the issue persists.",
    50301: "Unable to connect to the server. Please try again after sometime.",
    50401: "Sorry, the request timed out. Please try again.",
  },

  //Page not found
  page_not_found: "Page Not Found.",

  //HeaderPage
  header: {
    step1_p1: "Step 1",
    step1_p2: "Confirm Facility",
    step2_p1: "Step 2",
    step2_p2: "Select Camera",
    step3_p1: "Step 3",
    step3_p2: "Verify Angle",
    step4_p1: "Step 4",
    step4_p2: "Approval Status",
  },

  // DevicesPage
  devices_page: {
    facility_name: "Facility Name: ",
    all: "All",
    toDo: "To Do",
    setup: "Setup",
    inReview: "In Review",
    completed: "Completed",
    refresh_devices: "Refresh",
    no_devices: "No cameras found",
  },

  //ImageConfirmationPage
  image_confirmation_page: {
    facility_img: "Facility image",
    show_grid_lines: "Show Grid Lines",
    close: "Close",
    single_capture: "Single capture",
    interval_capture: "Interval capture",
    reacquisition_img: "Capture image",
    review_comment: "Review Comment",
    title_chk_angle_view: "Checking the angle of view",
    chk_list_1: "Is the viewing angle close to the sample viewing angle below?",
    chk_list_2:
      "Are there any obstacles such as pop-ups in the image? (Please ask the facility person in charge to move the obstacles or adjust the camera installation position.)",
    chk_list_3:
      "Did make sure that camera's field of view does not include the ceiling or obstructed by cash registers? IT is to unsure that all of the field of view is utilized effectively to capture people",
    chk_list_4: "Is the angle of view parallel to the floor?",
    facility_sample_img: "sample image",
    report_btn: "Report this angle of view",
  },

  //ReviewStatusPage
  review_status_page: {
    des1: "Checking the angle of view for",
    des2_p1: "We are currently checking the angle of view at our headquarters.",
    des2_p2: "Please wait for a while to complete.",
    approval_des1_p1: "Registration approved",
    approval_des1_p2: "Thank you!",
    reject_des1_p1: "We have checked the angle of view.",
    reject_des1_p2: "Please adjust the angle of view.",
    failed_des1_p1: "Review processing failed.",
    failed_des1_p2: "Please try again or contact Admin.",
    reject_retry: "Adjust the angle of view",
    setup_another_cam: "Setup another camera",
    go_to_home: "Go to main page",
  },
};
export default translations;
