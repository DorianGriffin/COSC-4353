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
import './AdminVolunteerMatching.css'
import { useNavigate } from "react-router-dom"

const AdminVolunteerMatching  = ({ }) =>  {
    const SERVER_URL = "http://localhost:8080";

    const navigate = useNavigate();

    return (
      
    <><div className="home-container">
        {/* Navigation */}
        <nav className="navbar">
          <div className="logo">VolunteerApp</div>
          <div className="nav-links">
            <button className="nav-button active" onClick={() => navigate('/adminvolunteermatching')}>Volunteer Matching</button>
            <button className="nav-button" onClick={() => navigate('/login')}>Login</button>
            <button className="nav-button" onClick={() => navigate('/admin')}>Admin</button>
            <button className="nav-button primary" onClick={() => navigate('/login')}>Get Started</button>
          </div>
        </nav>
      </div>
    {/*Below is the UI for the Card*/}
    <div style={styles.card}>
      <center><h2 style={styles.title}>{"Event Matching"}</h2></center>
       <br/>
      <br/>
      <p style={styles.description}>{"Find Events Here."}</p>
      {/*List of Events*/}
      <p>
          {/*Collect the list of events here*/}
          <select name="events_list" id="events_list">
          <option value="Event_1" disabled>Event 1</option>
          <option value="Event_2">Event 2</option>
          <option value="Events_3">Event 3</option>
          <option value="Events_4" selected>Event 4</option>
</select>

      </p>

      <div style={styles.buttonGroup}>
        <button className="nav-button" onClick={() => alert('Add volunteer logic here')}>Add Volunteer</button>
        <button className="nav-button" onClick={() => alert('Override volunteer logic here')}>Override Volunteer</button>
        <button className="nav-button" onClick={() => alert('Message This User')}>Message Users</button>
        <button className="nav-button" onClick={() => alert('Button to Cancel Event')}>Cancel Event</button>
      </div>
    </div>
      </>
    ); 
  }
const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    margin: 0
  },
  description: {
    color: '#555'
  },
  buttonGroup: {
    marginTop: 15,
    display: 'flex',
    gap: 10
  }
};

export default AdminVolunteerMatching