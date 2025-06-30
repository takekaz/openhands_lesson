
import React, { useState, useEffect } from 'react';

function MenuManagement() {
    const [menus, setMenus] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        allergens: '',
        is_active: true,
    });
    const [editingMenuId, setEditingMenuId] = useState(null);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = () => {
        fetch('http://localhost:8000/api/orders/menus/?format=json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setMenus(data);
            })
            .catch(error => {
                console.error('Error fetching menus:', error);
                setError('Error: Failed to fetch menus');
            });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = editingMenuId 
            ? `http://localhost:8000/api/orders/menus/${editingMenuId}/`
            : 'http://localhost:8000/api/orders/menus/';
        const method = editingMenuId ? 'PUT' : 'POST';

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
                name: '',
                description: '',
                price: '',
                allergens: '',
                is_active: true,
            });
            setEditingMenuId(null);
            fetchMenus(); // Refresh the list
        })
        .catch(error => {
            console.error('Error saving menu:', error);
            setError('Error: Failed to save menu');
        });
    };

    const handleEdit = (menu) => {
        setFormData({
            name: menu.name,
            description: menu.description,
            price: menu.price,
            allergens: menu.allergens,
            is_active: menu.is_active,
        });
        setEditingMenuId(menu.id);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            fetch(`http://localhost:8000/api/orders/menus/${id}/`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchMenus(); // Refresh the list
            })
            .catch(error => {
                console.error('Error deleting menu:', error);
                setError('Error: Failed to delete menu');
            });
        }
    };

    return (
        <div>
            <h2>Menu Management</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h3>{editingMenuId ? 'Edit Menu' : 'Add New Menu'}</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                </div>
                <div>
                    <label>Price:</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
                </div>
                <div>
                    <label>Allergens:</label>
                    <input type="text" name="allergens" value={formData.allergens} onChange={handleChange} />
                </div>
                <div>
                    <label>Active:</label>
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                </div>
                <button type="submit">{editingMenuId ? 'Update Menu' : 'Add Menu'}</button>
                {editingMenuId && <button type="button" onClick={() => {setEditingMenuId(null); setFormData({name: '', description: '', price: '', allergens: '', is_active: true});}}>Cancel Edit</button>}
            </form>

            <h3>Current Menus</h3>
            {menus.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Allergens</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menus.map(menu => (
                            <tr key={menu.id}>
                                <td>{menu.name}</td>
                                <td>{menu.description}</td>
                                <td>¥{menu.price}</td>
                                <td>{menu.allergens}</td>
                                <td>{menu.is_active ? 'Yes' : 'No'}</td>
                                <td>
                                    <button onClick={() => handleEdit(menu)}>Edit</button>
                                    <button onClick={() => handleDelete(menu.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No menus found.</p>
            )}
        </div>
    );
}

export default MenuManagement;
