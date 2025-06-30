

import React, { useState, useEffect } from 'react';

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/orders/orders/?format=json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setOrders(data);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                setError('Error: Failed to fetch orders');
            });
    }, []);

    return (
        <div>
            <h2>All Orders</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {orders.length > 0 ? (
                orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                        <h3>Order ID: {order.id}</h3>
                        <p><strong>Customer:</strong> {order.customer_user_username} ({order.customer_company_name})</p>
                        <p><strong>Date:</strong> {order.order_date}</p>
                        <p><strong>Total Amount:</strong> ¥{order.total_amount}</p>
                        <p><strong>Confirmed:</strong> {order.is_confirmed ? 'Yes' : 'No'}</p>
                        <p><strong>Ordered At:</strong> {new Date(order.ordered_at).toLocaleString()}</p>
                        <h4>Items:</h4>
                        {order.items && order.items.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Menu Item</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.menu_item_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>¥{item.unit_price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No items for this order.</p>
                        )}
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
}

export default OrderList;

