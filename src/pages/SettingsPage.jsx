import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api/settingsApi';
import { toast } from 'react-hot-toast';
import { CreditCard, QrCode, Save, Loader2, Info } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        activePaymentMethod: 'upi',
        upiSettings: {
            vpa: '',
            businessName: ''
        },
        freeShippingThreshold: 999
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await getSettings();
            if (res.data.success) {
                setSettings(res.data.settings);
            }
        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings(settings);
            toast.success("Settings updated successfully");
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-green-600 w-10 h-10" />
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">General Settings</h1>

            {/* 💳 Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="text-green-600 w-5 h-5" />
                        <h2 className="font-bold">Payment Gateway Control</h2>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setSettings({ ...settings, activePaymentMethod: 'razorpay' })}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.activePaymentMethod === 'razorpay' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                        >
                            <CreditCard className="w-8 h-8" />
                            <span className="font-bold">Online Payment (Razorpay)</span>
                        </button>
                        <button
                            onClick={() => setSettings({ ...settings, activePaymentMethod: 'upi' })}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.activePaymentMethod === 'upi' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                        >
                            <QrCode className="w-8 h-8" />
                            <span className="font-bold">Manual UPI (QR Code)</span>
                        </button>
                    </div>

                    {settings.activePaymentMethod === 'upi' && (
                        <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <Info className="w-4 h-4" />
                                <span className="text-sm font-bold">UPI Configuration</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase">UPI ID (VPA)</label>
                                    <input
                                        type="text"
                                        value={settings.upiSettings.vpa}
                                        onChange={(e) => setSettings({ ...settings, upiSettings: { ...settings.upiSettings, vpa: e.target.value } })}
                                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="e.g. merchant@okaxis"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Business Name</label>
                                    <input
                                        type="text"
                                        value={settings.upiSettings.businessName}
                                        onChange={(e) => setSettings({ ...settings, upiSettings: { ...settings.upiSettings, businessName: e.target.value } })}
                                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="e.g. Super Napier Seeds"
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-yellow-600 italic">
                                * This information will be used to generate the QR code on the checkout page.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🚚 Shipping Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center gap-2">
                    <Save className="text-green-600 w-5 h-5" />
                    <h2 className="font-bold">Global Shipping Threshold</h2>
                </div>
                <div className="p-6">
                    <div className="max-w-xs space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Free Shipping Above (₹)</label>
                        <input
                            type="number"
                            value={settings.freeShippingThreshold}
                            onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                            className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="999"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
