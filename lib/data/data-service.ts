import { config } from "@/lib/config"
import { mockPayerAccounts, mockUsageAccounts, mockTransactionsByPeriod } from "./mock-data"
import { apiClient } from "./api-client"
import type { PayerAccount, UsageAccount, TransactionDetail, ExchangeRateConfig, CreateExchangeRateDTO, UpdateExchangeRateDTO } from "@/lib/types"

// Create mutable copies for mock data
const mutablePayerAccounts = [...mockPayerAccounts]
const mutableUsageAccounts = [...mockUsageAccounts]

export const dataService = {
  // Payer Accounts
  async getPayerAccounts(): Promise<PayerAccount[]> {
    if (config.useMockData) {
      return Promise.resolve([...mutablePayerAccounts])
    }
    return apiClient.getPayerAccounts()
  },

  async createPayerAccount(data: Omit<PayerAccount, "id">): Promise<PayerAccount> {
    if (config.useMockData) {
      const newAccount = { ...data, id: Math.random().toString(36).substr(2, 9) }
      mutablePayerAccounts.push(newAccount as PayerAccount)
      console.log("[v0] Mock: Created payer account", newAccount)
      return Promise.resolve(newAccount as PayerAccount)
    }
    return apiClient.createPayerAccount(data)
  },

  async updatePayerAccount(accountId: string, data: Partial<PayerAccount>): Promise<PayerAccount> {
    if (config.useMockData) {
      const index = mutablePayerAccounts.findIndex((a) => a.accountId === accountId)
      if (index === -1) throw new Error("Account not found")
      const updated = { ...mutablePayerAccounts[index], ...data }
      mutablePayerAccounts[index] = updated
      console.log("[v0] Mock: Updated payer account", updated)
      return Promise.resolve(updated)
    }
    return apiClient.updatePayerAccount(accountId, data)
  },

  async archivePayerAccount(accountId: string): Promise<void> {
    if (config.useMockData) {
      const index = mutablePayerAccounts.findIndex((a) => a.accountId === accountId)
      if (index === -1) throw new Error("Account not found")
      mutablePayerAccounts[index] = { ...mutablePayerAccounts[index], status: "Archived" }
      console.log("[v0] Mock: Archived payer account", accountId)
      return Promise.resolve()
    }
    return apiClient.archivePayerAccount(accountId)
  },

  async unarchivePayerAccount(accountId: string): Promise<PayerAccount> {
    if (config.useMockData) {
      const index = mutablePayerAccounts.findIndex((a) => a.accountId === accountId)
      if (index === -1) throw new Error("Account not found")
      const updated = { ...mutablePayerAccounts[index], status: "Registered" as const }
      mutablePayerAccounts[index] = updated
      console.log("[v0] Mock: Unarchived payer account", updated)
      return Promise.resolve(updated)
    }
    return apiClient.unarchivePayerAccount(accountId)
  },

  async deletePayerAccount(accountId: string): Promise<void> {
    if (config.useMockData) {
      const index = mutablePayerAccounts.findIndex((a) => a.accountId === accountId)
      if (index === -1) throw new Error("Account not found")
      mutablePayerAccounts.splice(index, 1)
      console.log("[v0] Mock: Deleted payer account", accountId)
      return Promise.resolve()
    }
    return apiClient.deletePayerAccount(accountId)
  },

  // Usage Accounts
  async getUsageAccounts(): Promise<UsageAccount[]> {
    if (config.useMockData) {
      console.log("[v0] Mock: Refreshing usage accounts to check for unregistered accounts")
      return Promise.resolve([...mutableUsageAccounts])
    }
    return apiClient.getUsageAccounts()
  },

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
    if (config.useMockData) {
      console.log("[v0] Mock: Discovering usage accounts from transactions")
      return Promise.resolve({
        summary: {
          totalTransactionAccounts: 5,
          existingAccounts: 0,
          unregisteredFound: 5,
          accountsCreated: 5
        },
        createdAccounts: [
          {
            UsageAccountId: "961572622422",
            Status: "Unregistered",
            DiscoveredAt: new Date().toISOString(),
            LastSeenInTransactions: new Date().toISOString()
          }
        ],
        dateRange: {
          startDate: startDate || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: endDate || new Date().toISOString()
        }
      })
    }
    return apiClient.discoverUsageAccounts(startDate, endDate)
  },

  async createUsageAccount(data: Omit<UsageAccount, "id">): Promise<UsageAccount> {
    if (config.useMockData) {
      const newAccount = { ...data, id: Math.random().toString(36).substr(2, 9) }
      mutableUsageAccounts.push(newAccount as UsageAccount)
      console.log("[v0] Mock: Created usage account", newAccount)
      return Promise.resolve(newAccount as UsageAccount)
    }
    return apiClient.createUsageAccount(data)
  },

  async updateUsageAccount(accountId: string, data: Partial<UsageAccount>): Promise<UsageAccount> {
    if (config.useMockData) {
      const index = mutableUsageAccounts.findIndex((a) => a.accountId === accountId)
      if (index === -1) throw new Error("Account not found")
      const updated = { ...mutableUsageAccounts[index], ...data }
      mutableUsageAccounts[index] = updated
      console.log("[v0] Mock: Updated usage account", updated)
      return Promise.resolve(updated)
    }
    return apiClient.updateUsageAccount(accountId, data)
  },

  async changeUsageAccountStatus(accountId: string, status: string): Promise<UsageAccount> {
    if (config.useMockData) {
      const index = mutableUsageAccounts.findIndex((a) => a.accountId === accountId)
      if (index === -1) throw new Error("Account not found")
      const updated = { ...mutableUsageAccounts[index], status }
      mutableUsageAccounts[index] = updated
      console.log("[v0] Mock: Changed usage account status", updated)
      return Promise.resolve(updated as UsageAccount)
    }
    return apiClient.changeUsageAccountStatus(accountId, status)
  },

  async deleteUsageAccount(accountId: string): Promise<void> {
    if (config.useMockData) {
      const index = mutableUsageAccounts.findIndex((a) => a.accountId === accountId)
      if (index === -1) throw new Error("Account not found")
      mutableUsageAccounts.splice(index, 1)
      console.log("[v0] Mock: Deleted usage account", accountId)
      return Promise.resolve()
    }
    return apiClient.deleteUsageAccount(accountId)
  },

  // Transactions
  async getTransactions(params?: {
    startDate?: Date
    endDate?: Date
    sortBy?: "name" | "date"
    sortOrder?: "asc" | "desc"
    payerAccountId?: string
    usageAccountId?: string
  }): Promise<{ data: Record<string, TransactionDetail[]> }> {
    if (config.useMockData) {
      return Promise.resolve({ data: mockTransactionsByPeriod })
    }
    return apiClient.getTransactions(params)
  },

  async createTransaction(data: Omit<TransactionDetail, "id">): Promise<TransactionDetail> {
    if (config.useMockData) {
      const newTransaction = { ...data, id: `txn-${Math.random().toString(36).substr(2, 9)}` }
      console.log("[v0] Mock: Created transaction", newTransaction)
      return Promise.resolve(newTransaction as TransactionDetail)
    }
    return apiClient.createTransaction(data)
  },

  // Exchange Rates
  async getExchangeRates(params?: {
    payerAccountId?: string
    billingPeriod?: string
  }): Promise<ExchangeRateConfig[]> {
    if (config.useMockData) {
      const mockRates: ExchangeRateConfig[] = [
        {
          id: "rate-123456789012-2025-01",
          payerAccountId: "123456789012",
          payerAccountName: "AWS Main Account",
          billingPeriod: "2025-01",
          exchangeRate: 1.093,
          createdAt: "2025-01-10T10:00:00Z",
          updatedAt: "2025-01-15T14:30:00Z",
        },
        {
          id: "rate-123456789012-2024-12",
          payerAccountId: "123456789012",
          payerAccountName: "AWS Main Account",
          billingPeriod: "2024-12",
          exchangeRate: 1.085,
          createdAt: "2024-12-01T10:00:00Z",
          updatedAt: "2024-12-01T10:00:00Z",
        },
        {
          id: "rate-987654321098-2025-01",
          payerAccountId: "987654321098",
          payerAccountName: "AWS Development",
          billingPeriod: "2025-01",
          exchangeRate: 1.09,
          createdAt: "2025-01-01T10:00:00Z",
          updatedAt: "2025-01-01T10:00:00Z",
        },
      ]
      
      let filtered = mockRates
      if (params?.payerAccountId) {
        filtered = filtered.filter(r => r.payerAccountId === params.payerAccountId)
      }
      if (params?.billingPeriod) {
        filtered = filtered.filter(r => r.billingPeriod === params.billingPeriod)
      }
      
      return Promise.resolve(filtered)
    }
    return apiClient.getExchangeRates(params)
  },

  async createExchangeRate(data: CreateExchangeRateDTO): Promise<ExchangeRateConfig> {
    if (config.useMockData) {
      const payer = mutablePayerAccounts.find(p => p.accountId === data.payerAccountId)
      const newRate: ExchangeRateConfig = {
        id: `rate-${data.payerAccountId}-${data.billingPeriod}`,
        payerAccountId: data.payerAccountId,
        payerAccountName: payer?.accountName || "Unknown Account",
        billingPeriod: data.billingPeriod,
        exchangeRate: data.exchangeRate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      console.log("[v0] Mock: Created exchange rate", newRate)
      return Promise.resolve(newRate)
    }
    return apiClient.createExchangeRate(data)
  },

  async updateExchangeRate(payerAccountId: string, data: UpdateExchangeRateDTO): Promise<ExchangeRateConfig> {
    if (config.useMockData) {
      const updatedRate: ExchangeRateConfig = {
        id: `rate-${payerAccountId}-${data.billingPeriod}`,
        payerAccountId,
        payerAccountName: "Mock Account",
        billingPeriod: data.billingPeriod,
        exchangeRate: data.exchangeRate,
        createdAt: "2025-01-01T10:00:00Z",
        updatedAt: new Date().toISOString(),
      }
      console.log("[v0] Mock: Updated exchange rate", updatedRate)
      return Promise.resolve(updatedRate)
    }
    return apiClient.updateExchangeRate(payerAccountId, data)
  },

  async deleteExchangeRate(payerAccountId: string, billingPeriod: string): Promise<void> {
    if (config.useMockData) {
      console.log("[v0] Mock: Deleted exchange rate", { payerAccountId, billingPeriod })
      return Promise.resolve()
    }
    return apiClient.deleteExchangeRate(payerAccountId, billingPeriod)
  },

  async applyExchangeRate(id: string): Promise<{
    message: string
    affectedTransactions: number
    billingPeriod: string
    payerAccountId: string
    exchangeRate: number
  }> {
    if (config.useMockData) {
      const result = {
        message: "All transactions have been recalculated successfully",
        affectedTransactions: 150,
        billingPeriod: id.split('-')[2],
        payerAccountId: id.split('-')[1],
        exchangeRate: 1.093,
      }
      console.log("[v0] Mock: Applied exchange rate", result)
      return Promise.resolve(result)
    }
    return apiClient.applyExchangeRate(id)
  },
}
