import throttle from "lodash/throttle";
import { client } from "./client";

// Interface definitions
interface DeviceResponse {
  devices: DeviceCombinedItem[];
  total: number;
}

// GET devices
export const getDevices = async (
  customerId: number,
  facilityName?: string,
  prefecture?: string | null,
  municipality?: string,
  status?: string | null,
): Promise<DeviceResponse> => {
  try {
    const res = await client.get("devices", {
      params: {
        customer_id: customerId,
        facility_name: facilityName,
        prefecture: prefecture,
        municipality: municipality,
        status: status,
      },
    });
    return res.data;
  } catch (err: any) {
    console.warn("Error fetching devices:", err);
    throw err;
  }
};

// GET device status
export const getDeviceStatus = async (
  customerId: number | null,
  currentPage: number,
  perPage: number,
  facilityName?: string,
  prefecture?: string | null,
  municipality?: string,
  status?: string | null,
) => {
  try {
    if (customerId === null) return null;

    const res = await client.get("devices/status", {
      params: {
        customer_id: customerId,
        page: currentPage,
        page_size: perPage,
        facility_name: facilityName,
        prefecture: prefecture,
        municipality: municipality,
        status: status,
      },
    });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};

export const getDeviceStatusThrottled = throttle(getDeviceStatus, 500, {
  trailing: false,
});

export interface DeviceSaveOrUpdateItem {
  device_id: string;
  device_name: string;
  facility_id: number;
  device_type_id: number;
}

export interface DeviceSaveOrUpdateRequest {
  customer_id: number;
  devices: DeviceSaveOrUpdateItem[];
}

export interface DeviceCombinedItem {
  device_id: string;
  device_name: string;
  facility_id: number | null;
  facility_name: string | null;
  device_type_id: number | null;
  device_type_name: string | null;
  registered_flag: boolean;
  group_name: string | null;
  connection_status: string;
}

// POST devices
export const saveOrUpdateDevices = async (data: DeviceSaveOrUpdateRequest) => {
  try {
    const res = await client.post("devices", data);
    return res.data;
  } catch (err: any) {
    console.warn("Error saving or updating devices:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
};

interface DeviceDeregisterItem {
  facility_id: number;
  device_id: string;
}

export const deregisterDevices = async (devices: DeviceDeregisterItem[]) => {
  try {
    const res = await client.delete("devices", {
      data: {
        devices: devices,
      },
    });
    return res.data;
  } catch (err: any) {
    console.warn("Error deregistering devices:", err);
    throw err;
  }
};
