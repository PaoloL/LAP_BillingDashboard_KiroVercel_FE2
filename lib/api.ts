const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL || 'https://api.billing-dashboard.com/v1'

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  // Add auth token if available (implement based on your auth system)
  const authToken = localStorage.getItem('auth_token')
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Handle auth error
      localStorage.removeItem('auth_token')
      window.location.href = '/'
    }
    throw new Error(`API Error: ${response.statusText}`)
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const accountsApi = {
  // Payer Accounts
  getPayerAccounts: (status?: string) => 
    apiRequest<{ count: number; data: any[] }>(`/accounts/payer${status ? `?status=${status}` : ''}`),
  
  createPayerAccount: (data: any) =>
    apiRequest<any>('/accounts/payer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updatePayerAccount: (id: string, data: any) =>
    apiRequest<any>(`/accounts/payer/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  archivePayerAccount: (id: string) =>
    apiRequest<void>(`/accounts/payer/${id}`, {
      method: 'DELETE',
    }),

  // Usage Accounts
  getUsageAccounts: (status?: string) =>
    apiRequest<{ count: number; data: any[] }>(`/accounts/usage${status ? `?status=${status}` : ''}`),
  
  createUsageAccount: (data: any) =>
    apiRequest<any>('/accounts/usage', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateUsageAccount: (id: string, data: any) =>
    apiRequest<any>(`/accounts/usage/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  getUsageAccountDetails: (id: string) =>
    apiRequest<any>(`/accounts/usage/${id}`),
  
  archiveUsageAccount: (id: string) =>
    apiRequest<void>(`/accounts/usage/${id}`, {
      method: 'DELETE',
    }),
}
