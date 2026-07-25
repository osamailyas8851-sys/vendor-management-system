import { apiClient } from "@/api/client"
import type {
  CreateVendorInput,
  Vendor,
  VendorComparisonResponse,
  VendorDetailsResponse,
  VendorListResponse,
} from "@/features/vendors/types"

export async function getVendors(
  signal?: AbortSignal
): Promise<VendorListResponse> {
  const response = await apiClient.get<VendorListResponse>("/vendors", {
    signal,
  })

  return response.data
}

export async function createVendor(input: CreateVendorInput): Promise<Vendor> {
  const response = await apiClient.post<Vendor>("/vendors", input)

  return response.data
}

export async function getVendorDetails(
  vendorId: string,
  signal?: AbortSignal
): Promise<VendorDetailsResponse> {
  const response = await apiClient.get<VendorDetailsResponse>(
    `/vendors/${encodeURIComponent(vendorId)}`,
    { signal }
  )

  return response.data
}

export async function getVendorComparison(
  vendorIds: string[],
  signal?: AbortSignal
): Promise<VendorComparisonResponse> {
  const response = await apiClient.get<VendorComparisonResponse>(
    "/vendors/compare",
    {
      params: { ids: vendorIds.join(",") },
      signal,
    }
  )

  return response.data
}
