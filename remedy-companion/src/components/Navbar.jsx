import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/flashcards" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="icon">📇</span>
        <span className="label">Cards</span>
      </NavLink>
      <NavLink to="/quiz" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="icon">🧠</span>
        <span className="label">Quiz</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="icon">🔍</span>
        <span className="label">Search</span>
      </NavLink>
      <NavLink to="/compare" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="icon">⚖️</span>
        <span className="label">Compare</span>
      </NavLink>
      <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="icon">📝</span>
        <span className="label">Notes</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;
