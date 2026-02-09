import { config } from "@/lib/config"
import { mockPayerAccounts, mockUsageAccounts, mockTransactionsByPeriod, mockCustomers } from "./mock-data"
import { apiClient } from "./api-client"
import type { PayerAccount, UsageAccount, TransactionDetail, ExchangeRateConfig, CreateExchangeRateDTO, UpdateExchangeRateDTO, Customer, CreateCustomerDTO, CostCenter } from "@/lib/types"

// Create mutable copies for mock data
const mutablePayerAccounts = [...mockPayerAccounts]
const mutableUsageAccounts = [...mockUsageAccounts]
const mutableCustomers = [...mockCustomers]

export const dataService = {
  // Payer Accounts
  async getPayerAccounts(): Promise<PayerAccount[]> {
    if (config.useMockData) {
      return Promise.resolve([...mutablePayerAccounts])
    }
    
    const accounts = await apiClient.getPayerAccounts()
    
    // Enrich each payer account with last transaction date
    const enrichedAccounts = await Promise.all(
      accounts.map(async (account) => {
        try {
          // Get the most recent transaction for this payer account
          const transactions = await apiClient.getTransactions({
            payerAccountId: account.accountId,
            sortBy: "date",
            sortOrder: "desc",
            limit: 1
          })
          
          if (transactions.data && Array.isArray(transactions.data) && transactions.data.length > 0) {
            const lastTransaction = transactions.data[0]
            const lastTransactionDate = new Date(lastTransaction.updatedAt || lastTransaction.dateTime)
            
            // Format as "dd/mm/yy - hh:mm:ss"
            const formattedDate = lastTransactionDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            }) + ' - ' + lastTransactionDate.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })
            
            return {
              ...account,
              lastTransactionDate: formattedDate
            }
          }
          
          return account
        } catch (error) {
          console.error(`Failed to get last transaction for payer ${account.accountId}:`, error)
          return account
        }
      })
    )
    
    return enrichedAccounts
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
    startPeriod?: string  // YYYY-MM format
    endPeriod?: string    // YYYY-MM format
    sortBy?: "name" | "date"
    sortOrder?: "asc" | "desc"
    payerAccountId?: string
    usageAccountId?: string
    limit?: number
  }): Promise<{ data: any }> {
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

  async createDeposit(data: {
    usageAccountId: string
    amountEur: number
    date: string
    description: string
  }): Promise<{ transactionId: string; message: string }> {
    if (config.useMockData) {
      console.log("[v0] Mock: Created deposit", data)
      return Promise.resolve({ 
        transactionId: `DEP-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        message: "Deposit registered successfully"
      })
    }
    return apiClient.createDeposit(data)
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

  // Dashboard Summary
  async getCostTotals(params: {
    period: string
    entityType?: 'UsageMonthTotal' | 'UsageYearTotal' | 'PayerMonthTotal' | 'PayerYearTotal' | 'OrgMonthTotal' | 'OrgYearTotal'
  }): Promise<{
    count: number
    data: Array<{
      billingPeriod: string
      accounts: {
        payer: { id: string; name: string }
        usage: { id: string; name: string }
      }
      totals: {
        distributor: { usd: number; eur: number }
        seller: { usd: number; eur: number }
        customer: { usd: number; eur: number }
      }
    }>
  }> {
    if (config.useMockData) {
      return Promise.resolve({
        count: 2,
        data: [
          {
            billingPeriod: params.period,
            accounts: {
              payer: { id: '123456789012', name: 'Payer Account' },
              usage: { id: '111111111111', name: 'Usage Account' }
            },
            totals: {
              distributor: { usd: 45000, eur: 42000 },
              seller: { usd: 45000, eur: 42000 },
              customer: { usd: 52000, eur: 48000 }
            }
          }
        ]
      })
    }
    return apiClient.getCostTotals(params)
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    if (config.useMockData) {
      return Promise.resolve([...mutableCustomers])
    }
    const customers = await apiClient.getCustomers()
    // Update cache for ID->VAT lookups
    mutableCustomers.length = 0
    mutableCustomers.push(...customers)
    return customers
  },

  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    if (config.useMockData) {
      const newCustomer: Customer = {
        id: `cust-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        status: "Active",
        costCenters: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mutableCustomers.push(newCustomer)
      return Promise.resolve(newCustomer)
    }
    return apiClient.createCustomer(data)
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    if (config.useMockData) {
      const index = mutableCustomers.findIndex((c) => c.id === id)
      if (index === -1) throw new Error("Customer not found")
      const updated = { ...mutableCustomers[index], ...data, updatedAt: new Date().toISOString() }
      mutableCustomers[index] = updated
      return Promise.resolve(updated)
    }
    const customer = mutableCustomers.find(c => c.id === id)
    if (!customer) throw new Error("Customer not found")
    return apiClient.updateCustomer(customer.vatNumber, data)
  },

  async archiveCustomer(id: string): Promise<Customer> {
    if (config.useMockData) {
      const index = mutableCustomers.findIndex((c) => c.id === id)
      if (index === -1) throw new Error("Customer not found")
      mutableCustomers[index] = { ...mutableCustomers[index], status: "Archived", updatedAt: new Date().toISOString() }
      return Promise.resolve(mutableCustomers[index])
    }
    const customer = mutableCustomers.find(c => c.id === id)
    if (!customer) throw new Error("Customer not found")
    return apiClient.archiveCustomer(customer.vatNumber)
  },

  async restoreCustomer(id: string): Promise<Customer> {
    if (config.useMockData) {
      const index = mutableCustomers.findIndex((c) => c.id === id)
      if (index === -1) throw new Error("Customer not found")
      mutableCustomers[index] = { ...mutableCustomers[index], status: "Active", updatedAt: new Date().toISOString() }
      return Promise.resolve(mutableCustomers[index])
    }
    const customer = mutableCustomers.find(c => c.id === id)
    if (!customer) throw new Error("Customer not found")
    return apiClient.restoreCustomer(customer.vatNumber)
  },

  async deleteCustomer(id: string): Promise<void> {
    if (config.useMockData) {
      const index = mutableCustomers.findIndex((c) => c.id === id)
      if (index === -1) throw new Error("Customer not found")
      if (mutableCustomers[index].status !== "Archived") throw new Error("Customer must be archived before deletion")
      mutableCustomers.splice(index, 1)
      return Promise.resolve()
    }
    const customer = mutableCustomers.find(c => c.id === id)
    if (!customer) throw new Error("Customer not found")
    return apiClient.deleteCustomer(customer.vatNumber)
  },

  // Cost Centers
  async addCostCenter(customerId: string, data: { name: string; description: string }): Promise<Customer> {
    if (config.useMockData) {
      const index = mutableCustomers.findIndex((c) => c.id === customerId)
      if (index === -1) throw new Error("Customer not found")
      const newCC: CostCenter = {
        id: `cc-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        description: data.description,
        usageAccountIds: [],
        createdAt: new Date().toISOString(),
      }
      mutableCustomers[index].costCenters.push(newCC)
      mutableCustomers[index].updatedAt = new Date().toISOString()
      return Promise.resolve(mutableCustomers[index])
    }
    const customer = mutableCustomers.find(c => c.id === customerId)
    if (!customer) throw new Error("Customer not found")
    return apiClient.addCostCenter(customer.vatNumber, data)
  },

  async removeCostCenter(customerId: string, costCenterId: string): Promise<Customer> {
    if (config.useMockData) {
      const index = mutableCustomers.findIndex((c) => c.id === customerId)
      if (index === -1) throw new Error("Customer not found")
      mutableCustomers[index].costCenters = mutableCustomers[index].costCenters.filter((cc) => cc.id !== costCenterId)
      mutableCustomers[index].updatedAt = new Date().toISOString()
      return Promise.resolve(mutableCustomers[index])
    }
    const customer = mutableCustomers.find(c => c.id === customerId)
    if (!customer) throw new Error("Customer not found")
    return apiClient.removeCostCenter(customer.vatNumber, costCenterId)
  },

  // Cost Center -> Usage Account association
  async updateCostCenterAccounts(customerId: string, costCenterId: string, usageAccountIds: string[]): Promise<Customer> {
    if (config.useMockData) {
      const index = mutableCustomers.findIndex((c) => c.id === customerId)
      if (index === -1) throw new Error("Customer not found")
      const cc = mutableCustomers[index].costCenters.find((c) => c.id === costCenterId)
      if (!cc) throw new Error("Cost center not found")
      cc.usageAccountIds = usageAccountIds
      mutableCustomers[index].updatedAt = new Date().toISOString()
      return Promise.resolve(mutableCustomers[index])
    }
    const customer = mutableCustomers.find(c => c.id === customerId)
    if (!customer) throw new Error("Customer not found")
    return apiClient.updateCostCenterAccounts(customer.vatNumber, costCenterId, usageAccountIds)
  },

  async createDeposit(customerId: string, data: { costCenterId: string; amountEur: number; description: string; poNumber: string }): Promise<any> {
    if (config.useMockData) {
      console.log("[v0] Mock: Created deposit", data)
      return Promise.resolve({ 
        depositId: `DEP-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        message: "Deposit registered successfully"
      })
    }
    const customer = mutableCustomers.find(c => c.id === customerId)
    if (!customer) throw new Error("Customer not found")
    return apiClient.createDeposit(customer.vatNumber, data)
  },
}
