// Enhanced Commerce Schemas for Sanity
// Comprehensive e-commerce functionality with renewal support

export const cartSchema = {
	name: 'cart',
	title: 'Shopping Cart',
	type: 'document',
	fields: [
		{
			name: 'sessionId',
			title: 'Session ID',
			type: 'string',
			description: 'Unique session identifier for the cart',
		},
		{
			name: 'items',
			title: 'Cart Items',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'cartItem',
					title: 'Cart Item',
					fields: [
						{
							name: 'typeface',
							title: 'Typeface',
							type: 'reference',
							to: [{ type: 'typeface' }],
						},
						{
							name: 'selectedFonts',
							title: 'Selected Fonts',
							type: 'array',
							of: [{ type: 'reference', to: [{ type: 'font' }] }],
						},
						{
							name: 'selectedCollections',
							title: 'Selected Collections',
							type: 'array',
							of: [{ type: 'reference', to: [{ type: 'collection' }] }],
						},
						{
							name: 'selectedLicenses',
							title: 'Selected Licenses',
							type: 'array',
							of: [{ type: 'string' }],
							options: {
								list: [
									{ title: 'Desktop License', value: 'desktop' },
									{ title: 'Web License', value: 'web' },
									{ title: 'App License', value: 'app' },
									{ title: 'ePub License', value: 'epub' },
									{ title: 'Server License', value: 'server' },
								],
							},
						},
						{
							name: 'quantity',
							title: 'Quantity',
							type: 'number',
							validation: (Rule) => Rule.required().min(1),
						},
						{
							name: 'price',
							title: 'Price',
							type: 'number',
							validation: (Rule) => Rule.required().min(0),
						},
					],
				},
			],
		},
		{
			name: 'renewalInfo',
			title: 'Renewal Information',
			type: 'object',
			fields: [
				{
					name: 'isRenewal',
					title: 'Is Renewal',
					type: 'boolean',
					initialValue: false,
				},
				{
					name: 'effectiveDate',
					title: 'Effective Date',
					type: 'date',
					description: 'Date when the renewal becomes effective',
				},
				{
					name: 'supersededDocNumber',
					title: 'Superseded Document Number',
					type: 'string',
					description: 'Original document number being renewed',
				},
				{
					name: 'originalOrderRef',
					title: 'Original Order Reference',
					type: 'reference',
					to: [{ type: 'order' }],
				},
			],
		},
		{
			name: 'additionalLineItems',
			title: 'Additional Line Items',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'additionalLineItem',
					title: 'Additional Line Item',
					fields: [
						{
							name: 'title',
							title: 'Title',
							type: 'string',
							validation: (Rule) => Rule.required(),
						},
						{
							name: 'description',
							title: 'Description',
							type: 'text',
						},
						{
							name: 'quantity',
							title: 'Quantity',
							type: 'number',
							validation: (Rule) => Rule.required().min(1),
							initialValue: 1,
						},
						{
							name: 'unitPrice',
							title: 'Unit Price',
							type: 'number',
							validation: (Rule) => Rule.required().min(0),
						},
						{
							name: 'totalPrice',
							title: 'Total Price',
							type: 'number',
							validation: (Rule) => Rule.required().min(0),
						},
					],
				},
			],
		},
		{
			name: 'discountCode',
			title: 'Discount Code',
			type: 'reference',
			to: [{ type: 'discountCode' }],
		},
		{
			name: 'customer',
			title: 'Customer Information',
			type: 'object',
			fields: [
				{
					name: 'firstName',
					title: 'First Name',
					type: 'string',
					validation: (Rule) => Rule.required(),
				},
				{
					name: 'lastName',
					title: 'Last Name',
					type: 'string',
					validation: (Rule) => Rule.required(),
				},
				{
					name: 'email',
					title: 'Email',
					type: 'string',
					validation: (Rule) => Rule.required().email(),
				},
				{
					name: 'company',
					title: 'Company',
					type: 'string',
				},
				{
					name: 'address',
					title: 'Address',
					type: 'object',
					fields: [
						{
							name: 'street',
							title: 'Street Address',
							type: 'string',
						},
						{
							name: 'city',
							title: 'City',
							type: 'string',
						},
						{
							name: 'state',
							title: 'State/Province',
							type: 'string',
						},
						{
							name: 'zipCode',
							title: 'ZIP/Postal Code',
							type: 'string',
						},
						{
							name: 'country',
							title: 'Country',
							type: 'string',
						},
					],
				},
			],
		},
		{
			name: 'totals',
			title: 'Cart Totals',
			type: 'object',
			fields: [
				{
					name: 'subtotal',
					title: 'Subtotal',
					type: 'number',
					validation: (Rule) => Rule.min(0),
				},
				{
					name: 'discount',
					title: 'Discount Amount',
					type: 'number',
					validation: (Rule) => Rule.min(0),
				},
				{
					name: 'tax',
					title: 'Tax Amount',
					type: 'number',
					validation: (Rule) => Rule.min(0),
				},
				{
					name: 'total',
					title: 'Total Amount',
					type: 'number',
					validation: (Rule) => Rule.required().min(0),
				},
			],
		},
		{
			name: 'expiresAt',
			title: 'Expires At',
			type: 'datetime',
			description: 'When this cart expires',
		},
		{
			name: 'status',
			title: 'Status',
			type: 'string',
			options: {
				list: [
					{ title: 'Active', value: 'active' },
					{ title: 'Abandoned', value: 'abandoned' },
					{ title: 'Converted', value: 'converted' },
					{ title: 'Expired', value: 'expired' },
				],
			},
			initialValue: 'active',
		},
	],
	preview: {
		select: {
			email: 'customer.email',
			total: 'totals.total',
			status: 'status',
		},
		prepare({ email, total, status }) {
			return {
				title: email || 'Anonymous Cart',
				subtitle: `$${total?.toFixed(2) || '0.00'} - ${status}`,
			};
		},
	},
};

export const orderSchema = {
	name: 'order',
	title: 'Order',
	type: 'document',
	fields: [
		{
			name: 'orderNumber',
			title: 'Order Number',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'orderType',
			title: 'Order Type',
			type: 'string',
			options: {
				list: [
					{ title: 'Regular Order', value: 'regular' },
					{ title: 'Renewal Order', value: 'renewal' },
				],
			},
			initialValue: 'regular',
		},
		{
			name: 'originalOrderRef',
			title: 'Original Order Reference',
			type: 'reference',
			to: [{ type: 'order' }],
			description: 'Reference to original order (for renewals)',
		},
		{
			name: 'renewalInfo',
			title: 'Renewal Information',
			type: 'object',
			fields: [
				{
					name: 'effectiveDate',
					title: 'Effective Date',
					type: 'date',
				},
				{
					name: 'supersededDocNumber',
					title: 'Superseded Document Number',
					type: 'string',
				},
				{
					name: 'renewalPeriod',
					title: 'Renewal Period (years)',
					type: 'number',
					validation: (Rule) => Rule.min(1),
				},
			],
		},
		{
			name: 'customer',
			title: 'Customer',
			type: 'reference',
			to: [{ type: 'customer' }],
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'items',
			title: 'Order Items',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'orderItem',
					title: 'Order Item',
					fields: [
						{
							name: 'typeface',
							title: 'Typeface',
							type: 'reference',
							to: [{ type: 'typeface' }],
						},
						{
							name: 'selectedFonts',
							title: 'Selected Fonts',
							type: 'array',
							of: [{ type: 'reference', to: [{ type: 'font' }] }],
						},
						{
							name: 'selectedCollections',
							title: 'Selected Collections',
							type: 'array',
							of: [{ type: 'reference', to: [{ type: 'collection' }] }],
						},
						{
							name: 'selectedLicenses',
							title: 'Selected Licenses',
							type: 'array',
							of: [{ type: 'string' }],
						},
						{
							name: 'quantity',
							title: 'Quantity',
							type: 'number',
							validation: (Rule) => Rule.required().min(1),
						},
						{
							name: 'unitPrice',
							title: 'Unit Price',
							type: 'number',
							validation: (Rule) => Rule.required().min(0),
						},
						{
							name: 'totalPrice',
							title: 'Total Price',
							type: 'number',
							validation: (Rule) => Rule.required().min(0),
						},
					],
				},
			],
		},
		{
			name: 'additionalLineItems',
			title: 'Additional Line Items',
			type: 'array',
			of: [{ type: 'additionalLineItem' }],
		},
		{
			name: 'pricing',
			title: 'Order Pricing',
			type: 'object',
			fields: [
				{
					name: 'subtotal',
					title: 'Subtotal',
					type: 'number',
					validation: (Rule) => Rule.required().min(0),
				},
				{
					name: 'discount',
					title: 'Discount Amount',
					type: 'number',
					validation: (Rule) => Rule.min(0),
					initialValue: 0,
				},
				{
					name: 'tax',
					title: 'Tax Amount',
					type: 'number',
					validation: (Rule) => Rule.min(0),
					initialValue: 0,
				},
				{
					name: 'total',
					title: 'Total Amount',
					type: 'number',
					validation: (Rule) => Rule.required().min(0),
				},
			],
		},
		{
			name: 'discountCode',
			title: 'Applied Discount Code',
			type: 'reference',
			to: [{ type: 'discountCode' }],
		},
		{
			name: 'status',
			title: 'Order Status',
			type: 'string',
			options: {
				list: [
					{ title: 'Pending', value: 'pending' },
					{ title: 'Processing', value: 'processing' },
					{ title: 'Completed', value: 'completed' },
					{ title: 'Cancelled', value: 'cancelled' },
					{ title: 'Refunded', value: 'refunded' },
				],
			},
			initialValue: 'pending',
		},
		{
			name: 'paymentStatus',
			title: 'Payment Status',
			type: 'string',
			options: {
				list: [
					{ title: 'Pending', value: 'pending' },
					{ title: 'Paid', value: 'paid' },
					{ title: 'Failed', value: 'failed' },
					{ title: 'Refunded', value: 'refunded' },
					{ title: 'Partially Refunded', value: 'partially_refunded' },
				],
			},
			initialValue: 'pending',
		},
		{
			name: 'paymentInfo',
			title: 'Payment Information',
			type: 'object',
			fields: [
				{
					name: 'method',
					title: 'Payment Method',
					type: 'string',
				},
				{
					name: 'transactionId',
					title: 'Transaction ID',
					type: 'string',
				},
				{
					name: 'paidAt',
					title: 'Paid At',
					type: 'datetime',
				},
			],
		},
		{
			name: 'fulfillmentStatus',
			title: 'Fulfillment Status',
			type: 'string',
			options: {
				list: [
					{ title: 'Not Fulfilled', value: 'not_fulfilled' },
					{ title: 'Partially Fulfilled', value: 'partially_fulfilled' },
					{ title: 'Fulfilled', value: 'fulfilled' },
				],
			},
			initialValue: 'not_fulfilled',
		},
		{
			name: 'notes',
			title: 'Order Notes',
			type: 'text',
			description: 'Internal notes about this order',
		},
	],
	orderings: [
		{
			title: 'Order Number',
			name: 'orderNumber',
			by: [{ field: 'orderNumber', direction: 'desc' }],
		},
		{
			title: 'Created Date',
			name: 'createdAt',
			by: [{ field: '_createdAt', direction: 'desc' }],
		},
	],
	preview: {
		select: {
			orderNumber: 'orderNumber',
			customerName: 'customer.firstName',
			total: 'pricing.total',
			status: 'status',
		},
		prepare({ orderNumber, customerName, total, status }) {
			return {
				title: orderNumber,
				subtitle: `${customerName || 'Unknown'} - $${total?.toFixed(2) || '0.00'} (${status})`,
			};
		},
	},
};

export const customerSchema = {
	name: 'customer',
	title: 'Customer',
	type: 'document',
	fields: [
		{
			name: 'firstName',
			title: 'First Name',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'lastName',
			title: 'Last Name',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'email',
			title: 'Email',
			type: 'string',
			validation: (Rule) => Rule.required().email(),
		},
		{
			name: 'company',
			title: 'Company',
			type: 'string',
		},
		{
			name: 'phone',
			title: 'Phone Number',
			type: 'string',
		},
		{
			name: 'addresses',
			title: 'Addresses',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'address',
					title: 'Address',
					fields: [
						{
							name: 'type',
							title: 'Address Type',
							type: 'string',
							options: {
								list: [
									{ title: 'Billing', value: 'billing' },
									{ title: 'Shipping', value: 'shipping' },
									{ title: 'Both', value: 'both' },
								],
							},
						},
						{
							name: 'street',
							title: 'Street Address',
							type: 'string',
						},
						{
							name: 'city',
							title: 'City',
							type: 'string',
						},
						{
							name: 'state',
							title: 'State/Province',
							type: 'string',
						},
						{
							name: 'zipCode',
							title: 'ZIP/Postal Code',
							type: 'string',
						},
						{
							name: 'country',
							title: 'Country',
							type: 'string',
						},
					],
				},
			],
		},
		{
			name: 'customerNotes',
			title: 'Customer Notes',
			type: 'text',
		},
		{
			name: 'tags',
			title: 'Customer Tags',
			type: 'array',
			of: [{ type: 'string' }],
			options: {
				list: [
					{ title: 'VIP', value: 'vip' },
					{ title: 'Wholesale', value: 'wholesale' },
					{ title: 'Frequent Buyer', value: 'frequent_buyer' },
					{ title: 'Designer', value: 'designer' },
					{ title: 'Agency', value: 'agency' },
				],
			},
		},
	],
	preview: {
		select: {
			firstName: 'firstName',
			lastName: 'lastName',
			email: 'email',
			company: 'company',
		},
		prepare({ firstName, lastName, email, company }) {
			return {
				title: `${firstName || ''} ${lastName || ''}`.trim(),
				subtitle: company ? `${email} (${company})` : email,
			};
		},
	},
};

export const discountCodeSchema = {
	name: 'discountCode',
	title: 'Discount Code',
	type: 'document',
	fields: [
		{
			name: 'code',
			title: 'Discount Code',
			type: 'string',
			validation: (Rule) => Rule.required().uppercase().min(3).max(20),
		},
		{
			name: 'description',
			title: 'Description',
			type: 'text',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'type',
			title: 'Discount Type',
			type: 'string',
			options: {
				list: [
					{ title: 'Percentage', value: 'percentage' },
					{ title: 'Fixed Amount', value: 'fixed' },
				],
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'value',
			title: 'Discount Value',
			type: 'number',
			validation: (Rule) => Rule.required().min(0),
			description: 'Percentage (0-100) or fixed amount',
		},
		{
			name: 'minimumOrder',
			title: 'Minimum Order Amount',
			type: 'number',
			validation: (Rule) => Rule.min(0),
			initialValue: 0,
		},
		{
			name: 'maximumDiscount',
			title: 'Maximum Discount Amount',
			type: 'number',
			validation: (Rule) => Rule.min(0),
			description: 'Maximum discount amount (for percentage discounts)',
		},
		{
			name: 'validFrom',
			title: 'Valid From',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'validUntil',
			title: 'Valid Until',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'usageLimit',
			title: 'Usage Limit',
			type: 'number',
			validation: (Rule) => Rule.min(1),
			description: 'Maximum number of times this code can be used',
		},
		{
			name: 'usageCount',
			title: 'Usage Count',
			type: 'number',
			initialValue: 0,
			readOnly: true,
		},
		{
			name: 'customerRestrictions',
			title: 'Customer Restrictions',
			type: 'object',
			fields: [
				{
					name: 'specificCustomers',
					title: 'Specific Customers Only',
					type: 'array',
					of: [{ type: 'reference', to: [{ type: 'customer' }] }],
				},
				{
					name: 'firstTimeCustomersOnly',
					title: 'First-time Customers Only',
					type: 'boolean',
					initialValue: false,
				},
			],
		},
		{
			name: 'active',
			title: 'Active',
			type: 'boolean',
			initialValue: true,
		},
	],
	preview: {
		select: {
			code: 'code',
			type: 'type',
			value: 'value',
			active: 'active',
		},
		prepare({ code, type, value, active }) {
			const discountDisplay = type === 'percentage' ? `${value}%` : `$${value}`;
			return {
				title: code,
				subtitle: `${discountDisplay} off ${active ? '(Active)' : '(Inactive)'}`,
			};
		},
	},
};

// Collection of all enhanced commerce schemas
export const enhancedCommerceSchemas = [cartSchema, orderSchema, customerSchema, discountCodeSchema];
