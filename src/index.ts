// Enhanced Commerce schemas and utilities for Sanity
// Provides comprehensive e-commerce functionality with renewal support

export { default as EnhancedCommerceComponent } from './EnhancedCommerceComponent';
export * from './schemas';
export * from './utils';

// Main exports for easy integration
export { cartSchema, orderSchema, customerSchema, discountCodeSchema, enhancedCommerceSchemas } from './schemas';

export { cartToOrder, createRenewalOrder, validateDiscountCode, calculateOrderTotals } from './utils';
