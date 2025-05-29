import { client } from "./client";

// Interface for the request body
interface GenerateQRCodesRequest {
  customers: { customer_id: number; facility_ids?: number[] }[];
}

// Function to generate QR codes for customers
export const generateCustomerQRCodes = async (
  customers: { customer_id: number; facility_ids?: number[] }[],
): Promise<Blob | null> => {
  try {
    const url = "customers/qr-codes"; // API endpoint
    const requestBody: GenerateQRCodesRequest = {
      customers,
    };
    const response = await client.post(url, requestBody, {
      responseType: "blob",
    });
    return response.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn("Error response:", error);
    return null;
  }
};
