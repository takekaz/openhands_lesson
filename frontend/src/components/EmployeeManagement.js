
import React, { useState, useEffect } from 'react';

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({ username: '', email: '', password: '' });
    const [editingEmployee, setEditingEmployee] = useState(null); // Stores the employee being edited
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // For testing, hardcode a company_id. In a real app, this would come from authentication.
    const companyId = 1;

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = () => {
        fetch(`http://localhost:8000/api/orders/customer-users/?company_id=${companyId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setEmployees(data);
                setError('');
            })
            .catch(error => {
                console.error('Error fetching employees:', error);
                setError('Error: Failed to fetch employee list.');
            });
    };

    const handleAddEmployee = (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!newEmployee.username || !newEmployee.email || !newEmployee.password) {
            setError('すべてのフィールドを入力してください。');
            return;
        }

        fetch('http://localhost:8000/api/orders/customer-users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: {
                    username: newEmployee.username,
                    email: newEmployee.email,
                    password: newEmployee.password,
                },
                company: companyId, // Assign to the hardcoded company
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || JSON.stringify(err)); });
            }
            return response.json();
        })
        .then(data => {
            setMessage('社員が正常に追加されました！');
            setNewEmployee({ username: '', email: '', password: '' });
            fetchEmployees(); // Refresh the list
        })
        .catch(error => {
            console.error('Error adding employee:', error);
            setError(`社員の追加中にエラーが発生しました: ${error.message}`);
        });
    };

    const handleEditClick = (employee) => {
        setEditingEmployee({ 
            ...employee, 
            username: employee.user.username, 
            email: employee.user.email,
            password: '' // Password should not be pre-filled for security
        });
    };

    const handleUpdateEmployee = (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!editingEmployee.username || !editingEmployee.email) {
            setError('ユーザー名とメールアドレスは必須です。');
            return;
        }

        const updateData = {
            user: {
                username: editingEmployee.username,
                email: editingEmployee.email,
            },
        };
        if (editingEmployee.password) {
            updateData.user.password = editingEmployee.password;
        }

        fetch(`http://localhost:8000/api/orders/customer-users/${editingEmployee.id}/`, {
            method: 'PATCH', // Use PATCH for partial updates
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || JSON.stringify(err)); });
            }
            return response.json();
        })
        .then(data => {
            setMessage('社員情報が正常に更新されました！');
            setEditingEmployee(null); // Exit editing mode
            fetchEmployees(); // Refresh the list
        })
        .catch(error => {
            console.error('Error updating employee:', error);
            setError(`社員情報の更新中にエラーが発生しました: ${error.message}`);
        });
    };

    const handleDeleteEmployee = (employeeId) => {
        if (window.confirm('本当にこの社員を削除しますか？')) {
            setError('');
            setMessage('');
            fetch(`http://localhost:8000/api/orders/customer-users/${employeeId}/`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.detail || JSON.stringify(err)); });
                }
                setMessage('社員が正常に削除されました！');
                fetchEmployees(); // Refresh the list
            })
            .catch(error => {
                console.error('Error deleting employee:', error);
                setError(`社員の削除中にエラーが発生しました: ${error.message}`);
            });
        }
    };

    return (
        <div>
            <h2>社員管理</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <h3>新規社員登録</h3>
            <form onSubmit={handleAddEmployee}>
                <div>
                    <label>
                        ユーザー名:
                        <input
                            type="text"
                            value={newEmployee.username}
                            onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        メールアドレス:
                        <input
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        パスワード:
                        <input
                            type="password"
                            value={newEmployee.password}
                            onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                        />
                    </label>
                </div>
                <button type="submit">社員を追加</button>
            </form>

            <h3>社員一覧</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>ユーザー名</th>
                        <th>メールアドレス</th>
                        <th>会社名</th>
                        <th>アクション</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length > 0 ? (
                        employees.map(employee => (
                            <tr key={employee.id}>
                                <td>{employee.id}</td>
                                <td>{employee.user.username}</td>
                                <td>{employee.user.email}</td>
                                <td>{employee.company_name}</td>
                                <td>
                                    <button onClick={() => handleEditClick(employee)}>編集</button>
                                    <button onClick={() => handleDeleteEmployee(employee.id)}>削除</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">社員がいません。</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {editingEmployee && (
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
                    <h3>社員情報編集</h3>
                    <form onSubmit={handleUpdateEmployee}>
                        <div>
                            <label>
                                ユーザー名:
                                <input
                                    type="text"
                                    value={editingEmployee.username}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, username: e.target.value })}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                メールアドレス:
                                <input
                                    type="email"
                                    value={editingEmployee.email}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                新しいパスワード (変更する場合のみ):
                                <input
                                    type="password"
                                    value={editingEmployee.password}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, password: e.target.value })}
                                />
                            </label>
                        </div>
                        <button type="submit">更新</button>
                        <button type="button" onClick={() => setEditingEmployee(null)}>キャンセル</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default EmployeeManagement;
