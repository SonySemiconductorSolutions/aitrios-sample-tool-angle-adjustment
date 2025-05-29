import { client } from "./client";

// API call to fetch all facility types
export const getFacilityTypes = async () => {
  try {
    const res = await client.get("facility-types");
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};

// API call to create a new facility type
export const createFacilityType = async (name: string) => {
  try {
    const res = await client.post("facility-types", { name });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};
