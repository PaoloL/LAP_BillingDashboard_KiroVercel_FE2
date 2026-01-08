import { config } from "@/lib/config"
import { mockPayerAccounts, mockUsageAccounts, mockTransactionsByPeriod } from "./mock-data"
import { apiClient } from "./api-client"
import type { PayerAccount, UsageAccount, TransactionDetail } from "@/lib/types"

// Create mutable copies for mock data
let mutablePayerAccounts = [...mockPayerAccounts]
let mutableUsageAccounts = [...mockUsageAccounts]

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
      return Promise.resolve([...mutableUsageAccounts])
    }
    return apiClient.getUsageAccounts()
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
  }): Promise<{data: Record<string, TransactionDetail[]>}> {
    if (config.useMockData) {
      return Promise.resolve({data: mockTransactionsByPeriod})
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
