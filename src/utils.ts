// Enhanced Commerce utility functions
// Provides helper functions for cart/order management and discount validation

export interface CartItem {
	typeface?: { _ref: string };
	selectedFonts?: { _ref: string }[];
	selectedCollections?: { _ref: string }[];
	selectedLicenses?: string[];
	quantity: number;
	price: number;
}

export interface Cart {
	_id?: string;
	sessionId?: string;
	items: CartItem[];
	renewalInfo?: {
		isRenewal: boolean;
		effectiveDate?: string;
		supersededDocNumber?: string;
		originalOrderRef?: { _ref: string };
	};
	additionalLineItems?: AdditionalLineItem[];
	discountCode?: { _ref: string };
	customer: {
		firstName: string;
		lastName: string;
		email: string;
		company?: string;
		address?: Address;
	};
	totals: {
		subtotal: number;
		discount: number;
		tax: number;
		total: number;
	};
}

export interface AdditionalLineItem {
	title: string;
	description?: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}

export interface Address {
	street?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
}

export interface Order {
	_id?: string;
	_type?: string;
	_createdAt?: string;
	_updatedAt?: string;
	orderNumber: string;
	orderType: 'regular' | 'renewal';
	originalOrderRef?: { _ref: string };
	renewalInfo?: {
		effectiveDate?: string;
		supersededDocNumber?: string;
		renewalPeriod?: number;
	};
	customer: { _ref: string };
	items: CartItem[];
	additionalLineItems?: AdditionalLineItem[];
	pricing: {
		subtotal: number;
		discount: number;
		tax: number;
		total: number;
	};
	discountCode?: { _ref: string };
	status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
	paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
	paymentInfo?: {
		method?: string;
		transactionId?: string;
		paidAt?: string;
	};
	fulfillmentStatus: 'not_fulfilled' | 'partially_fulfilled' | 'fulfilled';
	notes?: string;
}

export interface DiscountCode {
	_id: string;
	code: string;
	description: string;
	type: 'percentage' | 'fixed';
	value: number;
	minimumOrder?: number;
	maximumDiscount?: number;
	validFrom: string;
	validUntil: string;
	usageLimit?: number;
	usageCount: number;
	customerRestrictions?: {
		specificCustomers?: { _ref: string }[];
		firstTimeCustomersOnly?: boolean;
	};
	active: boolean;
}

/**
 * Convert a cart to an order
 */
export const cartToOrder = async (
	cart: Cart,
	orderInfo: {
		paymentStatus?: string;
		paymentMethod?: string;
		transactionId?: string;
		orderNumber?: string;
		customerId?: string;
	}
): Promise<Partial<Order>> => {
	// Generate order number if not provided
	const orderNumber = orderInfo.orderNumber || `ORD-${Date.now()}`;

	// Determine if this is a renewal order
	const orderType = cart.renewalInfo?.isRenewal ? 'renewal' : 'regular';

	const order: Partial<Order> = {
		_type: 'order',
		orderNumber,
		orderType,
		customer: orderInfo.customerId ? { _ref: orderInfo.customerId } : undefined,
		items: cart.items.map((item) => ({
			...item,
			unitPrice: item.price,
			totalPrice: item.price * item.quantity,
		})),
		additionalLineItems: cart.additionalLineItems,
		pricing: {
			subtotal: cart.totals.subtotal,
			discount: cart.totals.discount,
			tax: cart.totals.tax,
			total: cart.totals.total,
		},
		discountCode: cart.discountCode,
		status: 'pending',
		paymentStatus: (orderInfo.paymentStatus as any) || 'pending',
		fulfillmentStatus: 'not_fulfilled',
	};

	// Add renewal-specific information
	if (orderType === 'renewal' && cart.renewalInfo) {
		order.originalOrderRef = cart.renewalInfo.originalOrderRef;
		order.renewalInfo = {
			effectiveDate: cart.renewalInfo.effectiveDate,
			supersededDocNumber: cart.renewalInfo.supersededDocNumber,
		};
	}

	// Add payment information if provided
	if (orderInfo.paymentMethod || orderInfo.transactionId) {
		order.paymentInfo = {
			method: orderInfo.paymentMethod,
			transactionId: orderInfo.transactionId,
			paidAt: orderInfo.paymentStatus === 'paid' ? new Date().toISOString() : undefined,
		};
	}

	return order;
};

/**
 * Create a renewal order from an existing order
 */
export const createRenewalOrder = async (
	originalOrder: Order,
	renewalInfo: {
		effectiveDate: string;
		supersededDocNumber?: string;
		renewalPeriod?: number;
		customerId?: string;
		orderNumber?: string;
	}
): Promise<Partial<Order>> => {
	const orderNumber = renewalInfo.orderNumber || `REN-${Date.now()}`;

	const renewalOrder: Partial<Order> = {
		_type: 'order',
		orderNumber,
		orderType: 'renewal',
		originalOrderRef: { _ref: originalOrder._id || '' },
		renewalInfo: {
			effectiveDate: renewalInfo.effectiveDate,
			supersededDocNumber: renewalInfo.supersededDocNumber || originalOrder.orderNumber,
			renewalPeriod: renewalInfo.renewalPeriod || 1,
		},
		customer: renewalInfo.customerId ? { _ref: renewalInfo.customerId } : originalOrder.customer,
		items: originalOrder.items.map((item) => ({
			...item,
			// Keep original pricing or apply renewal discount if needed
		})),
		additionalLineItems: originalOrder.additionalLineItems,
		pricing: {
			...originalOrder.pricing,
		},
		status: 'pending',
		paymentStatus: 'pending',
		fulfillmentStatus: 'not_fulfilled',
	};

	return renewalOrder;
};

/**
 * Validate a discount code against cart criteria
 */
export const validateDiscountCode = async (discountCode: DiscountCode, cart: Cart, customerId?: string): Promise<{ valid: boolean; error?: string }> => {
	const now = new Date();
	const validFrom = new Date(discountCode.validFrom);
	const validUntil = new Date(discountCode.validUntil);

	// Check if discount code is active
	if (!discountCode.active) {
		return { valid: false, error: 'Discount code is inactive' };
	}

	// Check date validity
	if (now < validFrom) {
		return { valid: false, error: 'Discount code is not yet valid' };
	}

	if (now > validUntil) {
		return { valid: false, error: 'Discount code has expired' };
	}

	// Check usage limit
	if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
		return { valid: false, error: 'Discount code usage limit reached' };
	}

	// Check minimum order amount
	if (discountCode.minimumOrder && cart.totals.subtotal < discountCode.minimumOrder) {
		return {
			valid: false,
			error: `Minimum order amount of $${discountCode.minimumOrder} required`,
		};
	}

	// Check customer restrictions
	if (discountCode.customerRestrictions) {
		if (discountCode.customerRestrictions.specificCustomers?.length) {
			const allowedCustomers = discountCode.customerRestrictions.specificCustomers.map((c) => c._ref);
			if (customerId && !allowedCustomers.includes(customerId)) {
				return { valid: false, error: 'Discount code not available for this customer' };
			}
		}

		// Note: firstTimeCustomersOnly would require additional customer order history check
		// This would typically be implemented with a client.fetch query
	}

	return { valid: true };
};

/**
 * Calculate order totals including discounts and tax
 */
export const calculateOrderTotals = (
	items: CartItem[],
	additionalLineItems: AdditionalLineItem[] = [],
	discountCode?: DiscountCode,
	taxRate: number = 0
): {
	subtotal: number;
	discount: number;
	tax: number;
	total: number;
} => {
	// Calculate subtotal from cart items
	const itemsSubtotal = items.reduce((sum, item) => {
		return sum + item.price * item.quantity;
	}, 0);

	// Calculate subtotal from additional line items
	const additionalSubtotal = additionalLineItems.reduce((sum, item) => {
		return sum + item.totalPrice;
	}, 0);

	const subtotal = itemsSubtotal + additionalSubtotal;

	// Calculate discount
	let discount = 0;
	if (discountCode) {
		if (discountCode.type === 'percentage') {
			discount = subtotal * (discountCode.value / 100);
			// Apply maximum discount limit if specified
			if (discountCode.maximumDiscount && discount > discountCode.maximumDiscount) {
				discount = discountCode.maximumDiscount;
			}
		} else if (discountCode.type === 'fixed') {
			discount = Math.min(discountCode.value, subtotal);
		}
	}

	// Calculate tax on discounted amount
	const taxableAmount = subtotal - discount;
	const tax = taxableAmount * taxRate;

	// Calculate total
	const total = subtotal - discount + tax;

	return {
		subtotal,
		discount,
		tax,
		total: Math.max(0, total), // Ensure total is never negative
	};
};

/**
 * Generate a unique order number
 */
export const generateOrderNumber = (prefix: string = 'ORD'): string => {
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 1000)
		.toString()
		.padStart(3, '0');
	return `${prefix}-${timestamp}-${random}`;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
	}).format(amount);
};

/**
 * Calculate tax amount for a given address
 */
export const calculateTax = (amount: number, address?: Address): number => {
	// This is a simplified tax calculation
	// In a real implementation, you would use a tax service or lookup table
	const taxRates: Record<string, number> = {
		CA: 0.0875, // California
		NY: 0.08, // New York
		TX: 0.0625, // Texas
		FL: 0.06, // Florida
		// Add more states/regions as needed
	};

	if (!address?.state) {
		return 0;
	}

	const taxRate = taxRates[address.state] || 0;
	return amount * taxRate;
};

/**
 * Check if an order is eligible for renewal
 */
export const isOrderRenewable = (order: Order): boolean => {
	// Check if order is completed and fulfilled
	if (order.status !== 'completed' || order.fulfillmentStatus !== 'fulfilled') {
		return false;
	}

	// Check if order type allows renewal (regular orders only, not existing renewals)
	if (order.orderType === 'renewal') {
		return false;
	}

	// Check if payment is completed
	if (order.paymentStatus !== 'paid') {
		return false;
	}

	return true;
};

/**
 * Get renewal eligibility information
 */
export const getRenewalInfo = (
	order: Order
): {
	eligible: boolean;
	reason?: string;
	recommendedDate?: string;
} => {
	if (!isOrderRenewable(order)) {
		let reason = 'Order not eligible for renewal';

		if (order.status !== 'completed') {
			reason = 'Order must be completed';
		} else if (order.fulfillmentStatus !== 'fulfilled') {
			reason = 'Order must be fulfilled';
		} else if (order.orderType === 'renewal') {
			reason = 'Renewal orders cannot be renewed';
		} else if (order.paymentStatus !== 'paid') {
			reason = 'Payment must be completed';
		}

		return { eligible: false, reason };
	}

	// Calculate recommended renewal date (1 year from order date)
	const orderDate = new Date(order._createdAt || Date.now());
	const recommendedDate = new Date(orderDate);
	recommendedDate.setFullYear(recommendedDate.getFullYear() + 1);

	return {
		eligible: true,
		recommendedDate: recommendedDate.toISOString().split('T')[0], // YYYY-MM-DD format
	};
};
