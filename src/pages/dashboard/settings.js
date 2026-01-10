"use client";
// ✅ settings.js
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { showSuccess, showError } from '@/utils/toastHelper';

export default function Settings() {
  const [formData, setFormData] = useState({
    name: 'اسم الطالب',
    email: 'student@example.com',
    password: '',
    language: 'العربية',
    darkMode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://ge-api.ghostexams.com/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        const successMessage = result.message || "تم حفظ التغييرات بنجاح";
        showSuccess(successMessage);
      } else {
        const errorMessage = result.message || 'حدث خطأ أثناء حفظ التغييرات';
        showError(errorMessage);
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال بالخادم:', error);
      showError('لا يمكن الاتصال بالخادم');
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gray-100 p-6">
        <Navbar />
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">⚙️ إعدادات الحساب</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded p-6">
        <div className="mb-4">
          <label className="block text-gray-700">الاسم الكامل:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">البريد الإلكتروني:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">كلمة المرور الجديدة:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">اللغة:</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="العربية">العربية</option>
            <option value="الإنجليزية">الإنجليزية</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="darkMode"
              checked={formData.darkMode}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">تفعيل الوضع الداكن</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          حفظ التغييرات
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200">
            العودة إلى لوحة التحكم
          </button>
        </Link>
      </div>
    </div>
    </ProtectedRoute>
  );
} 
