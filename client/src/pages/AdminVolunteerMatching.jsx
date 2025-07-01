"use client"
/*
Purpose: Admins view and match volunteers to events
Elements:
Auto-generated card UI listing events with brief summary and all volunteers matched to it listed below
Manual override volunteer option
Manual add volunteer option
Send message to all users assigned under events, i.e. each event box will have a ‘message users’ option that the admin can create a custom message for
Cancel event option, auto sends a message to assigned users
*/
import React from 'react'
import {useState, useEffect } from 'react'
import './AdminEventManagement.css'
import { useNavigate } from "react-router-dom"

const AdminVolunteerMatching  = () =>  {

      const [events, setEvents] = useState([])
      const [showForm, setShowForm] = useState(false)
      const [editingEvent, setEditingEvent] = useState(null)
      const [message, setMessage] = useState("")
      const [isLoading, setIsLoading] = useState(false)

      const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        city: "",
        state: "",
        zip: "",
        required_skills: [],
        urgency_level: "",
        start_datetime: "",
        end_datetime: "",
      });

    const SERVER_URL = "http://localhost:8080"

    const navigate = useNavigate();
    return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
            <div className="logo">VolunteerApp</div>
            <div className="nav-links">
            <button className="nav-button active" onClick={() => navigate('/adminvolunteermatching') }>Volunteer Matching</button>
            <button className="nav-button" onClick={() => navigate('/login')}>Login</button>
            <button className="nav-button" onClick={() => navigate('/admin')}>Admin</button>
            <button className="nav-button primary" onClick={() => navigate('/login')}>Get Started</button>
            </div>
        </nav> 
      </div>
    );
};
export default AdminVolunteerMatching