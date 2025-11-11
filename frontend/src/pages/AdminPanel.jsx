import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllAuthorizedUsers, 
  addAuthorizedUser, 
  removeAuthorizedUser,
  toggleUserStatus 
} from '../utils/adminUtils';
import { seedInitialUsers } from '../utils/seedUsers';
import ConfirmModal from '../components/ConfirmModal';
import './AdminPanel.css';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function AdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'coach' });
  const [message, setMessage] = useState(null);
  const [updatingScripts, setUpdatingScripts] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const handleUpdateHelperScripts = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Update Helper Scripts',
      message: 'Update helper scripts in the template spreadsheet? This will deploy the latest script code.',
      onConfirm: async () => {
        setUpdatingScripts(true);
        setConfirmModal({ ...confirmModal, isOpen: false });
        
        try {
          const response = await fetch(
            'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/updateHelperScripts',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }
          );
          
          const result = await response.json();
          
          if (result.success) {
            setMessage({ type: 'success', text: 'Helper scripts updated successfully!' });
          } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update scripts' });
          }
        } catch (error) {
          console.error('Error updating scripts:', error);
          setMessage({ type: 'error', text: 'Failed to update helper scripts' });
        } finally {
          setUpdatingScripts(false);
        }
      }
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const userList = await getAllAuthorizedUsers();
    setUsers(userList);
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.email) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    const result = await addAuthorizedUser(newUser.email, newUser.role, newUser.name);
    
    if (result.success) {
      setMessage({ type: 'success', text: `Added ${newUser.email}` });
      setNewUser({ email: '', name: '', role: 'coach' });
      setShowAddForm(false);
      loadUsers();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleRemoveUser = async (email) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove User',
      message: `Are you sure you want to remove ${email}? This action cannot be undone.`,
      onConfirm: async () => {
        const result = await removeAuthorizedUser(email);
        
        if (result.success) {
          setMessage({ type: 'success', text: `Removed ${email}` });
          loadUsers();
        } else {
          setMessage({ type: 'error', text: result.error });
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleToggleStatus = async (email, currentStatus) => {
    const result = await toggleUserStatus(email, !currentStatus);
    
    if (result.success) {
      setMessage({ type: 'success', text: `Updated ${email}` });
      loadUsers();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleChangeRole = async (email, currentRole) => {
    const newRole = currentRole === 'admin' ? 'coach' : 'admin';
    
    setConfirmModal({
      isOpen: true,
      title: 'Change User Role',
      message: `Change ${email} from ${currentRole} to ${newRole}?`,
      onConfirm: async () => {
        try {
          const userRef = doc(db, 'authorizedUsers', email);
          await setDoc(userRef, { role: newRole }, { merge: true });
          setMessage({ type: 'success', text: `Changed ${email} to ${newRole}` });
          loadUsers();
        } catch (error) {
          console.error('Error changing role:', error);
          setMessage({ type: 'error', text: error.message });
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleSeedUsers = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Seed Initial Users',
      message: 'Add initial admin users to the database?',
      onConfirm: async () => {
        await seedInitialUsers();
        setMessage({ type: 'success', text: 'Initial users seeded!' });
        loadUsers();
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  if (!isAdmin()) {
    return (
      <div className="admin-panel">
        <h2>❌ Admin Access Required</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      <div className="admin-header">
        <h1>👥 User Management</h1>
        <div className="admin-actions">
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? 'Cancel' : '+ Add User'}
          </button>
          <button onClick={handleSeedUsers} className="btn-secondary">
            🌱 Seed Initial Users
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddUser} className="add-user-form">
          <h3>Add New User</h3>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="coach@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Coach Name"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select 
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Add User</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name || '-'}</td>
                  <td>
                    <span className={`badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.addedAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleChangeRole(user.email, user.role)}
                      className={`btn-sm btn-role-${user.role === 'admin' ? 'coach' : 'admin'}`}
                      title={`Change to ${user.role === 'admin' ? 'coach' : 'admin'}`}
                    >
                      {user.role === 'admin' ? '→ Coach' : '→ Admin'}
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user.email, user.active)}
                      className="btn-sm"
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleRemoveUser(user.email)}
                      className="btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* System Management Section - AT THE END */}
      <div className="system-management">
        <h2>🔧 System Management</h2>
        <div className="admin-actions">
         
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;