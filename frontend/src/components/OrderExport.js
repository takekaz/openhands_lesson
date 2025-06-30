
import React, { useState } from 'react';

function OrderExport() {
    const [exportDate, setExportDate] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleDateChange = (e) => {
        setExportDate(e.target.value);
    };

    const handleExport = () => {
        if (!exportDate) {
            setError('Please select a date for export.');
            return;
        }
        setError('');
        setMessage('Generating CSV...');

        fetch(`http://localhost:8000/api/orders/export-csv/?date=${exportDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `orders_${exportDate}.csv`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setMessage('CSV exported successfully!');
            })
            .catch(error => {
                console.error('Error exporting CSV:', error);
                setError('Error: Failed to export CSV. Please ensure the backend API is correctly configured for CSV export.');
                setMessage('');
            });
    };

    return (
        <div>
            <h2>Order Data Export (CSV)</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <div>
                <label htmlFor="exportDate">Select Date:</label>
                <input
                    type="date"
                    id="exportDate"
                    value={exportDate}
                    onChange={handleDateChange}
                />
            </div>
            <button onClick={handleExport} disabled={!exportDate}>
                Export Orders to CSV
            </button>
            <p>
                Note: This functionality requires a backend API endpoint (e.g., <code>/api/orders/export-csv/</code>)
                that generates and serves the CSV file.
            </p>
        </div>
    );
}

export default OrderExport;
