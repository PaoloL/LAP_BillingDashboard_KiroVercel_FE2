export type TimeRange = "MTD" | "3M" | "6M" | "YTD"

export interface CostMetric {
  name: string
  value: number
  fill?: string
}

export interface TrendMetric {
  date: string
  usage: number
  deposit: number
}

export interface Account {
  id: string
  name: string
  type: "PAYER" | "USAGE"
}

export interface PayerAccount extends Account {
  accountId: string // Must be exactly 12 digits
  accountName: string
  distributorName: string
  legalEntityName: string
  vatNumber: string
  crossAccountRoleArn: string
  status: "Registered" | "Archived"
  lastTransactionDate?: string
  usageAccountCount: number
  createdAt: string
  updatedAt: string
}

export interface UsageAccount extends Account {
  accountId: string // Must be exactly 12 digits
  accountName?: string
  customer: string
  status: "Unregistered" | "Registered" | "Archived"
  payerAccountId: string
  payerAccountName?: string
  vatNumber: string
  resellerDiscount: number // Percentage
  customerDiscount: number // Percentage
  rebateConfig: {
    savingsPlansRI: {
      discountedUsage: boolean
      savingsPlanNegation: boolean
    }
    discount: {
      discount: boolean
      bundledDiscount: boolean
      credit: boolean
      privateRateDiscount: boolean
    }
    adjustment: {
      credit: boolean
      refund: boolean
    }
  }
  fundsUtilization: number
  totalUsage: number
  totalDeposit: number
  totalCustomerCost: number
  availableFund: number // Calculated: totalDeposit - totalCustomerCost
  distributorName?: string
  lastTransactionDate?: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  date: Date
  type: "Usage" | "Credit" | "Deposit" | "Fee"
  accountId: string
  amount: number
  currency: string
  notes?: string
}

export interface CreateTransactionDTO {
  type: "Usage" | "Credit" | "Deposit" | "Fee"
  usageAccountId: string
  amount: number
  date: Date
  notes: string
}

export interface DashboardMetrics {
  usageByPayer: { name: string; value: number }[]
  usageByAccount: { name: string; value: number }[]
  discountByPayer: { name: string; value: number }[]
  discountByAccount: { name: string; value: number }[]
}

export interface RecentTransaction {
  id: string
  date: string
  accountName: string
  type: "Usage" | "Credit" | "Deposit" | "Fee"
  amount: number
}

export interface TransactionDetail {
  id: string
  dateTime?: Date
  billingPeriod?: string
  transactionType?: string
  accounts: {
    payer: {
      name: string
      id: string
    }
    usage: {
      name: string
      id: string
    }
  }
  costBreakdown?: {
    usage: number
    fee: number
    discount: number
    credits?: number
    adjustment: number
    tax: number
  }
  totals?: {
    distributor: {
      usd: number
      eur: number
    }
    seller: {
      usd: number
      eur: number
    }
    customer: {
      usd: number
      eur: number
    }
  }
  amount?: {
    usd: number
    eur: number
  }
  description?: string
  date?: string
  exchangeRate?: number
  dataType?: "Export" | "Manual"
  info?: string
  details?: {
    description?: string
    currency?: string
    value?: number
    entity?: any
    poNumber?: string
    costCenterId?: string
    costCenterName?: string
    customerVatNumber?: string
  }
  createdBy?: string
}

/**
 * Calculates Total Cost based on v8 specification
 *
 * Formula: Total Cost = usage + fee + effectiveCredit
 * Where effectiveCredit = rebateEnabled ? credit : 0
 */
export const calculateTotalCost = (usage: number, fee: number, credit: number, rebateEnabled: boolean): number => {
  // If rebate is OFF, Credit is ignored (0)
  const effectiveCredit = rebateEnabled ? credit : 0
  return usage + fee + effectiveCredit
}

export const calculateCosts = (
  usage: number,
  fee: number,
  credit: number,
  discountPercent: number,
  rebateEnabled: boolean,
) => {
  const applicableCredit = rebateEnabled ? credit : 0
  const totalCost = usage + fee + applicableCredit
  const discountedCost = totalCost - (totalCost * discountPercent) / 100
  return { totalCost, discountedCost }
}

export const validateDiscounts = (reseller: number, customer: number): string | null => {
  if (customer > reseller) {
    return "Customer discount cannot exceed Reseller discount."
  }
  return null
}

export interface CostCenter {
  id: string
  name: string
  description: string
  usageAccountIds: string[]
  createdAt: string
}

export interface Customer {
  id: string
  legalName: string
  vatNumber: string
  contactName: string
  contactEmail: string
  status: "Active" | "Archived"
  costCenters: CostCenter[]
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerDTO {
  legalName: string
  vatNumber: string
  contactName: string
  contactEmail: string
}

export interface ExchangeRateConfig {
  id: string
  payerAccountId: string
  payerAccountName: string
  billingPeriod: string // Format: YYYY-MM
  exchangeRate: number
  createdAt: string
  updatedAt: string
}

export interface CreateExchangeRateDTO {
  payerAccountId: string
  billingPeriod: string
  exchangeRate: number
}

export interface UpdateExchangeRateDTO {
  billingPeriod: string
  exchangeRate: number
}

// Users
export type UserRole = "Admin" | "Finance" | "Customer"
export type UserStatus = "Active" | "Inactive"

export interface PlatformUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  customerId?: string
  customerName?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserDTO {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  password: string
  customerId?: string
}

export interface UpdateUserDTO {
  firstName?: string
  lastName?: string
  role?: UserRole
  status?: UserStatus
  customerId?: string | null
  password?: string
}
