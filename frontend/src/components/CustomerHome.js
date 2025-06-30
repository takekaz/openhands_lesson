
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CustomerHome() {
    const [orderStatus, setOrderStatus] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch today's order status
        // For testing, hardcode a customer_user_id. In a real app, this would come from authentication.
        const customerUserId = 1; 
        fetch(`http://localhost:8000/api/orders/customer-order-status/?customer_user_id=${customerUserId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setOrderStatus(data);
            })
            .catch(error => {
                console.error('Error fetching order status:', error);
                setError('Error: Failed to fetch order status.');
            });

        // Fetch announcements
        fetch('http://localhost:8000/api/orders/announcements/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setAnnouncements(data);
            })
            .catch(error => {
                console.error('Error fetching announcements:', error);
                setError(prev => prev + ' Error: Failed to fetch announcements.');
            });
    }, []);

    return (
        <div>
            <h2>Customer Home</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h3>本日の注文状況:</h3>
            {orderStatus ? (
                <p>
                    {orderStatus.has_ordered ? 
                        `注文済み: ${orderStatus.total_quantity}個` : 
                        '未注文'}
                </p>
            ) : (
                <p>Loading order status...</p>
            )}

            <Link to="/customer/order">
                <button>注文ボタン</button>
            </Link>

            <h3>お知らせ:</h3>
            {announcements.length > 0 ? (
                <ul>
                    {announcements.map(announcement => (
                        <li key={announcement.id}>
                            <strong>{announcement.title}</strong>: {announcement.content}
                            <br />
                            <small>Published: {new Date(announcement.published_date).toLocaleDateString()}</small>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>現在、お知らせはありません。</p>
            )}

            <h3>履歴:</h3>
            <Link to="/customer/history">
                <button>過去の注文履歴を確認</button>
            </Link>

            <h3>アカウント設定:</h3>
            <Link to="/customer/settings">
                <button>アカウント設定</button>
            </Link>
        </div>
    );
}

export default CustomerHome;
