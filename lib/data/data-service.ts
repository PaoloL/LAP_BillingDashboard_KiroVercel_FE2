import { config } from "@/lib/config"
import { mockPayerAccounts, mockUsageAccounts, mockTransactionsByPeriod } from "./mock-data"
import { apiClient } from "./api-client"
import type { PayerAccount, UsageAccount, TransactionDetail } from "@/lib/types"

export const dataService = {
  // Payer Accounts
  async getPayerAccounts(): Promise<PayerAccount[]> {
    if (config.useMockData) {
      return Promise.resolve(mockPayerAccounts)
    }
    return apiClient.getPayerAccounts()
  },

  async createPayerAccount(data: Omit<PayerAccount, "id">): Promise<PayerAccount> {
    if (config.useMockData) {
      const newAccount = { ...data, id: Math.random().toString(36).substr(2, 9) }
      console.log("[v0] Mock: Created payer account", newAccount)
      return Promise.resolve(newAccount as PayerAccount)
    }
    return apiClient.createPayerAccount(data)
  },

  async updatePayerAccount(id: string, data: Partial<PayerAccount>): Promise<PayerAccount> {
    if (config.useMockData) {
      const account = mockPayerAccounts.find((a) => a.id === id)
      if (!account) throw new Error("Account not found")
      const updated = { ...account, ...data }
      console.log("[v0] Mock: Updated payer account", updated)
      return Promise.resolve(updated)
    }
    return apiClient.updatePayerAccount(id, data)
  },

  // Usage Accounts
  async getUsageAccounts(): Promise<UsageAccount[]> {
    if (config.useMockData) {
      return Promise.resolve(mockUsageAccounts)
    }
    return apiClient.getUsageAccounts()
  },

  async createUsageAccount(data: Omit<UsageAccount, "id">): Promise<UsageAccount> {
    if (config.useMockData) {
      const newAccount = { ...data, id: Math.random().toString(36).substr(2, 9) }
      console.log("[v0] Mock: Created usage account", newAccount)
      return Promise.resolve(newAccount as UsageAccount)
    }
    return apiClient.createUsageAccount(data)
  },

  async updateUsageAccount(id: string, data: Partial<UsageAccount>): Promise<UsageAccount> {
    if (config.useMockData) {
      const account = mockUsageAccounts.find((a) => a.id === id)
      if (!account) throw new Error("Account not found")
      const updated = { ...account, ...data }
      console.log("[v0] Mock: Updated usage account", updated)
      return Promise.resolve(updated)
    }
    return apiClient.updateUsageAccount(id, data)
  },

  // Transactions
  async getTransactions(params?: {
    startDate?: Date
    endDate?: Date
    sortBy?: "name" | "date"
    sortOrder?: "asc" | "desc"
  }): Promise<Record<string, TransactionDetail[]>> {
    if (config.useMockData) {
      return Promise.resolve(mockTransactionsByPeriod)
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
}
