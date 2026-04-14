import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { getUserRole } from './authRole'


export function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (location.pathname === "/signUp") {
            navigate('/signUp', { replace: true })
        }
        else if (!sessionStorage.getItem('auth')) {
            navigate('/login', { replace: true })
        }
        else {
            if (location.pathname === '/') {
                const role = getUserRole()
                if (role === 'admin') {
                    navigate('/HomeDashboard', { replace: true })
                } else {
                    navigate('/pos/sales', { replace: true })
                }
            }
        }
        // if (sessionStorage.getItem("item_key") === 'regular') {

        //     navigate('/', { replace: true })

        // }
    }, [location.pathname, navigate])



    return (
        <Outlet />
    )
}
