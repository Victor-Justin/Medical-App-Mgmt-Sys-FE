import { useState } from "react";
import { useRegisterUserMutation } from "../features/auth";
import { useNavigate } from "react-router-dom";
import { FaUser, FaPhone, FaEnvelope, FaLock } from "react-icons/fa";
import Navbar from "../components/Navbar";
import registerImage from "../assets/images/loginpage.jpg";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fName: "",
    lName: "",
    contactNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });

  const [message, setMessage] = useState("");
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const { confirmPassword, ...userData } = form;
      const res = await registerUser(userData).unwrap();
      setMessage(res.message);
      navigate("/verify", { state: { email: form.email } });
    } catch (err: any) {
      console.error("Registration error:", err);
      setMessage(err?.data?.message || "Registration failed.");
    }
  };

  return (<>

<Navbar/>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="flex w-[90%] md:w-[80%] lg:w-[70%] h-[90vh] rounded-3xl overflow-hidden shadow-2xl">

        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-center mb-8">MEDI-TRACK</h1>
          <h2 className="text-2xl font-bold mb-6 text-center">REGISTER</h2>

          <form onSubmit={handleRegister} className="space-y-4">

            <div className="relative">
              <FaUser className="absolute top-3.5 left-4 text-gray-500" />
              <input
                type="text"
                name="fName"
                value={form.fName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="pl-12 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <FaUser className="absolute top-3.5 left-4 text-gray-500" />
              <input
                type="text"
                name="lName"
                value={form.lName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="pl-12 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <FaPhone className="absolute top-3.5 left-4 text-gray-500" />
              <input
                type="text"
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                placeholder="Contact Number"
                required
                className="pl-12 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <FaEnvelope className="absolute top-3.5 left-4 text-gray-500" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="pl-12 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <FaLock className="absolute top-3.5 left-4 text-gray-500" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="pl-12 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <FaLock className="absolute top-3.5 left-4 text-gray-500" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="pl-12 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>

            {message && (
              <p className="text-center text-sm text-red-600">{message}</p>
            )}
          </form>
        </div>

        <div className="hidden md:flex w-1/2 flex-col bg-gradient-to-tr from-purple-600 to-purple-800 text-white">
          <div className="flex-1 overflow-hidden">
            <img
              src={registerImage}
              alt="register illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default RegisterPage;
