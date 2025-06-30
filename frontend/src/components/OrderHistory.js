
import React, { useState, useEffect } from 'react';

function OrderHistory() {
    const [orderHistory, setOrderHistory] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For testing, hardcode a customer_user_id. In a real app, this would come from authentication.
        const customerUserId = 1; 

        fetch(`http://localhost:8000/api/orders/orders/?customer_user_id=${customerUserId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Assuming the API returns a list of orders, each with items
                setOrderHistory(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching order history:', error);
                setError('Error: Failed to fetch order history.');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading order history...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div>
            <h2>過去の注文履歴</h2>
            {orderHistory.length > 0 ? (
                orderHistory.map(order => (
                    <div key={order.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                        <h3>注文日: {new Date(order.order_date).toLocaleDateString()}</h3>
                        <p>合計金額: ¥{order.total_amount}</p>
                        <p>注文確定: {order.is_confirmed ? 'はい' : 'いいえ'}</p>
                        <p>注文時刻: {new Date(order.ordered_at).toLocaleTimeString()}</p>
                        <h4>注文内容:</h4>
                        <ul>
                            {order.items.map(item => (
                                <li key={item.id}>
                                    {item.menu_item_name} - 数量: {item.quantity} - 単価: ¥{item.menu_item_price}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>注文履歴はありません。</p>
            )}
        </div>
    );
}

export default OrderHistory;
