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
  customer: string
  status: "Unregistered" | "Registered" | "Archived"
  payerAccountId: string
  vatNumber: string
  resellerDiscount: number // Percentage
  customerDiscount: number // Percentage
  rebateToSeller: {
    usage: {
      discountedUsage: boolean
      savingsPlanCoveredUsage: boolean
    }
    fee: {
      fee: boolean
      riFee: boolean
      savingsPlanRecurringFee: boolean
      savingsPlanUpfrontFee: boolean
    }
    discount: {
      bundledDiscount: boolean
      discount: boolean
      credit: boolean
      privateRateDiscount: boolean
      distributorDiscount: boolean
    }
    adjustment: {
      credit: boolean
      refund: boolean
      savingsPlanNegation: boolean
    }
  }
  rebateToCustomer: {
    discount: {
      bundledDiscount: boolean
      discount: boolean
      credit: boolean
      privateRateDiscount: boolean
    }
    adjustment: {
      credit: boolean
      refund: boolean
      savingsPlanNegation: boolean
    }
  }
  fundsUtilization: number
  totalUsage: number
  totalDeposit: number
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
  dateTime: Date
  billingPeriod?: string
  payerAccount: {
    name: string
    id: string
  }
  usageAccount: {
    name: string
    id: string
  }
  costBreakdown: {
    usage: number
    fee: number
    discount: number
    credits?: number
    adjustment: number
    tax: number
  }
  distributorCost: {
    usd: number
    eur: number
  }
  sellerCost: {
    usd: number
    eur: number
  }
  customerCost: {
    usd: number
    eur: number
  }
  exchangeRate: number
  dataType: "Export" | "Manual"
  info?: string
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
