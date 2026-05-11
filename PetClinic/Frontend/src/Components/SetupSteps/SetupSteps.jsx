import style from './SetupSteps.module.css'
import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import phase1 from '../../../Images/Steps Section/FirstPhonew=480.png'
import phase2 from '../../../Images/Steps Section/secPhoneW=480.png'
import phase3 from '../../../Images/Steps Section/thirdPhoneW=500.png'
import firstArrow from '../../../Images/Steps Section/firstArrow.svg'
import secArrow from '../../../Images/Steps Section/secArrow.svg'
import waves from '../../../Images/Waves/w=2500.svg'
import bubble1 from '../../../Images/Bubbles/Bubble1Width=30.svg'
import bubble2 from '../../../Images/Bubbles/bubble2W=30.svg'
import dog from '../../../Images/Steps Section/dog.svg'
import catInTheMiddle from '../../../Images/Steps Section/middleCat.svg'
import rightDog from '../../../Images/Steps Section/rightDog.svg'
import duk from '../../../Images/Steps Section/duk.svg'

export default function SetupSteps () {
  const steps = [
    { img: phase1, label: 'Sign up', number: '01' },
    { img: phase2, label: 'Add your services', number: '02' },
    { img: phase3, label: 'Receive Orders', number: '03' }
  ]

  return (
    <section className='bg-[#EBF2F9] pt-8'>
      <motion.p
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className='mb-10 px-12 font-bold text-[#265EAE] text-2xl uppercase'
      >
        3 Easy Steps to Get Started
      </motion.p>

      <div className='flex md:flex-row flex-col justify-center items-center gap-0 overflow-hidden'>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.2 }}
              viewport={{ once: false }}
              className='flex flex-col items-center px-4 text-center'
            >
              {/* Image */}
              <img src={step.img} alt={step.label} className='mb-4 w-[220px]' />

              {/* Number */}
              <motion.p
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.2 }}
                viewport={{ once: false }}
                className='font-bold text-[#46CEAC] text-lg'
              >
                {step.number}
              </motion.p>

              {/* Label */}
              <motion.button className='my-3 px-4 py-1 border-[#629cff] border-2 border-solid rounded-2xl font-semibold text-[#265EAE] text-lg'>
                {step.label}
              </motion.button>
            </motion.div>

            {/* Arrow */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2, delay: index * 0.2 + 0.4 }}
                viewport={{ once: false }}
                className='hidden md:flex flex-shrink-0 items-center mb-10 px-2 origin-left'
              >
                <img
                  src={index === 0 ? firstArrow : secArrow}
                  alt='arrow'
                  className='w-[160px]'
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* waves */}
      <div className='hidden md:block relative w-full min-h-[250px] overflow-hidden waves'>
        <img
          src={waves}
          alt='waves img'
          className='bottom-0 left-0 z-10 absolute w-full min-h-[250px]'
        />

        {/* Animals */}
        <div className='z-0 absolute inset-0'>
          <img
            src={dog}
            alt=''
            className='left-[10%] absolute w-[110px] min-h-[50px] animalAnimation'
          />
            <img
              src={catInTheMiddle}
              alt=''
              className='top-12 left-[45%] absolute w-[110px] min-h-[50px] animalAnimation'
            />
          <img
            src={rightDog}
            alt=''
            className='top-16 right-[10%] absolute w-[110px] min-h-[50px] animalAnimation'
          />

        </div>

          <img src={duk} alt="" className='bottom-0 z-10 absolute animationDuk' />
      </div>
    </section>
  )
}
