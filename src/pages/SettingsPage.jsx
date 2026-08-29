import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api/settingsApi';
import { toast } from 'react-hot-toast';
import { CreditCard, QrCode, Save, Loader2, Info, Mail, Truck, Gift } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        activePaymentMethod: 'upi',
        upiSettings: {
            vpa: '',
            businessName: ''
        },
        seedCourierTN: 60,
        seedCourierSouth: 130,
        seedCourierRest: 160,
        napierTransitSouthRate: 25,
        napierTransitRestRate: 50,
        napierTransitTNRate: 0,
        adminEmail1: '',
        adminEmail2: '',
        isWheelEnabled: true,
        wheelOffers: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('payment');

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
        // Validation
        if (settings.seedCourierTN < 0 || settings.seedCourierSouth < 0 || settings.seedCourierRest < 0) {
            toast.error("Courier rates must be greater than or equal to 0");
            return;
        }
        if (settings.napierTransitSouthRate < 0 || settings.napierTransitSouthRate > 100 ||
            settings.napierTransitRestRate < 0 || settings.napierTransitRestRate > 100 ||
            settings.napierTransitTNRate < 0 || settings.napierTransitTNRate > 100) {
            toast.error("Napier transit rates must be between 0% and 100%");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (settings.adminEmail1 && !emailRegex.test(settings.adminEmail1)) {
            toast.error("Admin Email 1 is invalid");
            return;
        }
        if (settings.adminEmail2 && !emailRegex.test(settings.adminEmail2)) {
            toast.error("Admin Email 2 is invalid");
            return;
        }

        setSaving(true);
        try {
            await updateSettings(settings);
            toast.success("Settings updated successfully");
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to update settings";
            toast.error(errorMsg);
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
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">General Settings</h1>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 !mt-2">
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all outline-none ${
                        activeTab === 'payment'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <CreditCard className="w-4 h-4" />
                    Payment Options
                </button>
                <button
                    onClick={() => setActiveTab('shipping')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all outline-none ${
                        activeTab === 'shipping'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <Truck className="w-4 h-4" />
                    Shipping Rates
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all outline-none ${
                        activeTab === 'notifications'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <Mail className="w-4 h-4" />
                    Notification
                </button>
                <button
                    onClick={() => setActiveTab('offers')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all outline-none ${
                        activeTab === 'offers'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <Gift className="w-4 h-4" />
                    Offers
                </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-4">
                {activeTab === 'payment' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-200">
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
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.activePaymentMethod === 'razorpay' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-400 text-gray-500'}`}
                                >
                                    <CreditCard className="w-8 h-8" />
                                    <span className="font-bold">Online Payment (Razorpay)</span>
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, activePaymentMethod: 'upi' })}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.activePaymentMethod === 'upi' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-400 text-gray-500'}`}
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
                )}

                {activeTab === 'shipping' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-200">
                        <div className="p-5 border-b border-gray-50 flex items-center gap-2">
                            <Truck className="text-green-600 w-5 h-5" />
                            <h2 className="font-bold">Regional Shipping Rates Configuration</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Seed Courier Charges */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-sm border-b pb-2">Seed Courier Charges (per kg)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Tamil Nadu & Puducherry (₹)</label>
                                        <input
                                            type="number"
                                            value={settings.seedCourierTN ?? 60}
                                            onChange={(e) => setSettings({ ...settings, seedCourierTN: Number(e.target.value) })}
                                            className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase">South India (KL/AP/KA/TS) (₹)</label>
                                        <input
                                            type="number"
                                            value={settings.seedCourierSouth ?? 130}
                                            onChange={(e) => setSettings({ ...settings, seedCourierSouth: Number(e.target.value) })}
                                            className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Rest of India (₹)</label>
                                        <input
                                            type="number"
                                            value={settings.seedCourierRest ?? 160}
                                            onChange={(e) => setSettings({ ...settings, seedCourierRest: Number(e.target.value) })}
                                            className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Napier Transit Rates */}
                            <div className="space-y-4 pt-4">
                                <h3 className="font-bold text-gray-800 text-sm border-b pb-2">Napier Cuttings Transportation (Transit Rates)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Rest of India Rate (%)</label>
                                        <input
                                            type="number"
                                            value={settings.napierTransitRestRate ?? 50}
                                            onChange={(e) => setSettings({ ...settings, napierTransitRestRate: Number(e.target.value) })}
                                            className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase">South India Rate (%)</label>
                                        <input
                                            type="number"
                                            value={settings.napierTransitSouthRate ?? 25}
                                            onChange={(e) => setSettings({ ...settings, napierTransitSouthRate: Number(e.target.value) })}
                                            className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Tamil Nadu & Puducherry Rate (%)</label>
                                        <input
                                            type="number"
                                            value={settings.napierTransitTNRate ?? 0}
                                            onChange={(e) => setSettings({ ...settings, napierTransitTNRate: Number(e.target.value) })}
                                            className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-200">
                        <div className="p-5 border-b border-gray-50 flex items-center gap-2">
                            <Mail className="text-green-600 w-5 h-5" />
                            <h2 className="font-bold">Admin Notification Settings</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-gray-500 italic">
                                Configure up to two email addresses to receive notifications when a new customer order is placed.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Admin Email 1</label>
                                    <input
                                        type="email"
                                        value={settings.adminEmail1 || ""}
                                        onChange={(e) => setSettings({ ...settings, adminEmail1: e.target.value })}
                                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="e.g. admin1@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Admin Email 2</label>
                                    <input
                                        type="email"
                                        value={settings.adminEmail2 || ""}
                                        onChange={(e) => setSettings({ ...settings, adminEmail2: e.target.value })}
                                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="e.g. admin2@example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'offers' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-200">
                        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Gift className="text-green-600 w-5 h-5" />
                                <h2 className="font-bold">Rewards Spin Wheel & Offers</h2>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.isWheelEnabled ?? true}
                                    onChange={(e) => setSettings({ ...settings, isWheelEnabled: e.target.checked })}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm font-bold text-gray-700">Enable Spin Wheel Popup</span>
                            </label>
                        </div>
                        <div className="p-6 space-y-6">
                            <p className="text-xs text-gray-500 italic">
                                Configure the 6 slices of the spin wheel. The sum of probabilities for all active segments must equal exactly 100%. Slices of type 'none' represent try-again/no-luck states and must not have a coupon or value associated.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase">
                                            <th className="py-2 px-1">Label</th>
                                            <th className="py-2 px-1">Coupon Code</th>
                                            <th className="py-2 px-1">Type</th>
                                            <th className="py-2 px-1">Value</th>
                                            <th className="py-2 px-1">Min Order</th>
                                            <th className="py-2 px-1">Max Disc.</th>
                                            <th className="py-2 px-1 w-16">Prob. (%)</th>
                                            <th className="py-2 px-1 text-center w-10">Active</th>
                                            <th className="py-2 px-1 text-center w-20">Colors</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(settings.wheelOffers || []).map((offer, index) => (
                                            <tr key={offer.id || index} className="hover:bg-gray-50/50">
                                                <td className="py-3 px-1">
                                                    <input
                                                        type="text"
                                                        value={offer.label}
                                                        onChange={(e) => {
                                                            const newOffers = [...settings.wheelOffers];
                                                            newOffers[index].label = e.target.value;
                                                            setSettings({ ...settings, wheelOffers: newOffers });
                                                        }}
                                                        className="w-full h-8 border rounded px-2 focus:ring-1 focus:ring-green-500 outline-none text-xs"
                                                        placeholder="e.g. 10% OFF"
                                                    />
                                                </td>
                                                <td className="py-3 px-1">
                                                    <input
                                                        type="text"
                                                        value={offer.couponCode || ""}
                                                        disabled={offer.type === 'none'}
                                                        onChange={(e) => {
                                                            const newOffers = [...settings.wheelOffers];
                                                            newOffers[index].couponCode = e.target.value.toUpperCase();
                                                            setSettings({ ...settings, wheelOffers: newOffers });
                                                        }}
                                                        className="w-full h-8 border rounded px-2 focus:ring-1 focus:ring-green-500 outline-none text-xs uppercase disabled:bg-gray-50"
                                                        placeholder="e.g. WIN10"
                                                    />
                                                </td>
                                                <td className="py-3 px-1">
                                                    <select
                                                        value={offer.type}
                                                        onChange={(e) => {
                                                            const newOffers = [...settings.wheelOffers];
                                                            newOffers[index].type = e.target.value;
                                                            if (e.target.value === 'none') {
                                                                newOffers[index].value = 0;
                                                                newOffers[index].couponCode = "";
                                                                newOffers[index].maxDiscount = 0;
                                                            }
                                                            setSettings({ ...settings, wheelOffers: newOffers });
                                                        }}
                                                        className="w-full h-8 border rounded px-1.5 focus:ring-1 focus:ring-green-500 outline-none text-xs bg-white"
                                                    >
                                                        <option value="none">None</option>
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="flat">Flat (₹)</option>
                                                    </select>
                                                </td>
                                                <td className="py-3 px-1">
                                                    <input
                                                        type="number"
                                                        value={offer.value}
                                                        disabled={offer.type === 'none'}
                                                        onChange={(e) => {
                                                            const newOffers = [...settings.wheelOffers];
                                                            newOffers[index].value = Number(e.target.value);
                                                            setSettings({ ...settings, wheelOffers: newOffers });
                                                        }}
                                                        className="w-16 h-8 border rounded px-2 focus:ring-1 focus:ring-green-500 outline-none text-xs disabled:bg-gray-50"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="py-3 px-1">
                                                    <input
                                                        type="number"
                                                        value={offer.minOrder}
                                                        disabled={offer.type === 'none'}
                                                        onChange={(e) => {
                                                            const newOffers = [...settings.wheelOffers];
                                                            newOffers[index].minOrder = Number(e.target.value);
                                                            setSettings({ ...settings, wheelOffers: newOffers });
                                                        }}
                                                        className="w-16 h-8 border rounded px-2 focus:ring-1 focus:ring-green-500 outline-none text-xs disabled:bg-gray-50"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="py-3 px-1">
                                                    <input
                                                        type="number"
                                                        value={offer.maxDiscount || 0}
                                                        disabled={offer.type === 'none'}
                                                        onChange={(e) => {
                                                            const newOffers = [...settings.wheelOffers];
                                                            newOffers[index].maxDiscount = Number(e.target.value);
                                                            setSettings({ ...settings, wheelOffers: newOffers });
                                                        }}
                                                        className="w-16 h-8 border rounded px-2 focus:ring-1 focus:ring-green-500 outline-none text-xs disabled:bg-gray-50"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="py-3 px-1">
                                                    <input
                                                        type="number"
                                                        value={offer.probability}
                                                        disabled={!offer.isActive}
                                                        onChange={(e) => {
                                                            const newOffers = [...settings.wheelOffers];
                                                            newOffers[index].probability = Number(e.target.value);
                                                            setSettings({ ...settings, wheelOffers: newOffers });
                                                        }}
                                                        className="w-14 h-8 border rounded px-2 focus:ring-1 focus:ring-green-500 outline-none text-xs disabled:bg-gray-50"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </td>
                                                <td className="py-3 px-1 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={offer.isActive}
                                                        onChange={(e) => {
                                                            const newOffers = [...settings.wheelOffers];
                                                            newOffers[index].isActive = e.target.checked;
                                                            if (!e.target.checked) {
                                                                newOffers[index].probability = 0;
                                                            }
                                                            setSettings({ ...settings, wheelOffers: newOffers });
                                                        }}
                                                        className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                </td>
                                                <td className="py-3 px-1 text-center flex items-center justify-center gap-1">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] text-gray-400">Bg</span>
                                                        <input
                                                            type="color"
                                                            value={offer.color}
                                                            onChange={(e) => {
                                                                const newOffers = [...settings.wheelOffers];
                                                                newOffers[index].color = e.target.value;
                                                                setSettings({ ...settings, wheelOffers: newOffers });
                                                            }}
                                                            className="w-6 h-6 border-0 cursor-pointer p-0 bg-transparent rounded"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] text-gray-400">Text</span>
                                                        <input
                                                            type="color"
                                                            value={offer.textColor}
                                                            onChange={(e) => {
                                                                const newOffers = [...settings.wheelOffers];
                                                                newOffers[index].textColor = e.target.value;
                                                                setSettings({ ...settings, wheelOffers: newOffers });
                                                            }}
                                                            className="w-6 h-6 border-0 cursor-pointer p-0 bg-transparent rounded"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
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
