
import React, { useState, useEffect } from 'react';

function SystemSettings() {
    const [settings, setSettings] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        setting_name: '',
        setting_value: '',
    });
    const [editingSettingId, setEditingSettingId] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = () => {
        fetch('http://localhost:8000/api/orders/system-settings/?format=json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setSettings(data);
            })
            .catch(error => {
                console.error('Error fetching settings:', error);
                setError('Error: Failed to fetch settings');
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = editingSettingId 
            ? `http://localhost:8000/api/orders/system-settings/${editingSettingId}/`
            : 'http://localhost:8000/api/orders/system-settings/';
        const method = editingSettingId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            setFormData({
                setting_name: '',
                setting_value: '',
            });
            setEditingSettingId(null);
            fetchSettings(); // Refresh the list
        })
        .catch(error => {
            console.error('Error saving setting:', error);
            setError('Error: Failed to save setting');
        });
    };

    const handleEdit = (setting) => {
        setFormData({
            setting_name: setting.setting_name,
            setting_value: setting.setting_value,
        });
        setEditingSettingId(setting.id);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this setting?')) {
            fetch(`http://localhost:8000/api/orders/system-settings/${id}/`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchSettings(); // Refresh the list
            })
            .catch(error => {
                console.error('Error deleting setting:', error);
                setError('Error: Failed to delete setting');
            });
        }
    };

    return (
        <div>
            <h2>System Settings Management</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h3>{editingSettingId ? 'Edit Setting' : 'Add New Setting'}</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Setting Name:</label>
                    <input type="text" name="setting_name" value={formData.setting_name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Setting Value:</label>
                    <input type="text" name="setting_value" value={formData.setting_value} onChange={handleChange} required />
                </div>
                <button type="submit">{editingSettingId ? 'Update Setting' : 'Add Setting'}</button>
                {editingSettingId && <button type="button" onClick={() => {setEditingSettingId(null); setFormData({setting_name: '', setting_value: ''});}}>Cancel Edit</button>}
            </form>

            <h3>Current Settings</h3>
            {settings.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {settings.map(setting => (
                            <tr key={setting.id}>
                                <td>{setting.setting_name}</td>
                                <td>{setting.setting_value}</td>
                                <td>
                                    <button onClick={() => handleEdit(setting)}>Edit</button>
                                    <button onClick={() => handleDelete(setting.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No settings found.</p>
            )}
        </div>
    );
}

export default SystemSettings;
