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
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Payer Accounts
  async getPayerAccounts(): Promise<PayerAccount[]> {
    return this.request<PayerAccount[]>("/payer-accounts")
  }

  async createPayerAccount(data: Omit<PayerAccount, "id">): Promise<PayerAccount> {
    return this.request<PayerAccount>("/payer-accounts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updatePayerAccount(id: string, data: Partial<PayerAccount>): Promise<PayerAccount> {
    return this.request<PayerAccount>(`/payer-accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Usage Accounts
  async getUsageAccounts(): Promise<UsageAccount[]> {
    return this.request<UsageAccount[]>("/usage-accounts")
  }

  async createUsageAccount(data: Omit<UsageAccount, "id">): Promise<UsageAccount> {
    return this.request<UsageAccount>("/usage-accounts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUsageAccount(id: string, data: Partial<UsageAccount>): Promise<UsageAccount> {
    return this.request<UsageAccount>(`/usage-accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Transactions
  async getTransactions(params?: {
    startDate?: Date
    endDate?: Date
    sortBy?: "name" | "date"
    sortOrder?: "asc" | "desc"
  }): Promise<Record<string, TransactionDetail[]>> {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append("startDate", params.startDate.toISOString())
    if (params?.endDate) searchParams.append("endDate", params.endDate.toISOString())
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder)

    return this.request<Record<string, TransactionDetail[]>>(`/transactions?${searchParams.toString()}`)
  }

  async createTransaction(data: Omit<TransactionDetail, "id">): Promise<TransactionDetail> {
    return this.request<TransactionDetail>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
