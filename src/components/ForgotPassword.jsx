import { useState } from 'react';
import { sendOtp, resetPassword } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await sendOtp(email);
      setMessage('OTP sent to your email');
      toast.success('OTP sent to your email')
      setStep(2);
    } catch (err) {
      setMessage(err.message);
      console.log(err.message);
      
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      setMessage('Password reset successful. You can now log in.');
      toast.success('Password reset successful. You can now log in.')
      navigate('/login')
      setOtp('');
      setNewPassword('');
    } catch (err) {
        console.log(err.message);
      setMessage(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side image */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url('/login-side.png')` }}
      ></div>

      {/* Right side form */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-gray-50">
        <div className="max-w-md w-full px-5">
          <h2 className="text-3xl font-semibold text-center mb-6 text-[#42427D]">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h2>

          {message && (
            <p className="mb-4 text-sm text-center text-gray-600 bg-gray-100 p-2 rounded">
              {message}
            </p>
          )}

          {step === 1 && (
            <>
              <label className="block mb-1 text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#42427D]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                onClick={handleSendOtp}
                className="mt-4 w-full bg-[#42427D] text-white py-2 rounded hover:bg-[#33336a] transition"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Remember your password?{' '}
                <a href="/login" className="text-[#42427D] hover:underline">Login</a>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <label className="block mb-1 text-gray-700 mt-4">OTP</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#42427D]"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <label className="block mb-1 text-gray-700 mt-4">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#42427D]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <button
                onClick={handleResetPassword}
                className="mt-4 w-full bg-[#42427D] text-white py-2 rounded hover:bg-[#33336a] transition"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                onClick={() => setStep(1)}
                className="mt-4 w-full text-sm text-[#42427D] hover:underline"
              >
                Back to Email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
