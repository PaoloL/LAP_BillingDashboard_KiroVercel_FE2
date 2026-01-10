// Test script for exchange rate API integration
import { dataService } from '../lib/data/data-service'

async function testExchangeRateAPI() {
  console.log('Testing Exchange Rate API Integration...')
  
  try {
    // Test 1: Get all exchange rates
    console.log('\n1. Testing getExchangeRates()...')
    const allRates = await dataService.getExchangeRates()
    console.log('✅ All rates:', allRates.length, 'configurations found')
    
    // Test 2: Get rates by payer account
    console.log('\n2. Testing getExchangeRates() with payerAccountId filter...')
    const payerRates = await dataService.getExchangeRates({ payerAccountId: '123456789012' })
    console.log('✅ Payer rates:', payerRates.length, 'configurations found')
    
    // Test 3: Create new exchange rate
    console.log('\n3. Testing createExchangeRate()...')
    const newRate = await dataService.createExchangeRate({
      payerAccountId: '123456789012',
      billingPeriod: '2025-02',
      exchangeRate: 1.095
    })
    console.log('✅ Created rate:', newRate.id)
    
    // Test 4: Update exchange rate
    console.log('\n4. Testing updateExchangeRate()...')
    const updatedRate = await dataService.updateExchangeRate('123456789012', {
      billingPeriod: '2025-02',
      exchangeRate: 1.098
    })
    console.log('✅ Updated rate:', updatedRate.exchangeRate)
    
    // Test 5: Apply exchange rate
    console.log('\n5. Testing applyExchangeRate()...')
    const applyResult = await dataService.applyExchangeRate('rate-123456789012-2025-02')
    console.log('✅ Applied rate:', applyResult.affectedTransactions, 'transactions affected')
    
    // Test 6: Delete exchange rate
    console.log('\n6. Testing deleteExchangeRate()...')
    await dataService.deleteExchangeRate('123456789012', '2025-02')
    console.log('✅ Deleted rate successfully')
    
    console.log('\n🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testExchangeRateAPI()
}

export { testExchangeRateAPI }
