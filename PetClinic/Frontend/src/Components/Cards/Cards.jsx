import style from './Cards.module.css'
import React from 'react'
import card1 from '../../../Images/Dog Cards/cardDog1.svg'
import card2 from '../../../Images/Dog Cards/cardDog2.svg'
import card3 from '../../../Images/Dog Cards/cardDog3.svg'
import card4 from '../../../Images/Dog Cards/cardDog4.svg'
import card5 from '../../../Images/Dog Cards/cardDog5.svg'
import { motion } from 'framer-motion'

export default function Cards () {
  const cards = [
    {
      img: card1,
      title: 'Booking automation',
      text: 'Forget about constant phone calls and manual entries. Now, your customers can book services online at any convenient moment.',
      bg: '#EADFE7',
      rotate: -3
    },
    {
      img: card2,
      title: 'Convenient bookings management',
      text: 'All bookings are gathered in one place, which makes it easy to track each booking and avoid any misunderstandings.',
      bg: '#FCEBDF',
      rotate: 2
    },
    {
      img: card3,
      title: 'Improved customer experience',
      text: 'Customers value convenience and speed. They can choose free slots, receive reminders about their visits, and rest assured that their pets will always receive the attention they deserve.',
      bg: '#F1FFCA',
      rotate: -2
    },
    {
      img: card4,
      title: 'Integration with social networks',
      text: 'Attract more customers through integration with your social networks. Promote your services and enable customers to book a visit directly through your Instagram or Facebook pages.',
      bg: '#FFFDEE',
      rotate: 3
    },
    {
      img: card5,
      title: 'Effective resource management',
      text: 'Manage your staff workloads effectively by optimizing work schedules and managing the client base to allocate resources and prevent overload.',
      bg: '#FCEBDF',
      rotate: -1
    }
  ]

  return (
    <div className='right'>
      <motion.div className='flex flex-row gap-4 overflow-hidden'>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            style={{
              backgroundColor: card.bg
            }}
            initial={{ rotate: card.rotate }}
            animate={{ rotate: card.rotate }}
            className='p-4 rounded-2xl w-[360px]'
          >
            <img src={card.img} alt={card.title} className='mb-3' />

            <h3 className='mb-2 font-bold text-lg'>{card.title}</h3>

            <p className='text-sm'>{card.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
