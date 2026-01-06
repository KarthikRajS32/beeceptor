import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';

const EditAccount = ({ onBack, user, onUpdateUser, onLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    workEmail: '',
    newPassword: '',
    confirmPassword: '',
    deleteConfirmEmail: ''
  });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteSection, setShowDeleteSection] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        company: user.company || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const existingUsers = JSON.parse(localStorage.getItem('beeceptor_users') || '[]');
      const userIndex = existingUsers.findIndex(u => u.email === user.email);

      if (userIndex !== -1) {
        const updatedUser = {
          ...existingUsers[userIndex],
          name: formData.name,
          company: formData.company
        };

        existingUsers[userIndex] = updatedUser;
        localStorage.setItem('beeceptor_users', JSON.stringify(existingUsers));
        localStorage.setItem('user', JSON.stringify(updatedUser));

        onUpdateUser(updatedUser);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrors({ general: 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (formData.deleteConfirmEmail !== user.email) {
      setErrors({ deleteConfirmEmail: 'Email does not match' });
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('beeceptor_users') || '[]');
    const filteredUsers = existingUsers.filter(u => u.email !== user.email);
    localStorage.setItem('beeceptor_users', JSON.stringify(filteredUsers));
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAuthenticated={true} user={user} onLogout={onLogout} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          </div>

          <div className="space-y-8">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 text-sm">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center gap-3">
                    <input type="email" value={formData.email} disabled className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500" />
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Your email is verified</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Your company name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Update Email */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Email</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-blue-800 text-sm">You're currently using a personal email. Consider switching to your work email to collaborate more easily with your team at your company.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                <input type="email" name="workEmail" value={formData.workEmail} onChange={handleInputChange} placeholder="yourname@company.com" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2" />
                <p className="text-sm text-gray-600 mb-4">Use your work email to keep your account aligned with your team and organization.</p>
                <button 
                  type="button"
                  onClick={() => {
                    if (formData.workEmail) {
                      setSuccessMessage('Verification email sent to ' + formData.workEmail);
                      setTimeout(() => setSuccessMessage(''), 3000);
                    } else {
                      setErrors({ workEmail: 'Please enter a work email address' });
                    }
                  }}
                  disabled={!formData.workEmail}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Send Verification Email
                </button>
                {errors.workEmail && <p className="text-red-600 text-xs mt-2">{errors.workEmail}</p>}
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-yellow-800 text-sm">To enable password-based login, please log out and use the reset password functionality to set a password for the first time.</p>
                </div>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Delete Account</h2>
              
              {!showDeleteSection ? (
                <button onClick={() => setShowDeleteSection(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800 text-sm mb-2 font-medium">This action is irreversible. Please be certain!</p>
                    <p className="text-red-700 text-sm">You will lose access to all endpoints (free or upgraded endpoints). Your endpoints and mocking rules will not be cleaned up. You are advised to clear all the mocking rules and settings manually. Review your endpoints and active subscriptions.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Email</label>
                    <input type="email" name="deleteConfirmEmail" value={formData.deleteConfirmEmail} onChange={handleInputChange} placeholder={`Type "${user.email}"`} className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.deleteConfirmEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} />
                    {errors.deleteConfirmEmail && <p className="text-red-600 text-xs mt-1">{errors.deleteConfirmEmail}</p>}
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                      Delete Account
                    </button>
                    <button onClick={() => setShowDeleteSection(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default EditAccount;