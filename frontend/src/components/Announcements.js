
import React, { useState, useEffect } from 'react';

function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_active: true,
    });
    const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = () => {
        fetch('http://localhost:8000/api/orders/announcements/?format=json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setAnnouncements(data);
            })
            .catch(error => {
                console.error('Error fetching announcements:', error);
                setError('Error: Failed to fetch announcements');
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
        const url = editingAnnouncementId 
            ? `http://localhost:8000/api/orders/announcements/${editingAnnouncementId}/`
            : 'http://localhost:8000/api/orders/announcements/';
        const method = editingAnnouncementId ? 'PUT' : 'POST';

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
                title: '',
                content: '',
                is_active: true,
            });
            setEditingAnnouncementId(null);
            fetchAnnouncements(); // Refresh the list
        })
        .catch(error => {
            console.error('Error saving announcement:', error);
            setError('Error: Failed to save announcement');
        });
    };

    const handleEdit = (announcement) => {
        setFormData({
            title: announcement.title,
            content: announcement.content,
            is_active: announcement.is_active,
        });
        setEditingAnnouncementId(announcement.id);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            fetch(`http://localhost:8000/api/orders/announcements/${id}/`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchAnnouncements(); // Refresh the list
            })
            .catch(error => {
                console.error('Error deleting announcement:', error);
                setError('Error: Failed to delete announcement');
            });
        }
    };

    return (
        <div>
            <h2>Announcements Management</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h3>{editingAnnouncementId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div>
                    <label>Content:</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} required />
                </div>
                <div>
                    <label>
                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                        Is Active
                    </label>
                </div>
                <button type="submit">{editingAnnouncementId ? 'Update Announcement' : 'Create Announcement'}</button>
                {editingAnnouncementId && <button type="button" onClick={() => {setEditingAnnouncementId(null); setFormData({title: '', content: '', is_active: true});}}>Cancel Edit</button>}
            </form>

            <h3>Current Announcements</h3>
            {announcements.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Content</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcements.map(announcement => (
                            <tr key={announcement.id}>
                                <td>{announcement.title}</td>
                                <td>{announcement.content}</td>
                                <td>{announcement.is_active ? 'Yes' : 'No'}</td>
                                <td>
                                    <button onClick={() => handleEdit(announcement)}>Edit</button>
                                    <button onClick={() => handleDelete(announcement.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No announcements found.</p>
            )}
        </div>
    );
}

export default Announcements;
