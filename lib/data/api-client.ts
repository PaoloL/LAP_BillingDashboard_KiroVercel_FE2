import { config } from "@/lib/config"
import type { PayerAccount, UsageAccount, TransactionDetail, ExchangeRateConfig, CreateExchangeRateDTO, UpdateExchangeRateDTO } from "@/lib/types"

class ApiClient {
  private baseUrl: string
  private exchangeRatesBaseUrl: string

  constructor() {
    this.baseUrl = config.apiBaseUrl
    this.exchangeRatesBaseUrl = config.exchangeRatesApiBaseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit, useExchangeRatesApi = false): Promise<T> {
    const baseUrl = useExchangeRatesApi ? this.exchangeRatesBaseUrl : this.baseUrl
    const response = await fetch(`${baseUrl}${endpoint}`, {
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

  async discoverUsageAccounts(startDate?: string, endDate?: string): Promise<{
    summary: {
      totalTransactionAccounts: number
      existingAccounts: number
      unregisteredFound: number
      accountsCreated: number
    }
    createdAccounts: Array<{
      UsageAccountId: string
      Status: string
      DiscoveredAt: string
      LastSeenInTransactions: string
    }>
    dateRange: {
      startDate: string
      endDate: string
    }
  }> {
    const body: any = {}
    if (startDate) body.start_date = startDate
    if (endDate) body.end_date = endDate
    
    return this.request("/usage-accounts/discover", {
      method: "POST",
      body: JSON.stringify(body)
    })
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
    startPeriod?: string  // YYYY-MM format
    endPeriod?: string    // YYYY-MM format
    sortBy?: "name" | "date"
    sortOrder?: "asc" | "desc"
    payerAccountId?: string
    usageAccountId?: string
    limit?: number
  }): Promise<{data: any}> {
    const searchParams = new URLSearchParams()
    
    // Use billing periods if provided, otherwise fall back to dates
    if (params?.startPeriod) searchParams.append("startPeriod", params.startPeriod)
    if (params?.endPeriod) searchParams.append("endPeriod", params.endPeriod)
    if (params?.startDate && !params?.startPeriod) searchParams.append("startDate", params.startDate.toISOString())
    if (params?.endDate && !params?.endPeriod) searchParams.append("endDate", params.endDate.toISOString())
    
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder)
    if (params?.payerAccountId) searchParams.append("payerAccountId", params.payerAccountId)
    if (params?.usageAccountId) searchParams.append("usageAccountId", params.usageAccountId)
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    return this.request<{data: any}>(`/transactions?${searchParams.toString()}`)
  }

  async createTransaction(data: Omit<TransactionDetail, "id">): Promise<TransactionDetail> {
    return this.request<TransactionDetail>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Exchange Rates
  async getExchangeRates(params?: {
    payerAccountId?: string
    billingPeriod?: string
  }): Promise<ExchangeRateConfig[]> {
    const searchParams = new URLSearchParams()
    if (params?.payerAccountId) searchParams.append("payerAccountId", params.payerAccountId)
    if (params?.billingPeriod) searchParams.append("billingPeriod", params.billingPeriod)

    const response = await this.request<{ data: ExchangeRateConfig[] }>(`/settings/exchange-rates?${searchParams.toString()}`, {}, true)
    return response.data
  }

  async createExchangeRate(data: CreateExchangeRateDTO): Promise<ExchangeRateConfig> {
    return this.request<ExchangeRateConfig>("/settings/exchange-rates", {
      method: "POST",
      body: JSON.stringify(data),
    }, true)
  }

  async getExchangeRateById(id: string): Promise<ExchangeRateConfig> {
    return this.request<ExchangeRateConfig>(`/settings/exchange-rates/${id}`, {}, true)
  }

  async updateExchangeRate(payerAccountId: string, data: UpdateExchangeRateDTO): Promise<ExchangeRateConfig> {
    return this.request<ExchangeRateConfig>(`/settings/exchange-rates/${payerAccountId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true)
  }

  async deleteExchangeRate(payerAccountId: string, billingPeriod: string): Promise<void> {
    await this.request<void>(`/settings/exchange-rates/${payerAccountId}?billingPeriod=${billingPeriod}`, {
      method: "DELETE",
    }, true)
  }

  async applyExchangeRate(rateId: string): Promise<{
    message: string
    affectedTransactions: number
    billingPeriod: string
    payerAccountId: string
    exchangeRate: number
  }> {
    return this.request(`/settings/exchange-rates/${rateId}/apply`, {
      method: "POST",
    }, true)
  }
}

export const apiClient = new ApiClient()
