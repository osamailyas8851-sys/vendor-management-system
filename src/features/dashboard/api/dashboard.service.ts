import { apiClient } from "@/api/client"
import type { DashboardResponse } from "@/features/dashboard/types"

export async function getDashboard(
  signal?: AbortSignal
): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>("/dashboard", {
    signal,
  })

  return response.data
}
