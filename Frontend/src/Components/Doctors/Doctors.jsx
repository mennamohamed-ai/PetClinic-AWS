import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])

  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [animal, setAnimal] = useState('')
  const [price, setPrice] = useState('')
  const [available, setAvailable] = useState('')

  async function getDoctors() {
    try {
      let { data } = await axios.get("http://localhost:9090/api/vets")
      setDoctors(data)
      setFilteredDoctors(data)
      console.log(data);
      
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getDoctors()
  }, []);

  useEffect(() => {
    let result = doctors.filter((doc) => {
      return (
        doc.name.toLowerCase().includes(search.toLowerCase()) &&
        (city ? doc.city === city : true) &&
        (animal ? doc.animalType === animal : true) &&
        (price ? doc.consultationFee <= price : true) &&
        (available !== '' ? doc.available === (available === 'true') : true)
      )
    })

    setFilteredDoctors(result)
  }, [search, city, animal, price, available, doctors])

  return (
    <div className='bg-[#F4F8FF] p-6 min-h-screen'>
      <h2 className='mb-6 font-bold text-3xl'> Doctors</h2>

      <div className='gap-3 grid md:grid-cols-5 mb-8'>
        <input
          type='text'
          placeholder='Search by name'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='p-2 border rounded'
        />

        <select onChange={(e) => setCity(e.target.value)} className='p-2 border rounded'>
          <option value=''>All Cities</option>
          <option value='Cairo'>Cairo</option>
          <option value='Giza'>Giza</option>
          <option value='Alexandria'>Alexandria</option>
        </select>

        <select onChange={(e) => setAnimal(e.target.value)} className='p-2 border rounded'>
          <option value=''>Animal</option>
          <option value='CAT'>Cat</option>
          <option value='DOG'>Dog</option>
          <option value='BIRD'>Bird</option>
        </select>

        <input
          type='number'
          placeholder='Max Price'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className='p-2 border rounded'
        />

        <select onChange={(e) => setAvailable(e.target.value)} className='p-2 border rounded'>
          <option value=''>Availability</option>
          <option value='true'>Available</option>
          <option value='false'>Not Available</option>
        </select>
      </div>

      {/*  DOCTORS CARDS */}
      <div className='gap-6 grid md:grid-cols-3'>
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div key={doc.id} className='bg-white shadow hover:shadow-lg p-5 rounded-2xl transition'>
              
              {/* HEADER */}
              <div className='flex justify-between items-center mb-2'>
                <h3 className='font-bold text-xl'>{doc.name}</h3>
                <span className='text-yellow-500'>⭐ {doc.rating}</span>
              </div>

              {/* SPECIALIZATION */}
              <p className='font-semibold text-[#3276BD]'>{doc.specialization}</p>

              {/* INFO */}
              <div className='space-y-1 mt-2 text-gray-600 text-sm'>
                <p> {doc.city} - {doc.address}</p>
                <p> Animal: {doc.animalType}</p>
                <p> Fee: {doc.consultationFee} EGP</p>
                <p> Experience: {doc.experienceYears} years</p>
                <p> Available Days: {doc.availableDays}</p>
              </div>

              {/* BIO */}
              <p className='mt-3 text-gray-500 text-sm'>{doc.bio}</p>

              {/* STATUS */}
              <div className='mt-4 overflow-hidden'>
                {doc.available ? (
                  <span className='bg-green-100 px-3 py-1 rounded-full text-green-600 text-xs'>
                    Available
                  </span>
                ) : (
                  <span className='bg-red-100 px-3 py-1 rounded-full text-red-600 text-xs'>
                    Not Available
                  </span>
                )}
              </div>

              {/* ACTION */}
               <Link to={`/BookingAppointment/${doc.id}`}><button className='bg-[#5badfe] hover:bg-[#43a1ff] mt-4 py-2 rounded-xl w-full text-white'>
                Book Appointment
              </button></Link>
            </div>
          ))
        ) : (
          <p>No doctors found</p>
        )}
      </div>
    </div>
  )
}