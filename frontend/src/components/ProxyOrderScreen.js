
import React, { useState, useEffect } from 'react';

function ProxyOrderScreen() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [orderCutoffTime, setOrderCutoffTime] = useState('');
    const [isOrderTimePassed, setIsOrderTimePassed] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    // For testing, hardcode a company_id. In a real app, this would come from authentication.
    const companyId = 1;

    useEffect(() => {
        // Fetch employees for the company
        fetch(`http://localhost:8000/api/orders/customer-users/?company_id=${companyId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setEmployees(data);
                if (data.length > 0) {
                    setSelectedEmployee(data[0].id); // Select the first employee by default
                }
            })
            .catch(error => {
                console.error('Error fetching employees:', error);
                setError('Error: Failed to fetch employee list.');
            });

        // Fetch menu items
        fetch('http://localhost:8000/api/orders/menus/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setMenuItems(data);
                const initialQuantities = {};
                data.forEach(item => {
                    initialQuantities[item.id] = 0;
                });
                setQuantities(initialQuantities);
            })
            .catch(error => {
                console.error('Error fetching menu items:', error);
                setError(prev => prev + ' Error: Failed to fetch menu items.');
            });

        // Fetch order cutoff time
        fetch('http://localhost:8000/api/orders/system-settings/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const cutoffSetting = data.find(setting => setting.setting_name === 'order_cutoff_time');
                if (cutoffSetting) {
                    setOrderCutoffTime(cutoffSetting.setting_value);
                    const now = new Date();
                    const [hours, minutes] = cutoffSetting.setting_value.split(':').map(Number);
                    const cutoffDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDay(), hours, minutes, 0);
                    if (now > cutoffDateTime) {
                        setIsOrderTimePassed(true);
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching system settings:', error);
                setError(prev => prev + ' Error: Failed to fetch order cutoff time.');
            });
    }, [companyId]);

    useEffect(() => {
        let currentTotal = 0;
        menuItems.forEach(item => {
            currentTotal += (quantities[item.id] || 0) * item.price;
        });
        setTotalAmount(currentTotal);
    }, [quantities, menuItems]);

    const handleQuantityChange = (menuId, delta) => {
        setQuantities(prevQuantities => {
            const newQuantity = Math.max(0, (prevQuantities[menuId] || 0) + delta);
            return {
                ...prevQuantities,
                [menuId]: newQuantity
            };
        });
    };

    const handleConfirmOrder = () => {
        if (isOrderTimePassed) {
            setError('注文締切時間を過ぎているため、注文できません。');
            return;
        }
        if (!selectedEmployee) {
            setError('注文する社員を選択してください。');
            return;
        }

        const selectedItems = Object.keys(quantities)
            .filter(menuId => quantities[menuId] > 0)
            .map(menuId => ({
                menu_item: parseInt(menuId),
                quantity: quantities[menuId]
            }));

        if (selectedItems.length === 0) {
            setError('注文するメニューを選択してください。');
            return;
        }
        setError('');
        setShowConfirmPopup(true);
    };

    const handleSubmitOrder = () => {
        setShowConfirmPopup(false);

        const selectedItems = Object.keys(quantities)
            .filter(menuId => quantities[menuId] > 0)
            .map(menuId => ({
                menu_item: parseInt(menuId),
                quantity: quantities[menuId]
            }));

        const orderData = {
            customer_user: parseInt(selectedEmployee),
            order_date: new Date().toISOString().split('T')[0],
            total_amount: totalAmount,
            is_confirmed: true,
            items: selectedItems
        };

        fetch('http://localhost:8000/api/orders/orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || '注文の送信に失敗しました。'); });
            }
            return response.json();
        })
        .then(data => {
            setMessage('代理注文が正常に送信されました！');
            setError('');
            setQuantities({});
            setTotalAmount(0);
            console.log('Proxy order submitted:', data);
        })
        .catch(error => {
            console.error('Error submitting proxy order:', error);
            setError(`代理注文の送信中にエラーが発生しました: ${error.message}`);
            setMessage('');
        });
    };

    return (
        <div>
            <h2>代理注文画面</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {orderCutoffTime && (
                <p style={{ color: isOrderTimePassed ? 'red' : 'inherit' }}>
                    本日の注文締切は {orderCutoffTime} です。
                    {isOrderTimePassed && ' (締切時間を過ぎています)'}
                </p>
            )}

            <h3>社員選択:</h3>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} disabled={isOrderTimePassed}>
                {employees.length > 0 ? (
                    employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                            {employee.user.username} ({employee.user.email})
                        </option>
                    ))
                ) : (
                    <option value="">社員がいません</option>
                )}
            </select>

            <h3>メニュー選択:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {menuItems.map(menu => (
                    <div key={menu.id} style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
                        <h4>{menu.name}</h4>
                        {menu.image && <img src={menu.image} alt={menu.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
                        <p>価格: ¥{menu.price}</p>
                        <p>説明: {menu.description}</p>
                        <p>アレルギー情報: {menu.allergy_info || 'なし'}</p>
                        <div>
                            <button onClick={() => handleQuantityChange(menu.id, -1)} disabled={quantities[menu.id] <= 0 || isOrderTimePassed}>-</button>
                            <input
                                type="number"
                                value={quantities[menu.id] || 0}
                                onChange={(e) => setQuantities({ ...quantities, [menu.id]: parseInt(e.target.value) || 0 })}
                                min="0"
                                style={{ width: '50px', textAlign: 'center' }}
                                disabled={isOrderTimePassed}
                            />
                            <button onClick={() => handleQuantityChange(menu.id, 1)} disabled={isOrderTimePassed}>+</button>
                        </div>
                    </div>
                ))}
            </div>

            <h3>合計金額: ¥{totalAmount}</h3>

            <button onClick={handleConfirmOrder} disabled={isOrderTimePassed || totalAmount === 0 || !selectedEmployee}>
                注文確定
            </button>
            <p>
                確定後、注文内容の変更やキャンセルは締切時間まで可能です。
            </p>

            {showConfirmPopup && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    border: '1px solid #ccc',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    color: 'black'
                }}>
                    <h3>注文内容の確認</h3>
                    <p>選択社員: {employees.find(emp => emp.id === parseInt(selectedEmployee))?.user.username}</p>
                    <p>以下の内容で注文を確定しますか？</p>
                    <ul>
                        {Object.keys(quantities)
                            .filter(menuId => quantities[menuId] > 0)
                            .map(menuId => {
                                const item = menuItems.find(m => m.id === parseInt(menuId));
                                return item ? (
                                    <li key={item.id}>
                                        {item.name}: {quantities[menuId]}個 (¥{item.price * quantities[menuId]})
                                    </li>
                                ) : null;
                            })}
                    </ul>
                    <p>合計金額: ¥{totalAmount}</p>
                    <button onClick={handleSubmitOrder}>はい、確定します</button>
                    <button onClick={() => setShowConfirmPopup(false)}>キャンセル</button>
                </div>
            )}
        </div>
    );
}

export default ProxyOrderScreen;
