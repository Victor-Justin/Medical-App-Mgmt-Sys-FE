import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import aboutImage from "../assets/Images/about.avif";

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen">

      <Navbar />

      <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-16">

        <div className="md:w-1/3 text-center md:text-left">
          <h1 className="text-5xl font-bold mb-6 text-gray-800 leading-tight">
            About <span className="text-primary">Medi-Track</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Medi-Track is a modern healthcare appointment and management platform designed to connect patients and doctors efficiently. 
            Our mission is to simplify healthcare management by providing intuitive, reliable, and accessible tools for everyone.
          </p>
          <Link to="/register">
            <button className="btn bg-primary text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-all">
              Get Started
            </button>
          </Link>
        </div>


        <div className="md:w-2/3 mt-10 md:mt-0 md:pl-8">
          <img
            src={aboutImage}
            alt="About Medi-Track"
            className="rounded-lg shadow-xl w-full h-auto object-cover"
          />
        </div>
      </div>


      <div className="bg-gray-50 py-16 px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-12">What We Offer</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="p-8 bg-white rounded-xl shadow hover:shadow-lg transition">
            <div className="text-5xl text-primary mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Appointment Scheduling</h3>
            <p className="text-gray-500">Book consultations and checkups with top specialists effortlessly.</p>
          </div>

          <div className="p-8 bg-white rounded-xl shadow hover:shadow-lg transition">
            <div className="text-5xl text-primary mb-4">💊</div>
            <h3 className="text-xl font-semibold mb-2">Prescriptions & Records</h3>
            <p className="text-gray-500">Securely access your medical records and prescriptions anytime.</p>
          </div>

          <div className="p-8 bg-white rounded-xl shadow hover:shadow-lg transition">
            <div className="text-5xl text-primary mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Seamless Payments</h3>
            <p className="text-gray-500">Pay for appointments and treatments directly through our portal.</p>
          </div>
        </div>
      </div>


      <div className="text-center py-16 bg-primary text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg mb-6">Create an account today and experience hassle-free healthcare management.</p>
        <Link to="/register">
          <button className="btn bg-white text-primary px-8 py-3 rounded-full hover:bg-gray-200 transition">
            Sign Up Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
