import heroImage from "../assets/Images/landingpage.jpg";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen">

      <Navbar />


      <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-16">
        

        <div className="md:w-1/3 text-center md:text-left">
          <h1 className="text-5xl font-bold mb-6 text-gray-800 leading-tight">
            Discover how <span className="text-primary">Medi-Track</span> empowers your health
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Book appointments, view prescriptions, and track your health effortlessly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/register">
              <button className="btn bg-primary text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-all">
                Get Started
              </button>
            </Link>
            <Link to="/about">
              <button className="btn bg-white border border-primary text-primary px-8 py-3 rounded-full hover:bg-gray-100 transition-all">
                Learn More
              </button>
            </Link>
          </div>
        </div>


        <div className="md:w-2/3 mt-10 md:mt-0 md:pl-8">
          <img
            src={heroImage}
            alt="Healthcare professional"
            className="rounded-xl shadow-xl w-full h-auto object-cover"
          />
        </div>
      </div>


      <div className="flex justify-center border-b border-gray-300">
        <button className="text-primary font-medium border-b-2 border-primary py-2 px-4">
          Benefits
        </button>
      </div>


      <div className="text-center p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Why choose Medi-Track?</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div>
            <div className="text-primary text-5xl mb-4">📅</div>
            <h3 className="font-semibold mb-2">Appointment Booking</h3>
            <p className="text-gray-500">Schedule consultations and checkups with ease, anytime.</p>
          </div>
          <div>
            <div className="text-primary text-5xl mb-4">📄</div>
            <h3 className="font-semibold mb-2">Access Prescriptions</h3>
            <p className="text-gray-500">View and manage your prescriptions securely online.</p>
          </div>
          <div>
            <div className="text-primary text-5xl mb-4">💳</div>
            <h3 className="font-semibold mb-2">Online Payments</h3>
            <p className="text-gray-500">Pay for consultations and treatments through the portal.</p>
          </div>
          <div>
            <div className="text-primary text-5xl mb-4">🩺</div>
            <h3 className="font-semibold mb-2">Doctor Portal</h3>
            <p className="text-gray-500">Doctors manage appointments, records, and consult patients.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
