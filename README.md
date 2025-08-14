# Sanity Enhanced Commerce

Advanced e-commerce schemas and components for comprehensive order and cart management with multi-license support, renewal tracking, and sophisticated pricing calculations.

## Features

- **🛒 Advanced Cart Management**: Comprehensive cart schema with license tracking and renewal support
- **📋 Enhanced Order System**: Complete order lifecycle management with renewal capabilities
- **💰 Multi-License Pricing**: Support for various license types with complex pricing structures
- **🔄 Renewal Tracking**: Built-in renewal order management and supersession tracking
- **📊 Additional Line Items**: Support for custom charges, fees, and services
- **🎫 Discount Integration**: Comprehensive discount code system with validation
- **📅 Date Management**: Effective dates, expiration tracking, and renewal scheduling
- **👤 Customer Management**: Enhanced customer data with order history
- **📈 Analytics Ready**: Schema designed for comprehensive sales reporting

## Installation

```bash
npm install sanity-enhanced-commerce
```

## Quick Start

### Import Schemas

```javascript
// sanity.config.js
import { createConfig } from 'sanity'
import { enhancedCommerceSchemas } from 'sanity-enhanced-commerce'

export default createConfig({
  // ... other config
  schema: {
    types: [
      ...enhancedCommerceSchemas,
      // ... your other schemas
    ]
  }
})
```

### Individual Schema Import

```javascript
import {
  cartSchema,
  orderSchema,
  customerSchema,
  discountCodeSchema
} from 'sanity-enhanced-commerce'
```

## Schemas Included

### 1. Enhanced Cart Schema
**Purpose**: Comprehensive shopping cart with renewal support

**Key Features:**
- Multi-license item support
- Renewal information tracking
- Additional line items
- Discount code integration
- Customer association
- Expiration management

```javascript
{
  name: 'cart',
  type: 'document',
  fields: [
    {
      name: 'items',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'typeface', type: 'reference', to: [{ type: 'typeface' }] },
          { name: 'selectedFonts', type: 'array', of: [{ type: 'reference' }] },
          { name: 'selectedCollections', type: 'array', of: [{ type: 'reference' }] },
          { name: 'selectedLicenses', type: 'array', of: [{ type: 'string' }] },
          { name: 'price', type: 'number' }
        ]
      }]
    },
    {
      name: 'renewalInfo',
      type: 'object',
      fields: [
        { name: 'effectiveDate', type: 'date' },
        { name: 'supersededDocNumber', type: 'string' }
      ]
    },
    {
      name: 'additionalLineItems',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', type: 'string' },
          { name: 'description', type: 'text' },
          { name: 'quantity', type: 'number' },
          { name: 'price', type: 'number' }
        ]
      }]
    },
    {
      name: 'discountCode',
      type: 'reference',
      to: [{ type: 'discountCode' }]
    },
    {
      name: 'customer',
      type: 'object',
      fields: [
        { name: 'firstName', type: 'string' },
        { name: 'lastName', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'company', type: 'string' },
        { name: 'address', type: 'object' }
      ]
    }
  ]
}
```

### 2. Enhanced Order Schema
**Purpose**: Complete order management with renewal capabilities

**Key Features:**
- Order type classification (regular/renewal)
- Original order references for renewals
- Comprehensive pricing breakdown
- Payment status tracking
- Fulfillment management
- Customer relationship tracking

```javascript
{
  name: 'order',
  type: 'document',
  fields: [
    {
      name: 'orderType',
      type: 'string',
      options: {
        list: [
          { title: 'Regular Order', value: 'regular' },
          { title: 'Renewal Order', value: 'renewal' }
        ]
      }
    },
    {
      name: 'originalOrderRef',
      type: 'reference',
      to: [{ type: 'order' }]
    },
    {
      name: 'renewalInfo',
      type: 'object',
      fields: [
        { name: 'effectiveDate', type: 'date' },
        { name: 'supersededDocNumber', type: 'string' }
      ]
    },
    {
      name: 'items',
      type: 'array',
      of: [{ type: 'cartItem' }]
    },
    {
      name: 'pricing',
      type: 'object',
      fields: [
        { name: 'subtotal', type: 'number' },
        { name: 'discount', type: 'number' },
        { name: 'tax', type: 'number' },
        { name: 'total', type: 'number' }
      ]
    },
    {
      name: 'status',
      type: 'string',
      options: {
        list: [
          'pending',
          'processing',
          'completed',
          'cancelled',
          'refunded'
        ]
      }
    }
  ]
}
```

### 3. Customer Schema
**Purpose**: Enhanced customer management with order history

```javascript
{
  name: 'customer',
  type: 'document',
  fields: [
    { name: 'firstName', type: 'string' },
    { name: 'lastName', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'company', type: 'string' },
    {
      name: 'addresses',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'type', type: 'string' },
          { name: 'street', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'state', type: 'string' },
          { name: 'zipCode', type: 'string' },
          { name: 'country', type: 'string' }
        ]
      }]
    },
    {
      name: 'orderHistory',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'order' }] }]
    }
  ]
}
```

### 4. Discount Code Schema
**Purpose**: Comprehensive discount management system

```javascript
{
  name: 'discountCode',
  type: 'document',
  fields: [
    { name: 'code', type: 'string' },
    { name: 'description', type: 'text' },
    {
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'Percentage', value: 'percentage' },
          { title: 'Fixed Amount', value: 'fixed' }
        ]
      }
    },
    { name: 'value', type: 'number' },
    { name: 'minimumOrder', type: 'number' },
    { name: 'maximumDiscount', type: 'number' },
    { name: 'validFrom', type: 'datetime' },
    { name: 'validUntil', type: 'datetime' },
    { name: 'usageLimit', type: 'number' },
    { name: 'usageCount', type: 'number' },
    { name: 'active', type: 'boolean' }
  ]
}
```

## Advanced Features

### Renewal Order Management

```javascript
// Example renewal order creation
const renewalOrder = {
  orderType: 'renewal',
  originalOrderRef: { _ref: 'original-order-id' },
  renewalInfo: {
    effectiveDate: '2024-01-01',
    supersededDocNumber: 'DOC-2023-001'
  },
  items: [
    // Renewed items from original order
  ],
  additionalLineItems: [
    {
      title: 'Renewal Processing Fee',
      description: 'Administrative fee for renewal processing',
      quantity: 1,
      price: 25.00
    }
  ]
}
```

### Multi-License Pricing

```javascript
// Example cart item with multiple licenses
const cartItem = {
  typeface: { _ref: 'typeface-id' },
  selectedFonts: [
    { _ref: 'font-regular' },
    { _ref: 'font-bold' }
  ],
  selectedCollections: [
    { _ref: 'collection-basic' }
  ],
  selectedLicenses: [
    'desktop',
    'web',
    'app'
  ],
  price: 299.00
}
```

### Discount Code Validation

```javascript
// Example discount code with complex rules
const discountCode = {
  code: 'RENEWAL20',
  description: '20% off renewal orders',
  type: 'percentage',
  value: 20,
  minimumOrder: 100,
  maximumDiscount: 500,
  validFrom: '2024-01-01T00:00:00Z',
  validUntil: '2024-12-31T23:59:59Z',
  usageLimit: 1000,
  usageCount: 0,
  active: true
}
```

## Integration Examples

### Cart to Order Conversion

```javascript
import { cartToOrder } from 'sanity-enhanced-commerce'

const convertCartToOrder = async (cartId, paymentInfo) => {
  const cart = await client.fetch(`*[_type == "cart" && _id == $cartId][0]`, { cartId })
  
  const order = await cartToOrder(cart, {
    paymentStatus: 'completed',
    paymentMethod: paymentInfo.method,
    transactionId: paymentInfo.transactionId
  })
  
  return client.create(order)
}
```

### Renewal Order Creation

```javascript
import { createRenewalOrder } from 'sanity-enhanced-commerce'

const createRenewal = async (originalOrderId, renewalInfo) => {
  const originalOrder = await client.fetch(
    `*[_type == "order" && _id == $orderId][0]`,
    { orderId: originalOrderId }
  )
  
  const renewalOrder = await createRenewalOrder(originalOrder, renewalInfo)
  
  return client.create(renewalOrder)
}
```

## Validation Rules

### Built-in Validations

```javascript
// Email validation
{
  name: 'email',
  type: 'string',
  validation: Rule => Rule.required().email()
}

// Price validation
{
  name: 'price',
  type: 'number',
  validation: Rule => Rule.required().min(0)
}

// Discount code validation
{
  name: 'code',
  type: 'string',
  validation: Rule => Rule.required().uppercase().min(3).max(20)
}
```

## Query Examples

### Get Customer Orders

```groq
*[_type == "order" && customer.email == $email] {
  _id,
  orderNumber,
  orderType,
  createdAt,
  status,
  pricing,
  items[] {
    typeface->,
    selectedLicenses,
    price
  }
}
```

### Get Renewal Orders

```groq
*[_type == "order" && orderType == "renewal"] {
  _id,
  orderNumber,
  originalOrderRef->,
  renewalInfo,
  createdAt,
  status
}
```

### Active Discount Codes

```groq
*[_type == "discountCode" && active == true && validFrom <= now() && validUntil >= now()]
```

## Requirements

- Sanity Studio v3+
- Sanity Client v6+
- GROQ query support

## Migration Guide

### From Basic Commerce Schema

1. **Backup existing data**
2. **Install enhanced commerce schemas**
3. **Run migration scripts** (provided)
4. **Update queries and components**
5. **Test thoroughly**

## Performance Optimization

- Indexed fields for common queries
- Optimized reference structures
- Efficient GROQ query patterns
- Minimal data duplication

## Security Considerations

- Customer data encryption
- PCI compliance ready
- Secure discount code generation
- Order validation rules

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests for improvements.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## Changelog

### v1.0.0
- Initial release
- Enhanced cart schema
- Advanced order management
- Renewal order support
- Multi-license pricing
- Discount code system
- Customer management
- Analytics-ready structure