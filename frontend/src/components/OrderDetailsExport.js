
import React, { useState } from 'react';

function OrderDetailsExport() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Month is 0-indexed
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // For testing, hardcode a company_id. In a real app, this would come from authentication.
    const companyId = 1;

    const handleAnnualExport = () => {
        setError('');
        setMessage('');
        fetch(`http://localhost:8000/api/orders/export-annual-orders-csv/?company_id=${companyId}&year=${selectedYear}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.detail || JSON.stringify(err)); });
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `annual_orders_${selectedYear}_company_${companyId}.csv`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setMessage('年別注文データが正常にエクスポートされました。');
            })
            .catch(error => {
                console.error('Error exporting annual orders:', error);
                setError(`年別注文データのエクスポート中にエラーが発生しました: ${error.message}`);
            });
    };

    const handleMonthlyExport = () => {
        setError('');
        setMessage('');
        fetch(`http://localhost:8000/api/orders/export-monthly-orders-csv/?company_id=${companyId}&year=${selectedYear}&month=${selectedMonth}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.detail || JSON.stringify(err)); });
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `monthly_orders_${selectedYear}_${selectedMonth}_company_${companyId}.csv`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setMessage('月別注文データが正常にエクスポートされました。');
            })
            .catch(error => {
                console.error('Error exporting monthly orders:', error);
                setError(`月別注文データのエクスポート中にエラーが発生しました: ${error.message}`);
            });
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // Last 5 years
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div>
            <h2>注文詳細・CSVエクスポート (会社向け)</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <h3>年別注文データエクスポート</h3>
            <div>
                <label>
                    年:
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {years.map(year => (
                            <option key={year} value={year}>{year}年</option>
                        ))}
                    </select>
                </label>
                <button onClick={handleAnnualExport}>年別CSVエクスポート</button>
            </div>

            <h3>月別注文データエクスポート</h3>
            <div>
                <label>
                    年:
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {years.map(year => (
                            <option key={year} value={year}>{year}年</option>
                        ))}
                    </select>
                </label>
                <label>
                    月:
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                        {months.map(month => (
                            <option key={month} value={month}>{month}月</option>
                        ))}
                    </select>
                </label>
                <button onClick={handleMonthlyExport}>月別CSVエクスポート</button>
            </div>

            {/* Placeholder for displaying lists if needed, though CSV export is the primary request */}
            {/* <h3>年別一覧:</h3>
            <p>毎月の社員毎の注文数一覧を表示</p>

            <h3>月別一覧:</h3>
            <p>毎日の社員毎の注文数一覧を表示</p> */}
        </div>
    );
}

export default OrderDetailsExport;
