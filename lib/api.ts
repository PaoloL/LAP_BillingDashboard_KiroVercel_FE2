const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL || 'https://api.billing-dashboard.com/v1'

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API Error: ${response.statusText}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const accountsApi = {
  // Payer Accounts - using new API specification paths
  getPayerAccounts: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)
    
    const query = searchParams.toString()
    return apiRequest<{ data: any[]; pagination: any }>(`/payer-accounts${query ? `?${query}` : ''}`)
  },
  
  getPayerAccount: (accountId: string) =>
    apiRequest<{ data: any }>(`/payer-accounts/${accountId}`),
  
  createPayerAccount: (data: any) =>
    apiRequest<{ data: any; message: string }>('/payer-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updatePayerAccount: (accountId: string, data: any) =>
    apiRequest<{ data: any; message: string }>(`/payer-accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  archivePayerAccount: (accountId: string) =>
    apiRequest<{ data: any; message: string }>(`/payer-accounts/${accountId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Archived' }),
    }),

  // Usage Accounts - using new API specification paths
  getUsageAccounts: (params?: { page?: number; limit?: number; status?: string; payerAccountId?: string; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.payerAccountId) searchParams.set('payerAccountId', params.payerAccountId)
    if (params?.search) searchParams.set('search', params.search)
    
    const query = searchParams.toString()
    return apiRequest<{ data: any[]; pagination: any }>(`/usage-accounts${query ? `?${query}` : ''}`)
  },
  
  getUsageAccount: (accountId: string) =>
    apiRequest<{ data: any }>(`/usage-accounts/${accountId}`),
  
  createUsageAccount: (data: any) =>
    apiRequest<{ data: any; message: string }>('/usage-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateUsageAccount: (accountId: string, data: any) =>
    apiRequest<{ data: any; message: string }>(`/usage-accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  changeUsageAccountStatus: (accountId: string, status: string) =>
    apiRequest<{ data: any; message: string }>(`/usage-accounts/${accountId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}
