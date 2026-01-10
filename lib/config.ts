export const config = {
  // Use mock data in v0 console, API data in local development
  useMockData:
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
    (typeof window !== "undefined" && window.location.hostname.includes("v0.app")),
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
  exchangeRatesApiBaseUrl:
    process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
} as const
