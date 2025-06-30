

import React, { useState, useEffect } from 'react';

function AccountSettings() {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        company_name: '',
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // For testing, hardcode a customer_user_id. In a real app, this would come from authentication.
    const customerUserId = 1; 

    useEffect(() => {
        // Fetch user data
        fetch(`http://localhost:8000/api/orders/customer-users/${customerUserId}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setUserData({
                    username: data.user.username,
                    email: data.user.email,
                    company_name: data.company_name,
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                setError('Error: Failed to fetch user data.');
                setLoading(false);
            });
    }, [customerUserId]);

    const handleUserUpdate = (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // In a real application, you would send a PATCH or PUT request to update user data.
        // This example only logs the data.
        console.log('Updating user data:', userData);
        setMessage('ユーザー情報が更新されました (実際にはAPI呼び出しが必要です)。');
        // Example API call (uncomment and adjust as needed):
        /*
        fetch(`http://localhost:8000/api/orders/customer-users/${customerUserId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user: {
                    username: userData.username,
                    email: userData.email
                }
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || 'ユーザー情報の更新に失敗しました。'); });
            }
            return response.json();
        })
        .then(data => {
            setMessage('ユーザー情報が正常に更新されました！');
        })
        .catch(error => {
            console.error('Error updating user data:', error);
            setError(`ユーザー情報の更新中にエラーが発生しました: ${error.message}`);
        });
        */
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('新しいパスワードと確認用パスワードが一致しません。');
            return;
        }
        if (newPassword.length < 8) { // Example minimum length
            setError('パスワードは8文字以上である必要があります。');
            return;
        }

        // In a real application, you would send a POST request to change the password.
        // This example only logs the data.
        console.log('Changing password for user:', customerUserId, 'New password:', newPassword);
        setMessage('パスワードが変更されました (実際にはAPI呼び出しが必要です)。');
        setNewPassword('');
        setConfirmPassword('');
        // Example API call (uncomment and adjust as needed):
        /*
        fetch('http://localhost:8000/api/auth/password/change/', { // Example endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_id: customerUserId, // Or current_password, new_password
                new_password: newPassword,
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || 'パスワードの変更に失敗しました。'); });
            }
            return response.json();
        })
        .then(data => {
            setMessage('パスワードが正常に変更されました！');
            setNewPassword('');
            setConfirmPassword('');
        })
        .catch(error => {
            console.error('Error changing password:', error);
            setError(`パスワードの変更中にエラーが発生しました: ${error.message}`);
        });
        */
    };

    if (loading) {
        return <div>Loading account settings...</div>;
    }

    return (
        <div>
            <h2>アカウント設定</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <h3>ユーザー情報</h3>
            <form onSubmit={handleUserUpdate}>
                <div>
                    <label>
                        ユーザー名:
                        <input
                            type="text"
                            value={userData.username}
                            onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        メールアドレス:
                        <input
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        所属会社:
                        <input
                            type="text"
                            value={userData.company_name}
                            disabled // Company name is usually not editable by individual users
                        />
                    </label>
                </div>
                <button type="submit">ユーザー情報を更新</button>
            </form>

            <h3>パスワード変更</h3>
            <form onSubmit={handlePasswordChange}>
                <div>
                    <label>
                        新しいパスワード:
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        パスワードの確認:
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </label>
                </div>
                <button type="submit">パスワードを変更</button>
            </form>
        </div>
    );
}

export default AccountSettings;

