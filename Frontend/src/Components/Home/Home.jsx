import React from 'react'
import laptop from '../../../Images/Laptop/w=1640.png'
import rightPaw from '../../../Images/Right and left paws/RightH=20.svg'
import leftPaw from '../../../Images/Right and left paws/leftH=20.svg'
import imgCat from '../../../Images/cat.svg'
import style from './Home.module.css'
import heartPaw from '../../../Images/heartWithPaw.svg'
import circles from '../../../Images/circles.svg'
import { motion } from 'framer-motion'
import lightPaw from '../../../Images/LightPaw/paw.svg'
import { Link } from 'react-router-dom'
import Possibilties from '../Possibilties/Possibilties'
import SetupSteps from '../SetupSteps/SetupSteps'

export default function Home () {
  return (
    <>
      <section className='flex flex-col justify-center items-center gap-6 bg-[#3276BD] p-6 w-full min-h-screen overflow-hidden text-white'>
        {/* laptop + paws + cat */}
        <div className='relative w-full md:w-1/2 overflow-hidden'>
          {/* paws + cat */}
          <div className='top-0 right-0 z-10 absolute flex items-end gap-1 md:gap-2 pt-1 pr-12 md:pr-0 overflow-hidden'>
            <img
              src={rightPaw}
              className='w-[30px] md:w-[8%]'
              alt='Right paw of the cat'
            />

            <img
              src={imgCat}
              className='float-cat w-[60px] md:w-[20%]'
              alt='header of the cat'
            />

            <img
              src={leftPaw}
              className='w-[30px] md:w-[8%]'
              alt='left paw of the cat'
            />
          </div>

          {/* laptop */}
          <img
            src={laptop}
            alt='laptop img'
            className='z-20 relative w-full h-full object-cover'
          />
        </div>
        {/* text */}
        <div className='md:p-0 px-6 text'>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-[32px] text-white ${style.Automate} whitespace-nowrap`}
          >
            Automate your pet grooming
          </motion.p>
          {/* heartpaw+text */}
          <div className='flex flex-row gap-2 overflow-hidden i heartPaw'>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`text-[32px] text-white ${style.Automate} whitespace-nowrap`}
            >
              business with <span className='font-bold'>ZamovOnline</span>
            </motion.p>
            <img
              src={heartPaw}
              alt='heart paw img'
              className='w-[40px] md:w-auto'
            />
          </div>
        </div>
        {/* circles */}
        <div className='right-0 absolute circle'>
          <img src={circles} alt='circles image' />
        </div>
        {/* btn */}
        <Link to={"/register"}>
          <motion.button
            whileHover='hover'
            className='flex justify-between items-center gap-3 bg-[#46CEAC] mb-8 px-12 py-2 rounded-2xl overflow-hidden font-bold text-[24px] text-white'
          >
            Sign Up
            <motion.img
              src={lightPaw}
              alt='paw'
              className='bg-white p-2 rounded-[50%] w-10 h-10'
            />
          </motion.button>
        </Link>
      </section>

      <Possibilties/>
      <SetupSteps/>
    </>
  )
}
