import { apiClient } from "@/api/client"
import type {
  PerformanceIndexResponse,
  VendorPerformanceResponse,
} from "@/features/performance/types"

export async function getPerformanceIndex(
  signal?: AbortSignal
): Promise<PerformanceIndexResponse> {
  const response = await apiClient.get<PerformanceIndexResponse>(
    "/performance",
    { signal }
  )

  return response.data
}

export async function getVendorPerformance(
  vendorId: string,
  signal?: AbortSignal
): Promise<VendorPerformanceResponse> {
  const response = await apiClient.get<VendorPerformanceResponse>(
    `/performance/${encodeURIComponent(vendorId)}`,
    { signal }
  )

  return response.data
}
