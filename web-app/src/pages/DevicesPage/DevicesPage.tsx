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
import cx from "classnames";
import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";
import LoadingIcons from "react-loading-icons";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CreateIcon from "@mui/icons-material/Create";
import InfiniteScroll from 'react-infinite-scroller';
import { useNavigate, useLocation } from "react-router-dom";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
// Import components
import { Header } from "src/components";
import { Loading } from "src/components/blocks/Loading/Loading";
import DeviceConnectionState from "src/components/elements/DeviceConnectionState";
// Import helpers
import {
  useGlobalState,
  useGlobalDispatch,
  setSelectedDevice,
} from "src/contexts/GlobalProvider";
import { fetchFacilityDevices, getDevicesStatus } from "src/repositories/api";
// Import assets, styles
import EN from "../../assets/locales/English";
import styles from "./DevicesPage.module.css";

const PER_PAGE = 10; // Load 10 devices at a time
const POLLING_INTERVAL = 1000 * 10; // 10 seconds interval
const PAGINATION_LOAD_TIME = 500; // Load more data after waiting for 0.5 sec
const LANDSCAPE_MODE = "landscape-primary"; // Landscape mode name

// Devices Page displayed to show list of all devices associated with the facility with status filter
export const DevicesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useGlobalDispatch();
  const location = useLocation();

  // Device Status constant, used to filter the list of devices by matching status
  const DEVICE_STATUS = {
    ALL: [],
    TO_DO: [0, 1, 3],
    IN_REVIEW: [2],
    COMPLETED: [4],
  };

  // Type of device object
  type device = {
    id: number;
    result: number;
    device_name: string;
    submission_status: number;
  };
  // Type of DeviceStatusMap for mapping device status by device ID
  type DeviceStatusMap = {
    [key: string]: string;
  }
  const selectedDevice = useGlobalState((s) => s.selectedDevice);
  const facilityDetails = useGlobalState((s) => s.facility); // Used to fetch facility details from global variable

  const [selectedFilter, setSelectedFilter] = useState<number[]>([]);
  const [allDevices, setAllDevices] = useState<device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<device[]>([]);
  const [paginatedDevices, setPaginatedDevices] = useState<device[]>([]);
  const [completedDevicesCount, setCompletedDevicesCount] = useState(0);
  const [inReviewDevicesCount, setInReviewDevicesCount] = useState(0);
  const [toDoDevicesCount, setToDoDevicesCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const [navigatingToImagePage, setNavigatingToImagePage] = useState<boolean>(false);
  const [loadingPaginatedDevices, setLoadingPaginatedDevices] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusMap | undefined>();

  const getOrientation = () => window.screen.orientation.type;

  const useScreenOrientation = () => {
    const [orientation, setOrientation] = useState(getOrientation());

    const updateOrientation = () => {
      setOrientation(getOrientation());
    }

    useEffect(() => {
      window.addEventListener(
        'orientationchange',
        updateOrientation
      );
      return () => {
        window.removeEventListener(
          'orientationchange',
          updateOrientation
        );
      }
    }, []);

    return orientation;
  }

  // Method to update selected filter with array of numbers or an empty array
  const updateSelectedFilter = (val: number[]) => {
    if (val) setSelectedFilter(val);
    else setSelectedFilter([]);
  };

  // Contractor navigated back to the Main page
  const backToHome = async () => {
    if (!buttonClicked) {
      navigate("/", { replace: true });
    }
  };

  // Method to get the devices of the facility
  const getFacilityDevices = async (initial = false) => {
    if (initial) setIsLoading(true);
    setErrorMessage("");
    await fetchFacilityDevices()
      .then((data) => {
        if (data.devices) {
          setDeviceFacility(data.devices);
          if (initial) fetchDevicesStatus();
        }
      })
      .catch((err) => {
        setErrorMessage(err);
      })
      .finally(() => {
        setIsLoading(false);
        setButtonClicked(false);
      });
  };

  // Method to update the component state and store the list of all devices and the counts of each status
  const setDeviceFacility = (devices: device[]) => {
    let completedDevicesCount = 0,
      inReviewDevicesCount = 0,
      toDoDevicesCount = 0;
    for (let i = 0; i < devices.length; i++) {
      if (DEVICE_STATUS.COMPLETED.includes(devices[i].result))
        completedDevicesCount++;
      else if (DEVICE_STATUS.IN_REVIEW.includes(devices[i].result))
        inReviewDevicesCount++;
      else if (DEVICE_STATUS.TO_DO.includes(devices[i].result))
        toDoDevicesCount++;
    }
    setAllDevices(devices);
    setToDoDevicesCount(toDoDevicesCount);
    setInReviewDevicesCount(inReviewDevicesCount);
    setCompletedDevicesCount(completedDevicesCount);
  };

  // Method to select a device for setup and navigate the Contractor to the Camera Image view page
  const setupDevice = async (device: device) => {
    if (DEVICE_STATUS.TO_DO.includes(device.result) && !buttonClicked) {
      setButtonClicked(true);
      if (intervalId) clearInterval(intervalId);
      dispatch(setSelectedDevice(device));
      setNavigatingToImagePage(true);
    }
  };

  // Method called when navigatingToImagePage or selectedDevice states are updated
  useEffect(() => {
    // Contractor navigated to Camera Image view page if device is
    // selected for setup and navigatingToImagePage is true
    if (navigatingToImagePage && selectedDevice) {
      navigate("/image-confirmation");
    }
  }, [selectedDevice, navigatingToImagePage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Method to compare two number arrays and return true only if they are same
  const compareArray = (arr1: number[], arr2: number[]) => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  };

  // Fetches devices connection status
  const fetchDevicesStatus = async () => {
    await getDevicesStatus().then((responseData) => {
      setDeviceStatus(responseData?.reduce(
        (statusMap: DeviceStatusMap, device: any) => {
          statusMap[device.device_id] = device.connection_status;
          return statusMap;
        },
      {}));
    }).catch((err) => {
      setErrorMessage(err);
    });
  };

  // Method to refresh the devices list by calling the devices API again
  const refreshDevices = () => {
    setButtonClicked(true);
    getFacilityDevices(true);
  };

  // Called when filter or all devices list are updated, to set the filtered devices according to the selected filter
  useEffect(() => {
    setLoadingPaginatedDevices(true);
    if (compareArray(selectedFilter, DEVICE_STATUS.ALL))
      setFilteredDevices(allDevices);
    else {
      const updatedDevices = [];
      for (let i = 0; i < allDevices.length; i++) {
        if (selectedFilter.includes(allDevices[i].result))
          updatedDevices.push(allDevices[i]);
      }
      setFilteredDevices(updatedDevices);
    }
    setIsLoading(false);
  }, [selectedFilter, allDevices]); // eslint-disable-line react-hooks/exhaustive-deps

  // Called when filtered devices list is updated, to set the paginated devices list
  useEffect(() => {
    if (filteredDevices?.length) {
      if (paginatedDevices?.length > PER_PAGE) setPaginatedDevices(filteredDevices.slice(0, paginatedDevices.length));
      else setPaginatedDevices(filteredDevices.slice(0, PER_PAGE));
    } else setPaginatedDevices([]);
  }, [filteredDevices]); // eslint-disable-line react-hooks/exhaustive-deps

  // Called when the paginated devices list is updated, to set the loadingPaginatedDevices to false
  useEffect(() => {
    setLoadingPaginatedDevices(false);
  }, [paginatedDevices]); // eslint-disable-line react-hooks/exhaustive-deps

  // Called to show more paginated devices from the overall filter devices list when scrolled down
  const getMorePaginatedDevices = () => {
    if(
      !loadingPaginatedDevices &&
      filteredDevices?.length &&
      paginatedDevices?.length &&
      filteredDevices.length > paginatedDevices.length
    ) {
      setTimeout(() => {
        setPaginatedDevices([
          ...paginatedDevices,
          ...filteredDevices.slice(paginatedDevices.length, PER_PAGE + paginatedDevices.length)
        ]);
      }, PAGINATION_LOAD_TIME);
    }
  }

  // Called once during component load, to get the devices of the facility
  useEffect(() => {
    window.scrollTo(0, 0);
    const { devices } = location.state || {
      devices: [],
    };
    if (devices.length) {
      setDeviceFacility(devices);
    } else {
      getFacilityDevices(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Method to create interval and execute callback method at
  // every given interval, and delete the interval during unload
  const useInterval = (callback: () => void, delay: number) => {
    const savedCallback = useRef(() => {/**/});

    // Remember the latest callback
    useEffect(() => {
      if (callback) savedCallback.current = callback;
    }, [callback]);

    // Set up the interval
    useEffect(() => {
      const tick = () => {
        if (savedCallback.current) savedCallback.current();
      };
      if (delay !== null) {
        const id = setInterval(tick, delay);
        setIntervalId(id);
        return () => clearInterval(id);
      }
    }, [delay]);
  };

  // Called useInterval method with getFacilityDevices method
  // at every POLLING_INTERVAL time to update the devices list
  useInterval(() => {
    getFacilityDevices();
  }, POLLING_INTERVAL);

  return (
    <div className={styles.container}>
      <Header step={2} onGoBack={backToHome} goBack={true} />
      {isLoading ? <Loading /> : <div className={styles.overlayFrame} />}
      <div className={styles.content}>
        <div className={styles.refreshButtonContainer}>
          <p className={styles.facilityContainer}>
            {t("devices_page.facility_name")}
            <span style={{ fontWeight: "bold" }}>
              {facilityDetails?.facilityName ?? ""}
            </span>
          </p>
          <button
            className={styles.refreshButton}
            onClick={refreshDevices}
            disabled={buttonClicked}
          >
            <RefreshOutlinedIcon className={styles.refreshButtonIcon} />
            {t("devices_page.refresh_devices")}
          </button>
        </div>
        <div className={styles.filters}>
          <div
            onClick={() => updateSelectedFilter(DEVICE_STATUS.ALL)}
            className={cx([
              styles.filter,
              compareArray(selectedFilter, DEVICE_STATUS.ALL) &&
                styles.selected,
            ])}
          >
            {t("devices_page.all")}
            <span>({allDevices.length})</span>
          </div>
          <div
            onClick={() => updateSelectedFilter(DEVICE_STATUS.TO_DO)}
            className={cx([
              styles.filter,
              compareArray(selectedFilter, DEVICE_STATUS.TO_DO) &&
                styles.selected,
            ])}
          >
            <span className={cx([styles.filterIcon, styles.toDoIcon])}>
              <CreateIcon />
            </span>
            {t("devices_page.toDo")}
            <span>({toDoDevicesCount})</span>
          </div>
          <div
            onClick={() => updateSelectedFilter(DEVICE_STATUS.IN_REVIEW)}
            className={cx([
              styles.filter,
              compareArray(selectedFilter, DEVICE_STATUS.IN_REVIEW) &&
                styles.selected,
            ])}
          >
            <span className={cx([styles.filterIcon, styles.inReviewIcon])}>
              <SearchIcon />
            </span>
            {t("devices_page.inReview")}
            <span>({inReviewDevicesCount})</span>
          </div>
          <div
            onClick={() => updateSelectedFilter(DEVICE_STATUS.COMPLETED)}
            className={cx([
              styles.filter,
              compareArray(selectedFilter, DEVICE_STATUS.COMPLETED) &&
                styles.selected,
            ])}
          >
            <span className={cx([styles.filterIcon, styles.completedIcon])}>
              <CheckIcon />
            </span>
            {t("devices_page.completed")}
            <span>({completedDevicesCount})</span>
          </div>
        </div>
        <div className={styles.devices}>
          <InfiniteScroll
            threshold={10}
            loadMore={getMorePaginatedDevices}
            useWindow={useScreenOrientation() === LANDSCAPE_MODE}
            hasMore={paginatedDevices?.length < filteredDevices?.length || false}
            loader={
              <LoadingIcons.ThreeDots className={styles.loader}
                stroke="yellow" fill="#2d2d2f" key={0} speed={0.8} height={20} />
            }
          >
            {paginatedDevices.map((device, i) => {
              return (
                <div key={i} className={styles.device}>
                  <div className={styles.nameContainer}>
                    <span className={styles.name}>{device.device_name}</span>
                    {DEVICE_STATUS.TO_DO.includes(device.result) ? (
                      <span className={cx([styles.deviceIcon, styles.toDoIcon])}>
                        {t("devices_page.toDo")}
                      </span>
                    ) : DEVICE_STATUS.IN_REVIEW.includes(device.result) ? (
                      <span
                        className={cx([styles.deviceIcon, styles.inReviewIcon])}
                      >
                        {t("devices_page.inReview")}
                      </span>
                    ) : DEVICE_STATUS.COMPLETED.includes(device.result) ? (
                      <span
                        className={cx([styles.deviceIcon, styles.completedIcon])}
                      >
                        {t("devices_page.completed")}
                      </span>
                    ) : null}
                  </div>
                  {deviceStatus && <DeviceConnectionState state={deviceStatus[device.id]} />}
                  <div className={styles.buttonsContainer}>
                    <button
                      className={styles.setupButton}
                      disabled={
                        !DEVICE_STATUS.TO_DO.includes(device.result) ||
                        buttonClicked
                      }
                      onClick={() => setupDevice(device)}
                    >
                      {t("devices_page.setup")}
                    </button>
                  </div>
                </div>
              );
            })}
          </InfiniteScroll>
          {filteredDevices.length ? null : (
            <div className={styles.emptyDevicesList}>
              {t("devices_page.no_devices")}
            </div>
          )}
        </div>
      </div>
      {errorMessage ? (
        <Alert
          color="error"
          severity="error"
          variant="filled"
          className={styles.errorMsg}
          onClose={() => setErrorMessage("")}
        >
          {errorMessage in EN.error_code
            ? t("error_code." + errorMessage)
            : t("error_code.10000")}
        </Alert>
      ) : null}
    </div>
  );
};
