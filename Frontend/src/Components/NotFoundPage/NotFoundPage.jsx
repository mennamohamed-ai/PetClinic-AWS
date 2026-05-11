import React from 'react'
import Rat from '../../../Images/NotFoundPage/Rat.svg'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function NotFoundPage () {
  return (
    <section className='bg-[#F4F8FF] px-12 py-6 w-full'>
      <div className='flex flex-col justify-center items-center overflow-hidden'>
        <div className='inline-block relative my-4 overflow-hidden'>
          <img
            src={Rat}
            alt='animated rat img'
            className='inset-x-1/2 ratAnimation'
            style={{
              position: 'absolute',
              width: '120px',
              zIndex: 10
            }}
          />

          <p className='overflow-hidden text-[#E8F1FB] text-9xl text-center'>
            404
          </p>
        </div>

        <button className='bg-[#FFF3E0] my-6 px-4 py-2 rounded-2xl font-medium text-[#B36B00] text-center'>
          Page not found
        </button>
        <p className='my-6 overflow-hidden font-semibold text-black text-3xl'>
          Oops! The page ran <span className='text-[#3276BD]'>off-leash</span>{' '}
          🐾
        </p>

        <div className='flex md:flex-row flex-col justify-center items-center gap-3 my-4 overflow-hidden'>
          <Link to={"/"}>
            <motion.button
              className='hover:bg-[#b4cbf3] px-4 py-2 border-2 border-black hover:border-[#629cff] hover:border-2 border-solid hover:border-solid rounded-xl min-w-[160px] overflow-hidden hover:text-white home'
              initial={{ x: -60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              viewport={{ once: Infinity }}
              whileTap={{ scale: 0.95 }}
            >
              <i className='mx-1 fa-regular fa-house'></i>
              <span>Go to home</span>
            </motion.button>
          </Link>
          <motion.button
            className='hover:bg-[#b4cbf3] px-4 py-2 border-2 border-black hover:border-[#629cff] hover:border-2 border-solid hover:border-solid rounded-xl min-w-[160px] overflow-hidden hover:text-white home'
            initial={{ x: 60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            viewport={{ once: Infinity }}
            whileTap={{ scale: 0.95 }}
          >
            <i className='mx-1 fa-solid fa-magnifying-glass'></i>
            <span>Search</span>
          </motion.button>
        </div>
      </div>
    </section>
  )
}
