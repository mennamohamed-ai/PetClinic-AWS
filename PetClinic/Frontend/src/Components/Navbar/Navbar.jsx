import React, { useContext, useState } from 'react'
import logo from '../../../Images/Logo/Logo.svg'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import style from './Navbar.module.css'
import { UserContext } from '../../Context/UserContext'

export default function Navbar () {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { UserData, setUserData, setUserName, setUserPhone, setUserID, userRole, setUserRole } = useContext(UserContext)

  function LogOut () {
    ['userToken','userName','userPhone','userID','userRole'].forEach(k => localStorage.removeItem(k))
    setUserData(null); setUserName(null); setUserPhone(null); setUserID(null); setUserRole(null)
    navigate('/Login')
  }

  function getLinks (closeSidebar = false) {
    const close = closeSidebar ? () => setIsOpen(false) : undefined
    if (!UserData) return (
      <>
        <li><NavLink to='/Login'    onClick={close}>Log in</NavLink></li>
        <li><NavLink to='/register' onClick={close}>Register</NavLink></li>
      </>
    )
    const profile = <li key='p'><NavLink to='/profile' onClick={close}>Profile</NavLink></li>
    const logout  = <li key='l' onClick={() => { LogOut(); close?.() }} className='cursor-pointer'><NavLink to='/Login'>Logout</NavLink></li>
    const byRole = {
      ADMIN:        [<li key='a'><NavLink to='/admin'        onClick={close}>Admin Dashboard</NavLink></li>],
      VET:          [<li key='d'><NavLink to='/DoctorHome'   onClick={close}>Dashboard</NavLink></li>,
                     <li key='pt'><NavLink to='/patient'     onClick={close}>My Patients</NavLink></li>],
      RECEPTIONIST: [<li key='r'><NavLink to='/receptionist' onClick={close}>Dashboard</NavLink></li>],
      PET_OWNER:    [<li key='doc'><NavLink to='/doctors'            onClick={close}>Doctors</NavLink></li>,
                     <li key='bk'><NavLink to='/bookingAppointment' onClick={close}>Booking</NavLink></li>,
                     <li key='my'><NavLink to='/MyAppointments'     onClick={close}>My Appointments</NavLink></li>],
    }
    return <>{...(byRole[userRole] || [])}{profile}{logout}</>
  }

  return (
    <section>
      <nav className='z-50 flex justify-between items-center bg-[#3276BD] px-6 py-3'>
        <div><Link to='/'><img src={logo} alt='Logo' /></Link></div>
        <ul className={`hidden md:flex gap-6 font-semibold text-white ${style.Items}`}>{getLinks()}</ul>
        <div className='md:hidden text-white'>
          <button onClick={() => setIsOpen(true)}><i className='text-2xl fa-solid fa-bars'></i></button>
        </div>
        {isOpen && <div className='fixed inset-0 bg-black/50' onClick={() => setIsOpen(false)}></div>}
        <div className={`z-50 fixed top-0 right-0 h-full w-[70%] bg-[#3276BD] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex justify-end p-4 text-white'>
            <button onClick={() => setIsOpen(false)}><i className='text-2xl fa-solid fa-xmark'></i></button>
          </div>
          <ul className='flex flex-col items-center gap-6 mt-10 text-white text-lg'>{getLinks(true)}</ul>
        </div>
      </nav>
    </section>
  )
}