import axios from "axios"

type ApiErrorPayload = {
  code?: string
  message?: string
}

export class ApiError extends Error {
  readonly code?: string
  readonly status: number

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: {
    Accept: "application/json",
  },
  timeout: 10_000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError<ApiErrorPayload>(error)) {
      return Promise.reject(
        new ApiError("An unexpected error occurred.", 0, "UNKNOWN_ERROR")
      )
    }

    const status = error.response?.status ?? 0
    const payload = error.response?.data
    const message =
      payload?.message ??
      (status === 0
        ? "Unable to connect to the service."
        : "The request could not be completed.")

    if (status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"))
    }

    return Promise.reject(new ApiError(message, status, payload?.code))
  }
)
