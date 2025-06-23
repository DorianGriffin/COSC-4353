import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">VolunteerApp</h1>
      </nav>

      <main className="p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to VolunteerApp</h2>
        <p className="text-gray-600 mb-4">
          Connect with your community, track your impact, and make a difference.
        </p>

        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Get Started
        </button>
      </main>

      <footer className="bg-gray-900 text-white p-4 text-center">
        <p>&copy; 2025 VolunteerApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
