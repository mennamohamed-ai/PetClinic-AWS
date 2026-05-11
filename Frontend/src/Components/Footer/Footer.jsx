import style from './Footer.module.css'
import React from 'react'
import logo from '../../../Images/Logo/Logo.svg'
import visa from '../../../Images/Payment Services/Visa.svg'
import payment2 from '../../../Images/Payment Services/h=26.svg'

export default function Footer () {
  return (
    <>
      <footer className='bg-[#3984C6] px-6 py-4 w-full'>
        <div className='flex md:flex-row flex-col justify-between items-start gap-4 my-4 py-4 border-white border-b'>
          {/* first */}
          <div className='flex flex-col justify-center gap-2 text-white first'>
            <img
              src={logo}
              alt='logo img'
              className='my-6 w-[150px] h-[40px]'
            />
            <p className='font-medium text-[16px]'>
              online recording service and automation platform for the service
              sector
            </p>
            <p className='my-2 text-[20px]'>universityteam287@gmail.com</p>
          </div>
          {/* second */}
          <div className='flex flex-col justify-center gap-2 text-white sec'>
            <p className='my-6 font-bold text-[24px]'>Company</p>
            <p className='hover:font-medium hover:translate-x-2 hover:duration-100 hover:cursor-pointer hover:transform'>
              Updates
            </p>
            <p className='hover:font-medium hover:translate-x-2 hover:duration-100 hover:cursor-pointer hover:transform'>
              Terms and conditions
            </p>
            <p className='hover:font-medium hover:translate-x-2 hover:duration-100 hover:cursor-pointer hover:transform'>
              Privacy policies
            </p>
          </div>
          {/* third */}
          <div className='flex flex-col justify-center gap-2 text-white third'>
            <p className='my-6 font-bold text-[24px]'>Payment Services</p>
            <div className='flex flex-row justify-center items-center gap-4 paymentImgs'>
              <img src={visa} alt='visa img' />
              <img src={payment2} alt='payment img' />
            </div>
          </div>
        </div>

        {/* rights */}
        <div className='flex md:flex-row flex-col justify-between items-center text-white'>
          <p>© 2026 ZamovOnline. All rights reserved</p>

          {/* social icons */}
          <div className='flex flex-row gap-1 socialIcons'>
            <i className='p-1 rounded-full text-2xl fa-brands fa-facebook-f facebook'></i>
            <i className='p-1 rounded-full text-2xl fa-brands fa-instagram insta'></i>
            <i className='p-1 rounded-full text-2xl fa-brands fa-tiktok tiktok'></i>
            <i className='p-1 rounded-full text-2xl fa-brands fa-linkedin linked'></i>
          </div>
        </div>
      </footer>
    </>
  )
}
