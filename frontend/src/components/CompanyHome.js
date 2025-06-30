
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CompanyHome() {
    const [companyOrderStatus, setCompanyOrderStatus] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch today's company order status
        // For testing, hardcode a company_id. In a real app, this would come from authentication.
        const companyId = 1; 
        fetch(`http://localhost:8000/api/orders/company-order-status/?company_id=${companyId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setCompanyOrderStatus(data);
            })
            .catch(error => {
                console.error('Error fetching company order status:', error);
                setError('Error: Failed to fetch company order status');
            });
    }, []);

    return (
        <div>
            <h2>Company Home</h2>
            <h3>本日の注文状況:</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {companyOrderStatus ? (
                <p>会社内の注文済み数: {companyOrderStatus.total_company_orders}個</p>
            ) : (
                <p>Loading company order status...</p>
            )}
            
            {/* Placeholder for other company-specific features */}
            <h3>代理注文:</h3>
            <p>社員を選択し注文を代理で入力する機能がここに表示されます。</p>
            <Link to="/company/proxy-order">
                <button>代理注文画面へ</button>
            </Link>

            <h3>社員管理:</h3>
            <p>社員のアカウント登録・削除・編集ができます。</p>
            <Link to="/company/employees">
                <button>社員管理画面へ</button>
            </Link>

            <h3>注文詳細・CSVエクスポート:</h3>
            <p>年別・月別の社員毎の注文数一覧を表示、CSVエクスポートができます。</p>
            <Link to="/company/order-details-export">
                <button>注文詳細・エクスポート画面へ</button>
            </Link>
        </div>
    );
}

export default CompanyHome;
