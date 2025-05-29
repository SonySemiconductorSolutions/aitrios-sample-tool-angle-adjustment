import { client } from "./client";

interface FacilityApiData {
  customer_id: number;
  facility_name: string;
  facility_type_id: number;
  prefecture: string;
  municipality: string;
  effective_start_utc: string;
  effective_end_utc: string;
}

interface Facility {
  id: number;
  facility_name: string;
  facility_type_id: number;
  facility_type_name: string;
  prefecture: string;
  municipality: string;
  effective_start_utc: string;
  effective_end_utc: string;
  customer_id: number;
}

// GET /facilities/{facility_id}
export const getFacilityById = async (facilityId: number) => {
  try {
    const res = await client.get(`facilities/${facilityId}`);
    return res.data.data; // data プロパティを返す
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn("Error in getFacilityById:", error.message);
    throw error;
  }
};

// POST /facilities/{facility_id}
export const createOrUpdateFacility = async (
  facilityId: number,
  facilityData: FacilityApiData,
) => {
  try {
    const res = await client.post(`facilities/${facilityId}`, facilityData);
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn("Error in create/update facility:", error);
    throw error;
  }
};

// GET /facilities?customer_id={customer_id}
export const getFacilitiesByCustomer = async (
  customerId: number,
): Promise<{ facilities: Facility[] }> => {
  try {
    const res = await client.get("facilities", {
      params: { customer_id: customerId },
    });
    return res.data;
  } catch (err: any) {
    console.warn("Error fetching facilities:", err);
    throw err;
  }
};
