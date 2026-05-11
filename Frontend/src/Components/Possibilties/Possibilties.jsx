import style from './Possibilties.module.css'
import React from 'react'
import dogImg from '../../../Images/imageDog.svg'
import { motion } from 'framer-motion'
import Cards from '../Cards/Cards'

export default function Possibilties () {
  return (
    <>
      <section className='bg-[#46CEAC] mt-[-24px] px-12 py-6 rounded-t-[40px]'>
        <p className={`text-white font-bold my-4 text-xl`}>New Possibilities for You</p>

        <section className='hidden xl:flex xl:flex-row'>
          <div className='left overflow-hidden'>
            <img
              src={dogImg}
              alt='dog img'
              className={`md:w-[370px] md:h-[430px] ${style.dogAnimate} w- `}
            />
          </div>

          {/* cards */}
          <Cards />
        </section>
      </section>
    </>
  )
}
