import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Components/Home/Home'
import Doctors from './Components/Doctors/Doctors'
import Login from './Components/Login/Login'
import Patient from './Components/Patient/Patient'
import Register from './Components/Register/Register'
import Layout from './Components/Layout/Layout'
import BookingAppointment from './Components/BookingAppointment/BookingAppointment'
import MyAppointments from './Components/MyAppointments/MyAppointments'
import NotFoundPage from './Components/NotFoundPage/NotFoundPage'
import DoctorHome from './Components/DoctorHome/DoctorHome'
import UserContextProvider from './Context/UserContext'
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute'
import { Toaster } from 'react-hot-toast'
import Profile from './Components/Profile/Profile'
import Admin from './Components/Admin/Admin'
import Receptionist from "./Components/Receptionist/Receptionist";



function App () {
  let router = new createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: '/DoctorHome', element: <ProtectedRoute><DoctorHome /></ProtectedRoute> },
        { path: 'Doctors', element: <ProtectedRoute><Doctors /> </ProtectedRoute>},
        { path: 'Login', element: <Login /> },
        { path: 'patient', element: <ProtectedRoute><Patient /></ProtectedRoute>},
        { path: 'register', element: <Register /> },
        { path: 'BookingAppointment', element: <ProtectedRoute><BookingAppointment /></ProtectedRoute>},
        { path: 'BookingAppointment/:vetId', element: <ProtectedRoute><BookingAppointment /></ProtectedRoute>},
        { path: 'MyAppointments', element: <ProtectedRoute><MyAppointments /></ProtectedRoute>},
        { path: 'profile', element: <ProtectedRoute><Profile /></ProtectedRoute>},
        { path: '*', element: <NotFoundPage /> },
        { path: 'admin', element: <ProtectedRoute><Admin /></ProtectedRoute> },
        { path: 'receptionist', element: <ProtectedRoute><Receptionist/></ProtectedRoute> }
      ]
    }
  ])

  return (
    <>
      <UserContextProvider>
        <RouterProvider router={router}></RouterProvider>
        <Toaster/>
      </UserContextProvider>
    </>
  )
}

export default App
