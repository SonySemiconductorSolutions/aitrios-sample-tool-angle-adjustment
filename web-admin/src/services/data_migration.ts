import { client } from "./client";

// API call to export data
export const exportData = async () => {
  try {
    const url = "data-migration/export";
    const res = await client.get(url);
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};

// API call to import data
export const importData = async (jsonFile: File) => {
  try {
    const url = "data-migration/import";
    const formData = new FormData();
    formData.append("json_file", jsonFile);

    const res = await client.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};
