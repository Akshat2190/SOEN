import React, { useContext, useEffect, useState } from 'react'
import UserContext from '../context/user.context.jsx'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'

const UserAuth = ({children}) => {

    const { user, setUser } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        if (user) {
            setLoading(false);
            return;
        }

        axios.get('/users/profile')
            .then((res) => {
                setUser(res.data.user);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
            });
    }, [user, setUser, navigate])

    if (loading) {
        return <div>Loading...</div>;
    }
    
  return (
    <>
        {children}
    </>
  )
}

export default UserAuth
