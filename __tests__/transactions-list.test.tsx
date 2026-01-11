import { render, screen, waitFor } from '@testing-library/react'
import { TransactionsList } from '../components/transactions-list'

// Mock the data service
jest.mock('../lib/data/data-service', () => ({
  dataService: {
    getTransactions: jest.fn()
  }
}))

// Import after mocking
import { dataService } from '../lib/data/data-service'
const mockDataService = dataService as jest.Mocked<typeof dataService>

describe('TransactionsList with Real API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should load and display transactions from real API', async () => {
    // Mock real API response structure
    const mockApiResponse = {
      data: {
        "January 2026": [
          {
            id: "test-1",
            dateTime: "2026-01-08T01:48:53.219521+00:00",
            payerAccount: { name: "Test Payer", id: "123456789012" },
            usageAccount: { name: "Test Usage", id: "987654321098" },
            distributorCost: { usd: 100.50, eur: 95.25 },
            sellerCost: { usd: 100.50, eur: 95.25 },
            customerCost: { usd: 100.50, eur: 95.25 },
            costBreakdown: { usage: 100.50, fee: 0, discount: 0, adjustment: 0, tax: 0 },
            exchangeRate: 1.05,
            dataType: "Export",
            info: ""
          }
        ]
      }
    }

    mockDataService.getTransactions.mockResolvedValue(mockApiResponse)

    render(<TransactionsList />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(mockDataService.getTransactions).toHaveBeenCalled()
    })

    // Verify API was called with correct parameters
    expect(mockDataService.getTransactions).toHaveBeenCalledWith({
      startDate: undefined,
      endDate: undefined,
      sortBy: "date",
      sortOrder: "desc",
      payerAccountId: undefined,
      usageAccountId: undefined
    })

    // Verify transaction data is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Payer')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockDataService.getTransactions.mockRejectedValue(new Error('API Error'))

    render(<TransactionsList />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('[v0] Failed to load transactions:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})
