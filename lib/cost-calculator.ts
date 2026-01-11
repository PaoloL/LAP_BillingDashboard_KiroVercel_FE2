/**
 * AWS Billing Cost Calculator
 * Implements v8 specification financial logic
 */

/**
 * Calculates Total Cost and Discounted Cost based on v8 formula
 *
 * Formula:
 * - Total Cost = usage + fee + (rebateCreditsEnabled ? credit : 0)
 * - Discounted Cost = totalCost - (totalCost * customerDiscount / 100)
 *
 * @param usage - Total usage amount
 * @param fee - Total fee amount
 * @param credit - Total credit amount (only applied if rebateCredits is enabled)
 * @param customerDiscountPercent - Customer discount percentage (0-100)
 * @param rebateCreditsEnabled - Whether rebate credits should be applied to the total cost
 * @returns Object containing totalCost (Net Cost) and discountedCost (Final Cost)
 */
export function calculateAccountCosts(
  usage: number,
  fee: number,
  credit: number,
  customerDiscountPercent: number,
  rebateCreditsEnabled: boolean,
) {
  // If rebate is OFF, Credit is ignored (0)
  const effectiveCredit = rebateCreditsEnabled ? credit : 0

  // Calculate Total Cost (Net Cost / Origin Cost)
  const totalCost = usage + fee + effectiveCredit

  // Calculate Discounted Cost (Final Cost after customer discount)
  const discountedCost = totalCost - (totalCost * customerDiscountPercent) / 100

  // Calculate savings
  const savings = totalCost - discountedCost

  return {
    totalCost,
    discountedCost,
    savings,
    creditApplied: effectiveCredit,
    creditIgnored: rebateCreditsEnabled ? 0 : credit,
  }
}

/**
 * Example usage (v8):
 *
 * const costs = calculateAccountCosts(
 *   10000,  // usage
 *   100,    // fee
 *   500,    // credit
 *   10,     // customer discount (10%)
 *   true    // rebate credits enabled
 * )
 *
 * Result:
 * {
 *   totalCost: 10600,       // 10000 + 100 + 500 (effectiveCredit)
 *   discountedCost: 9540,   // 10600 - (10600 * 0.10)
 *   savings: 1060,          // 10600 - 9540
 *   creditApplied: 500,
 *   creditIgnored: 0
 * }
 */
