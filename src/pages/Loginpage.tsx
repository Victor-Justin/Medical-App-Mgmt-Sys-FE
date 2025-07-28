import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { type AppDispatch } from "../features/store";
import { setCredentials } from "../features/userSlice";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa6";
import loginImage from "../assets/images/loginpage.jpg";
import Navbar from "../components/Navbar";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:6969/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;
      dispatch(setCredentials({ token, user }));

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="flex w-[90%] md:w-[80%] lg:w-[70%] h-[90vh] rounded-3xl overflow-hidden shadow-2xl">


        <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-center mb-10">MEDI-TRACK</h1>
          <h2 className="text-2xl font-bold mb-8 text-center">LOGIN</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <FaUser className="absolute top-3.5 left-4 text-gray-500" />
              <input
                name="email"
                type="email"
                placeholder="Username"
                onChange={handleChange}
                required
                className="pl-12 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <FaLock className="absolute top-3.5 left-4 text-gray-500" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="pl-12 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition"
            >
              {isLoading ? "Logging in..." : "Login Now"}
            </button>

            {message && (
              <p className="text-center text-sm text-red-600">{message}</p>
            )}

            <div className="border-t pt-4">
              <p className="text-center font-medium text-gray-700">Login with Others</p>
              <div className="space-y-3 mt-4">
                <button
                  type="button"
                  className="flex items-center gap-3 justify-center border w-full py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <FcGoogle className="text-2xl" />
                  <span className="font-medium">Login with Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-3 justify-center border w-full py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <FaFacebookF className="text-xl text-blue-600" />
                  <span className="font-medium">Login with Facebook</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="hidden md:flex w-1/2 flex-col bg-gradient-to-tr from-purple-600 to-purple-800 text-white">

          <div className="flex-1 overflow-hidden">
            <img
              src={loginImage}
              alt="login illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginPage;
