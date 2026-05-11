import { Outlet } from 'react-router-dom'
import Footer from '../Footer/Footer'
import Navbar from '../Navbar/Navbar'
import style from'./Layout.module.css'
import React from 'react'

export default function Layout() {
  return (
    <>
      <div>
      <Navbar/>
      <div className="mt-0">
        <Outlet></Outlet>
      </div>
      <Footer/>
    </div>
    </>
  )
}