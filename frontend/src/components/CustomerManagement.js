
import React, { useState, useEffect } from 'react';

function CustomerManagement() {
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    const [companyFormData, setCompanyFormData] = useState({
        name: '',
        contact_person: '',
        email: '',
        phone_number: '',
    });
    const [editingCompanyId, setEditingCompanyId] = useState(null);

    const [userFormData, setUserFormData] = useState({
        username: '',
        password: '',
        company: '',
    });
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        fetchCompanies();
        fetchUsers();
    }, []);

    const fetchCompanies = () => {
        fetch('http://localhost:8000/api/orders/customer-companies/?format=json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setCompanies(data);
            })
            .catch(error => {
                console.error('Error fetching companies:', error);
                setError('Error: Failed to fetch companies');
            });
    };

    const fetchUsers = () => {
        fetch('http://localhost:8000/api/orders/customer-users/?format=json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                setError('Error: Failed to fetch users');
            });
    };

    const handleCompanyChange = (e) => {
        const { name, value } = e.target;
        setCompanyFormData({
            ...companyFormData,
            [name]: value,
        });
    };

    const handleCompanySubmit = (e) => {
        e.preventDefault();
        const url = editingCompanyId 
            ? `http://localhost:8000/api/orders/customer-companies/${editingCompanyId}/`
            : 'http://localhost:8000/api/orders/customer-companies/';
        const method = editingCompanyId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(companyFormData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            setCompanyFormData({
                name: '',
                contact_person: '',
                email: '',
                phone_number: '',
            });
            setEditingCompanyId(null);
            fetchCompanies();
        })
        .catch(error => {
            console.error('Error saving company:', error);
            setError('Error: Failed to save company');
        });
    };

    const handleEditCompany = (company) => {
        setCompanyFormData({
            name: company.name,
            contact_person: company.contact_person,
            email: company.email,
            phone_number: company.phone_number,
        });
        setEditingCompanyId(company.id);
    };

    const handleDeleteCompany = (id) => {
        if (window.confirm('Are you sure you want to delete this company?')) {
            fetch(`http://localhost:8000/api/orders/customer-companies/${id}/`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchCompanies();
                fetchUsers(); // Users might be affected
            })
            .catch(error => {
                console.error('Error deleting company:', error);
                setError('Error: Failed to delete company');
            });
        }
    };

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUserFormData({
            ...userFormData,
            [name]: value,
        });
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        const url = editingUserId 
            ? `http://localhost:8000/api/orders/customer-users/${editingUserId}/`
            : 'http://localhost:8000/api/orders/customer-users/';
        const method = editingUserId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userFormData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            setUserFormData({
                username: '',
                password: '',
                company: '',
            });
            setEditingUserId(null);
            fetchUsers();
        })
        .catch(error => {
            console.error('Error saving user:', error);
            setError('Error: Failed to save user');
        });
    };

    const handleEditUser = (user) => {
        setUserFormData({
            username: user.user.username,
            company: user.company, // This is the company ID
            password: '', // Password should not be pre-filled for security
        });
        setEditingUserId(user.id);
    };

    const handleDeleteUser = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            fetch(`http://localhost:8000/api/orders/customer-users/${id}/`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchUsers();
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                setError('Error: Failed to delete user');
            });
        }
    };

    return (
        <div>
            <h2>Customer Management</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h3>{editingCompanyId ? 'Edit Customer Company' : 'Add New Customer Company'}</h3>
            <form onSubmit={handleCompanySubmit}>
                <div>
                    <label>Company Name:</label>
                    <input type="text" name="name" value={companyFormData.name} onChange={handleCompanyChange} required />
                </div>
                <div>
                    <label>Contact Person:</label>
                    <input type="text" name="contact_person" value={companyFormData.contact_person} onChange={handleCompanyChange} />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={companyFormData.email} onChange={handleCompanyChange} />
                </div>
                <div>
                    <label>Phone Number:</label>
                    <input type="text" name="phone_number" value={companyFormData.phone_number} onChange={handleCompanyChange} />
                </div>
                <button type="submit">{editingCompanyId ? 'Update Company' : 'Add Company'}</button>
                {editingCompanyId && <button type="button" onClick={() => {setEditingCompanyId(null); setCompanyFormData({name: '', contact_person: '', email: '', phone_number: ''});}}>Cancel Edit</button>}
            </form>

            <h3>Current Customer Companies</h3>
            {companies.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(company => (
                            <tr key={company.id}>
                                <td>{company.name}</td>
                                <td>{company.contact_person}</td>
                                <td>{company.email}</td>
                                <td>{company.phone_number}</td>
                                <td>
                                    <button onClick={() => handleEditCompany(company)}>Edit</button>
                                    <button onClick={() => handleDeleteCompany(company.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No customer companies found.</p>
            )}

            <hr />

            <h3>{editingUserId ? 'Edit Customer User' : 'Add New Customer User'}</h3>
            <form onSubmit={handleUserSubmit}>
                <div>
                    <label>Username:</label>
                    <input type="text" name="username" value={userFormData.username} onChange={handleUserChange} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" value={userFormData.password} onChange={handleUserChange} required={!editingUserId} />
                </div>
                <div>
                    <label>Company:</label>
                    <select name="company" value={userFormData.company} onChange={handleUserChange} required>
                        <option value="">Select a company</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit">{editingUserId ? 'Update User' : 'Add User'}</button>
                {editingUserId && <button type="button" onClick={() => {setEditingUserId(null); setUserFormData({username: '', password: '', company: ''});}}>Cancel Edit</button>}
            </form>

            <h3>Current Customer Users</h3>
            {users.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Company</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.user.username}</td>
                                <td>{user.company_name}</td>
                                <td>
                                    <button onClick={() => handleEditUser(user)}>Edit</button>
                                    <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No customer users found.</p>
            )}
        </div>
    );
}

export default CustomerManagement;
