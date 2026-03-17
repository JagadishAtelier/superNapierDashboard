// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeClosed,
  Edit,
  X,
  Plus,
  MapPin,
  Trash,
  Check,
} from 'lucide-react';

import {
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../api/profileApi"; // Ensure this path is correct

// --- Modal Component ---
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4 font-inter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 sm:p-8 relative">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Input Field Component ---
const InputField = ({ icon, label, type = 'text', value, onChange, required, readOnly, name }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <div className="flex items-center gap-2">{icon}<span>{label}</span></div>
      </label>
      <div className="relative">
        <input
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          className="mt-1 block w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Address Form (used inside Modal) ---
const AddressForm = ({ address, onChange }) => {
  return (
    <div className="space-y-3">
      <InputField label="Label (Home / Work)" value={address.label || ''} onChange={(e) => onChange({ ...address, label: e.target.value })} />
      <InputField label="Street" value={address.street || ''} onChange={(e) => onChange({ ...address, street: e.target.value })} />
      <InputField label="City" value={address.city || ''} onChange={(e) => onChange({ ...address, city: e.target.value })} />
      <InputField label="State" value={address.state || ''} onChange={(e) => onChange({ ...address, state: e.target.value })} />
      <InputField label="Pincode" value={address.pincode || ''} onChange={(e) => onChange({ ...address, pincode: e.target.value })} />
      <InputField label="Landmark" value={address.landmark || ''} onChange={(e) => onChange({ ...address, landmark: e.target.value })} />
      <div className="flex items-center gap-2 text-sm">
        <input
          id="isDefault"
          type="checkbox"
          checked={!!address.isDefault}
          onChange={(e) => onChange({ ...address, isDefault: e.target.checked })}
        />
        <label htmlFor="isDefault">Set as default address</label>
      </div>
    </div>
  );
};

// --- Main Component ---
const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: '', email: '', addresses: [] });
  const [originalProfile, setOriginalProfile] = useState({ name: '', email: '', addresses: [] });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null); // null = adding
  const [workingAddress, setWorkingAddress] = useState({});

  // address operation loading
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data } = await fetchUserProfile();
        // ensure addresses exist
        const normalized = { addresses: [], ...data };
        setProfile(normalized);
        setOriginalProfile(normalized);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || 'Failed to fetch profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  // helper: only allow adding when there are no addresses
  const canAddAddress = (profile.addresses || []).length === 0;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // ensure only one default address
      const addresses = (profile.addresses || []).map((a, idx) => ({ ...a, isDefault: !!a.isDefault }));
      const defaultCount = addresses.filter((a) => a.isDefault).length;
      if (defaultCount > 1) {
        toast.error('Only one address can be the default.');
        return;
      }

      const payload = { ...profile, addresses };
      const { data } = await updateUserProfile(payload);
      toast.success(data?.message || 'Profile updated successfully!');
      // prefer server-returned profile when available
      const updatedProfile = data && data.user ? data.user : data || payload;
      setOriginalProfile({ ...updatedProfile });
      setProfile({ ...updatedProfile });
      setShowEditProfileModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      setChangingPassword(false);
      return;
    }

    try {
      const { data } = await changeUserPassword(currentPassword, newPassword);
      toast.success(data.message || 'Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowChangePasswordModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCloseEditProfileModal = () => {
    setProfile(originalProfile);
    setShowEditProfileModal(false);
  };

  const handleCloseChangePasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowChangePasswordModal(false);
  };

  // Address handlers (now using updateUserProfile API on each change)
  const openAddAddress = () => {
    if (!canAddAddress) {
      toast.error('Only one address is allowed. Remove the existing address to add a new one.');
      return;
    }

    setEditingAddressIndex(null);
    setWorkingAddress({ label: '', street: '', city: '', state: '', pincode: '', landmark: '', isDefault: false });
    setShowAddressModal(true);
  };

  const openEditAddress = (idx) => {
    setEditingAddressIndex(idx);
    setWorkingAddress({ ...(profile.addresses[idx] || {}) });
    setShowAddressModal(true);
  };

  const saveAddress = async () => {
    // basic validation
    if (!workingAddress.label || !workingAddress.street || !workingAddress.city || !workingAddress.pincode) {
      toast.error('Please fill label, street, city and pincode.');
      return;
    }

    // prevent adding more than one
    if (editingAddressIndex === null && !(profile.addresses || []).length === 0) {
      // shouldn't normally happen because openAddAddress checks, but guard anyway
      toast.error('Only one address allowed.');
      return;
    }

    setAddressSaving(true);
    try {
      // prepare addresses
      const addresses = [...(profile.addresses || [])];
      if (workingAddress.isDefault) {
        addresses.forEach((a) => (a.isDefault = false));
      }

      if (editingAddressIndex === null) {
        // extra guard: if there already is an address, prevent push
        if (addresses.length >= 1) {
          toast.error('Only one address allowed.');
          setAddressSaving(false);
          return;
        }
        addresses.push(workingAddress);
      } else {
        addresses[editingAddressIndex] = workingAddress;
      }

      const payload = { ...profile, addresses };

      const { data } = await updateUserProfile(payload);

      // prefer server returned profile when available
      const updatedProfile = data && (data.user || data.profile) ? (data.user || data.profile) : data || payload;

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setShowAddressModal(false);
      setWorkingAddress({});
      setEditingAddressIndex(null);
      toast.success(data?.message || 'Address saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save address');
    } finally {
      setAddressSaving(false);
    }
  };

  const deleteAddress = async (idx) => {
    // remove locally and push change to server
    setAddressSaving(true);
    try {
      const addresses = [...(profile.addresses || [])];
      addresses.splice(idx, 1);

      const payload = { ...profile, addresses };
      const { data } = await updateUserProfile(payload);
      const updatedProfile = data && (data.user || data.profile) ? (data.user || data.profile) : data || payload;

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      toast.success(data?.message || 'Address removed');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to remove address');
    } finally {
      setAddressSaving(false);
    }
  };

  const setDefaultAddress = async (idx) => {
    setAddressSaving(true);
    try {
      const addresses = (profile.addresses || []).map((a, i) => ({ ...a, isDefault: i === idx }));
      const payload = { ...profile, addresses };
      const { data } = await updateUserProfile(payload);
      const updatedProfile = data && (data.user || data.profile) ? (data.user || data.profile) : data || payload;

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      toast.success(data?.message || 'Default address updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update default address');
    } finally {
      setAddressSaving(false);
    }
  };

  return (
    <div className="bg-[#fff9ef] p-4 sm:p-6 lg:p-8 flex items-center justify-center font-inter min-h-screen">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">My Profile</h1>

        <section className="mb-10 p-6 bg-[#f4ebe2] rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <User className="text-blue-600" /> Profile Information
            </h2>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="inline-flex items-center px-4 py-2 bg-[#280a03] text-[#ffcc0f] text-sm font-medium rounded-md hover:bg-[#ffcc0f] hover:text-[#280a03] transition"
            >
              <Edit size={16} className="mr-2" /> Edit Profile
            </button>
          </div>

          {loadingProfile ? (
            <p className="text-blue-600 text-center">Loading profile...</p>
          ) : (
            <div className="space-y-4">
              <p>
                <span className="text-sm font-medium text-gray-700">Name:</span>{' '}
                <span className="text-lg font-semibold text-gray-900">{profile.name}</span>
              </p>
              <p>
                <span className="text-sm font-medium text-gray-700">Email:</span>{' '}
                <span className="text-lg font-semibold text-gray-900">{profile.email}</span>
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"> Pickup Address</h3>
                  {/* only show add button when no address exists */}
                  {canAddAddress && (
                    <button onClick={openAddAddress} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                      <Plus size={16} /> Add Pickup Address
                    </button>
                  )}
                </div>

                {(!profile.addresses || profile.addresses.length === 0) ? (
                  <p className="text-sm text-gray-600">No addresses added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {profile.addresses.map((addr, idx) => (
                      <div key={idx} className="border rounded-md p-3 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{addr.label || 'Address'}</span>
                            {addr.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{addr.street}, {addr.city} - {addr.pincode}</p>
                          <p className="text-sm text-gray-500">{addr.state} {addr.landmark ? `• ${addr.landmark}` : ''}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button onClick={() => openEditAddress(idx)} className="text-sm inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800">
                            <Edit size={14} /> Edit
                          </button>
                          <button onClick={() => deleteAddress(idx)} disabled={addressSaving} className="text-sm inline-flex items-center gap-2 text-red-600 hover:text-red-800">
                            <Trash size={14} /> {addressSaving ? 'Processing...' : 'Delete'}
                          </button>
                          {!addr.isDefault && (
                            <button onClick={() => setDefaultAddress(idx)} disabled={addressSaving} className="text-sm inline-flex items-center gap-2 text-green-600 hover:text-green-800">
                              <Check size={14} /> {addressSaving ? 'Processing...' : 'Set default'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-center">
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        </div>
      </div>

      {/* --- Edit Profile Modal --- */}
      <Modal show={showEditProfileModal} onClose={handleCloseEditProfileModal} title="Edit Profile Information">
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <InputField icon={<User />} label="Name" type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          <InputField icon={<Mail />} label="Email" type="email" value={profile.email} readOnly />

          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Pickup Address</h4>
            <div className="space-y-2">
              {(profile.addresses || []).map((a, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 border rounded p-2">
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{a.label || 'Address'}</div>
                    <div className="text-xs text-gray-600">{a.street}, {a.city} - {a.pincode}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openEditAddress(idx)} className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"><Edit size={14} />Edit</button>
                    <button type="button" onClick={() => deleteAddress(idx)} disabled={addressSaving} className="text-sm text-red-600 hover:text-red-800 inline-flex items-center gap-1"><Trash size={14} />Delete</button>
                  </div>
                </div>
              ))}
              {/* only show add in edit modal when allowed */}
              {canAddAddress && (
                <button type="button" onClick={openAddAddress} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"><Plus size={14} /> Add Address</button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={handleCloseEditProfileModal} className="inline-flex justify-center py-2 px-6 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-[#F3F6FF]">Cancel</button>
            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md  bg-[#280a03] text-[#ffcc0f] hover:bg-[#ffcc0f] hover:text-[#280a03] ">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* --- Address Modal (Add / Edit) --- */}
      <Modal show={showAddressModal} onClose={() => { setShowAddressModal(false); setWorkingAddress({}); setEditingAddressIndex(null); }} title={editingAddressIndex === null ? 'Add Address' : 'Edit Address'}>
        <div className="space-y-4">
          <AddressForm address={workingAddress} onChange={setWorkingAddress} />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowAddressModal(false); setWorkingAddress({}); setEditingAddressIndex(null); }} className="inline-flex justify-center py-2 px-6 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-[#F3F6FF]">Cancel</button>
            <button type="button" onClick={saveAddress} disabled={addressSaving} className="inline-flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md bg-[#280a03] text-[#ffcc0f] hover:bg-[#ffcc0f] hover:text-[#280a03] ">{addressSaving ? 'Saving...' : (editingAddressIndex === null ? 'Add' : 'Save')}</button>
          </div>
        </div>
      </Modal>

      {/* --- Change Password Modal --- */}
      <Modal show={showChangePasswordModal} onClose={handleCloseChangePasswordModal} title="Change Your Password">
        <form onSubmit={handleChangePassword} className="space-y-6">
          <InputField icon={<KeyRound />} label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <InputField icon={<Lock />} label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <InputField icon={<Lock />} label="Confirm New Password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={handleCloseChangePasswordModal} className="inline-flex justify-center py-2 px-6 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-[#F3F6FF]">Cancel</button>
            <button type="submit" disabled={changingPassword} className="inline-flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md bg-[#280a03] text-[#ffcc0f] hover:bg-[#ffcc0f] hover:text-[#280a03]  disabled:opacity-50 disabled:cursor-not-allowed">{changingPassword ? 'Changing...' : 'Change Password'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
