import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar bg-white shadow-sm px-6">
      <div className="flex-1">
        <Link to="/" className="text-2xl font-bold text-primary">
          Medi-Track
        </Link>
      </div>
      <div className="flex gap-4">
        <Link to="/" className="text-gray-600 hover:text-primary font-medium">
          Home
        </Link>
        <Link to="/about" className="text-gray-600 hover:text-primary font-medium">
          About
        </Link>
        <Link to="/login">
          <button className="btn btn-sm bg-primary text-white rounded-full hover:bg-purple-700">
            Login
          </button>
        </Link>
              <Link to="/register">
          <button className="btn btn-sm bg-primary text-white rounded-full hover:bg-purple-700">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
