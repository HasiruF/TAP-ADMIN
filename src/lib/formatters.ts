export const formatBudget = (bp: {
  pricingRange?: string
  feeRange?: string
  minPrice?: number | string
  maxPrice?: number | string
}) => {
  if (bp.feeRange) return bp.feeRange
  if (bp.pricingRange) return bp.pricingRange

  const min = bp.minPrice ?? '0'
  const max = bp.maxPrice ?? '∞'

  return `${min} - ${max}`
}
