import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyUserMutation } from '../features/auth';

const VerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifyUser, { isLoading }] = useVerifyUserMutation();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stateEmail = (location.state as { email?: string })?.email;
    if (!stateEmail) {
      navigate('/register');
    } else {
      setEmail(stateEmail);
    }
  }, [location.state, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await verifyUser({ email, code }).unwrap();
      setMessage(res.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      console.error('Verification error:', err);
      setMessage(err?.data?.message || 'Verification failed.');
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <form
          onSubmit={handleVerify}
          className="card w-full max-w-md bg-base-100 shadow-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-6 text-center">
            Verify Your Account
          </h2>

          <input
            type="text"
            value={email}
            className="input input-bordered w-full mb-4"
            disabled
          />

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit Verification Code"
            className="input input-bordered w-full mb-6"
            required
          />

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>

          {message && (
            <div className="alert alert-info mt-4 text-center">{message}</div>
          )}
        </form>
      </div>
    </>
  );
};

export default VerifyPage;
