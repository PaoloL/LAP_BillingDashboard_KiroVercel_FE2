import { config } from "@/lib/config"
import type { PayerAccount, UsageAccount, TransactionDetail } from "@/lib/types"

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = config.apiBaseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
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

  // Payer Accounts
  async getPayerAccounts(): Promise<PayerAccount[]> {
    const response = await this.request<{ data: PayerAccount[] }>("/payer-accounts")
    return response.data
  }

  async createPayerAccount(data: Omit<PayerAccount, "id">): Promise<PayerAccount> {
    const response = await this.request<{ data: PayerAccount }>("/payer-accounts", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  }

  async updatePayerAccount(accountId: string, data: Partial<PayerAccount>): Promise<PayerAccount> {
    const response = await this.request<{ data: PayerAccount }>(`/payer-accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.data
  }

  async archivePayerAccount(accountId: string): Promise<void> {
    await this.request<void>(`/payer-accounts/${accountId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Archived" }),
    })
  }

  async unarchivePayerAccount(accountId: string): Promise<PayerAccount> {
    const response = await this.request<{ data: PayerAccount }>(`/payer-accounts/${accountId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Registered" }),
    })
    return response.data
  }

  async deletePayerAccount(accountId: string): Promise<void> {
    await this.request<void>(`/payer-accounts/${accountId}`, {
      method: "DELETE",
    })
  }

  // Usage Accounts
  async getUsageAccounts(): Promise<UsageAccount[]> {
    const response = await this.request<{ data: UsageAccount[] }>("/usage-accounts")
    return response.data
  }

  async createUsageAccount(data: Omit<UsageAccount, "id">): Promise<UsageAccount> {
    const response = await this.request<{ data: UsageAccount }>("/usage-accounts", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  }

  async updateUsageAccount(accountId: string, data: Partial<UsageAccount>): Promise<UsageAccount> {
    const response = await this.request<{ data: UsageAccount }>(`/usage-accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.data
  }

  async changeUsageAccountStatus(accountId: string, status: string): Promise<UsageAccount> {
    const response = await this.request<{ data: UsageAccount }>(`/usage-accounts/${accountId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
    return response.data
  }

  async deleteUsageAccount(accountId: string): Promise<void> {
    await this.request<void>(`/usage-accounts/${accountId}`, {
      method: "DELETE",
    })
  }

  // Transactions
  async getTransactions(params?: {
    startDate?: Date
    endDate?: Date
    sortBy?: "name" | "date"
    sortOrder?: "asc" | "desc"
    payerAccountId?: string
    usageAccountId?: string
  }): Promise<{data: Record<string, TransactionDetail[]>}> {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append("startDate", params.startDate.toISOString())
    if (params?.endDate) searchParams.append("endDate", params.endDate.toISOString())
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder)
    if (params?.payerAccountId) searchParams.append("payerAccountId", params.payerAccountId)
    if (params?.usageAccountId) searchParams.append("usageAccountId", params.usageAccountId)

    return this.request<{data: Record<string, TransactionDetail[]>}>(`/transactions?${searchParams.toString()}`)
  }

  async createTransaction(data: Omit<TransactionDetail, "id">): Promise<TransactionDetail> {
    return this.request<TransactionDetail>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
