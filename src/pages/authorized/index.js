import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import SessionUserContext from '../../contexts/SessionUserContext';

// @Dawn -> This is just a temporary page to accept the user token.
const Authorized = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = new URLSearchParams(location.search).get('token');
    const { setUser } = useContext(SessionUserContext);
  
    useEffect(() => {
      setUser(token); // Receives the token and saves it to state.
      navigate('/'); // IMPORTANT! Redirect the user to whatever page it is after the token is received.
    }, [token]);
  
    return null; // This component does not need to return a UI
};

export default Authorized;