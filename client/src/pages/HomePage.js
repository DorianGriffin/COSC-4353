import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Volunteer Connect</h1>
      <p className="text-lg text-gray-600 mb-8">
        A platform to match passionate volunteers with impactful events.
      </p>

      <div className="flex space-x-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default HomePage;