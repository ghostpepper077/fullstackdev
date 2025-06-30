import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Calendar, Globe, Languages, Clock } from 'lucide-react';

function Profile() {
    const [user, setUser] = useState({
        name: 'user',
        email: 'user@email.com',
        dateOfBirth: '',
        gender: '',
        country: '',
        language: '',
        timeZone: '',
        password: 'userpassword'
    });
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(user);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // Simulate API call
        setUser(formData);
        setEditMode(false);
        // Show success message
        alert('Profile updated successfully!');
    };

    const handleCancel = () => {
        setFormData(user);
        setEditMode(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-900">User Profile</h1>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">{user.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">User</h2>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Your Full Name"
                                disabled={!editMode}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Of Birth
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    placeholder="Your Date of Birth"
                                    disabled={!editMode}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <select
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                disabled={!editMode}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="">Your Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                    disabled={!editMode}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                >
                                    <option value="">Your Country</option>
                                    <option value="singapore">Singapore</option>
                                    <option value="malaysia">Malaysia</option>
                                    <option value="indonesia">Indonesia</option>
                                    <option value="thailand">Thailand</option>
                                    <option value="philippines">Philippines</option>
                                    <option value="united-states">United States</option>
                                    <option value="united-kingdom">United Kingdom</option>
                                    <option value="australia">Australia</option>
                                    <option value="canada">Canada</option>
                                </select>
                                <Globe className="absolute right-8 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Language
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                    disabled={!editMode}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                >
                                    <option value="">Your Language</option>
                                    <option value="english">English</option>
                                    <option value="chinese">Chinese</option>
                                    <option value="malay">Malay</option>
                                    <option value="tamil">Tamil</option>
                                    <option value="japanese">Japanese</option>
                                    <option value="korean">Korean</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                </select>
                                <Languages className="absolute right-8 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Time Zone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Zone
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.timeZone}
                                    onChange={(e) => handleInputChange('timeZone', e.target.value)}
                                    disabled={!editMode}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                >
                                    <option value="">Your Timezone</option>
                                    <option value="asia/singapore">Asia/Singapore (SGT)</option>
                                    <option value="asia/kuala_lumpur">Asia/Kuala_Lumpur (MYT)</option>
                                    <option value="asia/jakarta">Asia/Jakarta (WIB)</option>
                                    <option value="asia/bangkok">Asia/Bangkok (ICT)</option>
                                    <option value="asia/manila">Asia/Manila (PST)</option>
                                    <option value="america/new_york">America/New_York (EST)</option>
                                    <option value="europe/london">Europe/London (GMT)</option>
                                    <option value="australia/sydney">Australia/Sydney (AEDT)</option>
                                </select>
                                <Clock className="absolute right-8 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Email and Password Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!editMode}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-blue-500" />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password:
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        disabled={!editMode}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-center">
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;