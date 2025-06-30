


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import OrderList from './components/OrderList';
import MenuManagement from './components/MenuManagement';
import SystemSettings from './components/SystemSettings';
import CustomerManagement from './components/CustomerManagement';
import Announcements from './components/Announcements';
import OrderExport from './components/OrderExport'; // Import the new component
import CustomerHome from './components/CustomerHome'; // Import CustomerHome
import CompanyHome from './components/CompanyHome'; // Import CompanyHome
import OrderScreen from './components/OrderScreen'; // Import OrderScreen
import OrderHistory from './components/OrderHistory'; // Import OrderHistory
import AccountSettings from './components/AccountSettings'; // Import AccountSettings
import ProxyOrderScreen from './components/ProxyOrderScreen'; // Import ProxyOrderScreen
import EmployeeManagement from './components/EmployeeManagement'; // Import EmployeeManagement
import OrderDetailsExport from './components/OrderDetailsExport'; // Import OrderDetailsExport

function DailySummary() {
  const [dailySummary, setDailySummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/orders/daily-summary/')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setDailySummary(data);
      })
      .catch(error => {
        console.error('Error fetching daily summary:', error);
        setError('Error: Failed to fetch daily summary');
      });
  }, []);

  return (
    <div>
      <h2>Daily Summary for {dailySummary ? dailySummary.date : '...'}</h2>
      {dailySummary ? (
        <div>
          <p>Total Sales: ¥{dailySummary.total_sales}</p>
          <p>Order Cutoff Time: {dailySummary.order_cutoff_time}</p>
          <h3>Orders by Company:</h3>
          <table>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Total Orders</th>
              </tr>
            </thead>
            <tbody>
              {dailySummary.company_orders.map((company, index) => (
                <tr key={index}>
                  <td>{company.name}</td>
                  <td>{company.total_orders || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: 'red' }}>{error || 'Loading daily summary...'}</p>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Bento Order System - Vendor Dashboard</h1>
          <nav>
            <ul>
              <li>
                <Link to="/">Daily Summary</Link>
              </li>
              <li>
                <Link to="/orders">All Orders</Link>
              </li>
              <li>
                <Link to="/menus">Menu Management</Link>
              </li>
              <li>
                <Link to="/settings">System Settings</Link>
              </li>
              <li>
                <Link to="/customers">Customer Management</Link>
              </li>
              <li>
                <Link to="/announcements">Announcements</Link>
              </li>
              <li>
                <Link to="/export-orders">Export Orders</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<DailySummary />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/menus" element={<MenuManagement />} />
            <Route path="/settings" element={<SystemSettings />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/export-orders" element={<OrderExport />} />
            <Route path="/customer/home" element={<CustomerHome />} /> {/* New route for customer home */}
            <Route path="/company/home" element={<CompanyHome />} /> {/* New route for company home */}
            <Route path="/customer/order" element={<OrderScreen />} /> {/* New route for customer order screen */}
            <Route path="/customer/history" element={<OrderHistory />} /> {/* New route for customer order history */}
            <Route path="/customer/settings" element={<AccountSettings />} /> {/* New route for customer account settings */}
            <Route path="/company/proxy-order" element={<ProxyOrderScreen />} /> {/* New route for company proxy order screen */}

            <Route path="/company/employees" element={<EmployeeManagement />} /> {/* New route for employee management */}
            <Route path="/company/order-details-export" element={<OrderDetailsExport />} /> {/* New route for company order details export */}

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;




