import React, { useState, useEffect } from 'react';
import { Box, Card, Text, Button, Flex, Stack, Badge, Spinner } from '@sanity/ui';
import { useClient } from 'sanity';

interface EnhancedCommerceProps {
	onClose?: () => void;
}

interface CommerceStats {
	totalOrders: number;
	totalRevenue: number;
	pendingOrders: number;
	renewalOrders: number;
	activeCustomers: number;
	activeCarts: number;
}

interface RecentOrder {
	_id: string;
	orderNumber: string;
	orderType: 'regular' | 'renewal';
	customerEmail: string;
	total: number;
	status: string;
	createdAt: string;
}

const EnhancedCommerceComponent: React.FC<EnhancedCommerceProps> = ({ onClose }) => {
	const client = useClient();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<CommerceStats | null>(null);
	const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
	const [activeView, setActiveView] = useState<'overview' | 'orders' | 'customers' | 'analytics'>('overview');

	useEffect(() => {
		loadCommerceData();
	}, [client]);

	const loadCommerceData = async () => {
		try {
			setLoading(true);

			// Load commerce statistics
			const statsQuery = `{
				"totalOrders": count(*[_type == "order"]),
				"totalRevenue": math::sum(*[_type == "order" && status == "completed"].pricing.total),
				"pendingOrders": count(*[_type == "order" && status == "pending"]),
				"renewalOrders": count(*[_type == "order" && orderType == "renewal"]),
				"activeCustomers": count(*[_type == "customer"]),
				"activeCarts": count(*[_type == "cart"])
			}`;

			const statsData = await client.fetch(statsQuery);

			// Load recent orders
			const ordersQuery = `*[_type == "order"] | order(_createdAt desc) [0...10] {
				_id,
				orderNumber,
				orderType,
				"customerEmail": customer.email,
				"total": pricing.total,
				status,
				"createdAt": _createdAt
			}`;

			const ordersData = await client.fetch(ordersQuery);

			setStats(statsData);
			setRecentOrders(ordersData);
		} catch (error) {
			console.error('Error loading commerce data:', error);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount || 0);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed': return 'positive';
			case 'pending': return 'caution';
			case 'cancelled': return 'critical';
			case 'processing': return 'primary';
			default: return 'default';
		}
	};

	const getOrderTypeColor = (type: string) => {
		return type === 'renewal' ? 'purple' : 'default';
	};

	if (loading) {
		return (
			<Box padding={4} style={{ textAlign: 'center' }}>
				<Spinner muted />
				<Text muted size={1} style={{ marginTop: 16, display: 'block' }}>
					Loading commerce data...
				</Text>
			</Box>
		);
	}

	return (
		<Box padding={4}>
			<Flex justify="space-between" align="center" marginBottom={4}>
				<Text size={3} weight="bold">Enhanced Commerce Dashboard</Text>
				{onClose && (
					<Button mode="ghost" text="Close" onClick={onClose} />
				)}
			</Flex>

			{/* Navigation Tabs */}
			<Flex gap={2} marginBottom={4}>
				{[
					{ key: 'overview', label: 'Overview' },
					{ key: 'orders', label: 'Orders' },
					{ key: 'customers', label: 'Customers' },
					{ key: 'analytics', label: 'Analytics' }
				].map((tab) => (
					<Button
						key={tab.key}
						mode={activeView === tab.key ? 'default' : 'ghost'}
						text={tab.label}
						onClick={() => setActiveView(tab.key as any)}
						size={1}
					/>
				))}
			</Flex>

			{/* Overview Tab */}
			{activeView === 'overview' && (
				<Stack space={4}>
					{/* Statistics Cards */}
					<Box>
						<Text size={2} weight="semibold" marginBottom={3}>Commerce Statistics</Text>
						<Flex gap={3} wrap="wrap">
							{[
								{ label: 'Total Orders', value: stats?.totalOrders || 0, format: 'number' },
								{ label: 'Total Revenue', value: stats?.totalRevenue || 0, format: 'currency' },
								{ label: 'Pending Orders', value: stats?.pendingOrders || 0, format: 'number' },
								{ label: 'Renewal Orders', value: stats?.renewalOrders || 0, format: 'number' },
								{ label: 'Active Customers', value: stats?.activeCustomers || 0, format: 'number' },
								{ label: 'Active Carts', value: stats?.activeCarts || 0, format: 'number' },
							].map((stat, index) => (
								<Card key={index} padding={3} radius={2} shadow={1} style={{ minWidth: 150 }}>
									<Text size={1} muted>{stat.label}</Text>
									<Text size={3} weight="bold" style={{ display: 'block', marginTop: 4 }}>
										{stat.format === 'currency' 
											? formatCurrency(stat.value as number)
											: stat.value.toLocaleString()
										}
									</Text>
								</Card>
							))}
						</Flex>
					</Box>

					{/* Recent Orders */}
					<Box>
						<Text size={2} weight="semibold" marginBottom={3}>Recent Orders</Text>
						<Card padding={0} radius={2} shadow={1}>
							<Box padding={3} style={{ borderBottom: '1px solid var(--card-border-color)' }}>
								<Flex justify="space-between" align="center">
									<Text size={1} weight="semibold">Order</Text>
									<Text size={1} weight="semibold">Customer</Text>
									<Text size={1} weight="semibold">Type</Text>
									<Text size={1} weight="semibold">Amount</Text>
									<Text size={1} weight="semibold">Status</Text>
									<Text size={1} weight="semibold">Date</Text>
								</Flex>
							</Box>
							<Box padding={3} style={{ maxHeight: 300, overflowY: 'auto' }}>
								<Stack space={3}>
									{recentOrders.map((order) => (
										<Flex key={order._id} justify="space-between" align="center" gap={2}>
											<Text size={1} style={{ minWidth: 80, fontFamily: 'monospace' }}>
												{order.orderNumber || order._id.slice(-6)}
											</Text>
											<Text size={1} style={{ minWidth: 150 }}>
												{order.customerEmail || 'N/A'}
											</Text>
											<Badge
												tone={getOrderTypeColor(order.orderType)}
												mode="outline"
												fontSize={0}
											>
												{order.orderType}
											</Badge>
											<Text size={1} style={{ minWidth: 80 }}>
												{formatCurrency(order.total)}
											</Text>
											<Badge
												tone={getStatusColor(order.status)}
												mode="outline"
												fontSize={0}
											>
												{order.status}
											</Badge>
											<Text size={1} muted style={{ minWidth: 80 }}>
												{formatDate(order.createdAt)}
											</Text>
										</Flex>
									))}
									{recentOrders.length === 0 && (
										<Text size={1} muted style={{ textAlign: 'center', padding: 20 }}>
											No orders found
										</Text>
									)}
								</Stack>
							</Box>
						</Card>
					</Box>
				</Stack>
			)}

			{/* Orders Tab */}
			{activeView === 'orders' && (
				<Stack space={4}>
					<Text size={2} weight="semibold">Order Management</Text>
					<Card padding={4} radius={2} shadow={1}>
						<Stack space={3}>
							<Text size={1}>Order management features:</Text>
							<ul style={{ marginLeft: 20, color: 'var(--card-muted-fg-color)' }}>
								<li>View all orders with advanced filtering</li>
								<li>Track renewal orders and supersessions</li>
								<li>Manage order status and fulfillment</li>
								<li>Process refunds and cancellations</li>
								<li>Generate order reports and analytics</li>
							</ul>
							<Button
								text="Manage Orders"
								tone="primary"
								onClick={() => {
									// Navigate to order management view
									window.open('/desk/order', '_blank');
								}}
							/>
						</Stack>
					</Card>
				</Stack>
			)}

			{/* Customers Tab */}
			{activeView === 'customers' && (
				<Stack space={4}>
					<Text size={2} weight="semibold">Customer Management</Text>
					<Card padding={4} radius={2} shadow={1}>
						<Stack space={3}>
							<Text size={1}>Customer management features:</Text>
							<ul style={{ marginLeft: 20, color: 'var(--card-muted-fg-color)' }}>
								<li>View customer profiles and order history</li>
								<li>Track customer lifetime value</li>
								<li>Manage customer communications</li>
								<li>Segment customers for marketing</li>
								<li>Export customer data for analysis</li>
							</ul>
							<Button
								text="Manage Customers"
								tone="primary"
								onClick={() => {
									// Navigate to customer management view
									window.open('/desk/customer', '_blank');
								}}
							/>
						</Stack>
					</Card>
				</Stack>
			)}

			{/* Analytics Tab */}
			{activeView === 'analytics' && (
				<Stack space={4}>
					<Text size={2} weight="semibold">Commerce Analytics</Text>
					<Card padding={4} radius={2} shadow={1}>
						<Stack space={3}>
							<Text size={1}>Analytics and reporting features:</Text>
							<ul style={{ marginLeft: 20, color: 'var(--card-muted-fg-color)' }}>
								<li>Revenue tracking and trends</li>
								<li>Customer acquisition and retention metrics</li>
								<li>Product performance analysis</li>
								<li>Renewal rate optimization</li>
								<li>Discount code effectiveness</li>
								<li>Geographic sales distribution</li>
							</ul>
							<Flex gap={2}>
								<Button
									text="View Reports"
									tone="primary"
									onClick={() => {
										// Navigate to analytics view
										alert('Analytics dashboard would open here');
									}}
								/>
								<Button
									text="Export Data"
									mode="ghost"
									onClick={() => {
										// Export analytics data
										alert('Data export would start here');
									}}
								/>
							</Flex>
						</Stack>
					</Card>
				</Stack>
			)}

			{/* Quick Actions */}
			<Card padding={4} radius={2} shadow={1} marginTop={4}>
				<Text size={2} weight="semibold" marginBottom={3}>Quick Actions</Text>
				<Flex gap={2} wrap="wrap">
					<Button
						text="New Order"
						tone="primary"
						onClick={() => window.open('/desk/order', '_blank')}
					/>
					<Button
						text="Add Customer"
						tone="default"
						onClick={() => window.open('/desk/customer', '_blank')}
					/>
					<Button
						text="Create Discount Code"
						tone="default"
						onClick={() => window.open('/desk/discountCode', '_blank')}
					/>
					<Button
						text="View Carts"
						tone="default"
						onClick={() => window.open('/desk/cart', '_blank')}
					/>
					<Button
						text="Export Orders"
						mode="ghost"
						onClick={() => alert('Order export would start here')}
					/>
					<Button
						text="Refresh Data"
						mode="ghost"
						onClick={loadCommerceData}
					/>
				</Flex>
			</Card>
		</Box>
	);
};

export default EnhancedCommerceComponent;
