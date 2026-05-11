import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { UserContext } from '../../Context/UserContext'

const API = 'http://localhost:9090/api'

export default function BookingAppointment () {
  const { vetId } = useParams()
  const { UserID } = useContext(UserContext)

  const [owner,   setOwner]   = useState(null)
  const [pets,    setPets]    = useState([])
  const [loading, setLoading] = useState(true)
  const [errMsg,  setErrMsg]  = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [showPetForm, setShowPetForm] = useState(false)
  const [petForm, setPetForm] = useState({
    name: '',
    type: 'DOG',
    breed: '',
    birthDate: '',
    gender: 'MALE',
    weight: ''
  })
  const [petSaving, setPetSaving] = useState(false)

  const [formData, setFormData] = useState({
    petId: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    reason: ''
  })

  // Step 1: جيب الـ owner profile بتاع المستخدم الحالي
  useEffect(() => {
    async function loadOwnerAndPets () {
      try {
        setLoading(true)
        const ownerRes = await axios.get(`${API}/owners/me`, { withCredentials: true })
        setOwner(ownerRes.data)
        const petsRes = await axios.get(`${API}/pets/owner/${ownerRes.data.id}`, { withCredentials: true })
        setPets(petsRes.data)
        if (petsRes.data.length > 0)
          setFormData(prev => ({ ...prev, petId: String(petsRes.data[0].id) }))
      } catch (err) {
        setErrMsg('Could not load your profile. Please make sure you have an owner profile.')
      } finally {
        setLoading(false)
      }
    }
    if (UserID) loadOwnerAndPets()
  }, [UserID])

  async function refreshPets (ownerId) {
    const petsRes = await axios.get(`${API}/pets/owner/${ownerId}`, { withCredentials: true })
    setPets(petsRes.data)
    if (petsRes.data.length > 0) {
      setFormData(prev => ({ ...prev, petId: String(petsRes.data[0].id) }))
    }
  }

  async function submitPet (e) {
    e.preventDefault()
    if (!owner) return
    setPetSaving(true)
    setErrMsg(null)
    try {
      await axios.post(`${API}/pets`, {
        ownerId: owner.id,
        name: petForm.name,
        type: petForm.type,
        breed: petForm.breed,
        birthDate: petForm.birthDate,
        gender: petForm.gender,
        weight: parseFloat(petForm.weight)
      }, { withCredentials: true })
      toast.success('Pet added successfully!')
      setPetForm({ name: '', type: 'DOG', breed: '', birthDate: '', gender: 'MALE', weight: '' })
      setShowPetForm(false)
      await refreshPets(owner.id)
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add pet'
      setErrMsg(message)
      toast.error(message)
    } finally {
      setPetSaving(false)
    }
  }

  function handleChange (e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit (e) {
    e.preventDefault()
    setErrMsg(null)
    if (!owner) { setErrMsg('Owner profile not found.'); return }
    if (!formData.petId) { setErrMsg('Please select a pet.'); return }
    if (!vetId) { setErrMsg('No vet selected.'); return }

    try {
      setSubmitting(true)
      const payload = {
        ownerId: owner.id,
        petId: parseInt(formData.petId),
        vetId: parseInt(vetId),
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00',
        reason: formData.reason
      }
      await axios.post(`${API}/appointments`, payload, { withCredentials: true })
      toast.success('Appointment booked successfully!')
      setFormData({ petId: pets[0]?.id || '', appointmentDate: '', startTime: '', endTime: '', reason: '' })
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong'
      setErrMsg(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className='flex justify-center items-center min-h-screen'>
      <i className='fa-solid fa-spinner fa-spin text-3xl text-[#3276BD]'></i>
    </div>
  )

  return (
    <div className='flex flex-col justify-center items-center p-6 w-full min-h-screen bg-[#F4F8FF]'>
      <div className='bg-white rounded-2xl shadow-sm p-8 w-full max-w-lg'>
        <h2 className='mb-2 font-bold text-2xl text-[#3276BD]'>📅 Book Appointment</h2>
        {owner && (
          <p className='text-sm text-gray-500 mb-4'>
            Booking as: <span className='font-semibold text-gray-700'>{owner.name}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {/* Pet Select */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-semibold text-[#4A6580]'>Select Pet</label>
            {pets.length === 0 ? (
              <div className='flex flex-col gap-2'>
                <p className='text-orange-500 text-sm'>
                  ⚠️ You have no registered pets. Please add a pet first.
                </p>
                <button type='button'
                  onClick={() => setShowPetForm(v => !v)}
                  className='self-start bg-[#3276BD] hover:bg-[#255fa3] text-white font-bold px-4 py-2 rounded-xl text-sm transition'>
                  + Add Pet
                </button>
              </div>
            ) : (
              <select name='petId' value={formData.petId} onChange={handleChange}
                className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl
                           outline-none text-sm focus:ring-2 focus:ring-[#3276BD]'>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            )}
          </div>

          {showPetForm && (
            <div className='bg-[#F4F8FF] border border-[#C5D8EE] rounded-2xl p-4 flex flex-col gap-3'>
              <p className='font-bold text-[#3276BD]'>Add Pet</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold text-[#4A6580]'>Name</label>
                  <input value={petForm.name} onChange={e => setPetForm({ ...petForm, name: e.target.value })}
                    className='bg-white px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold text-[#4A6580]'>Type</label>
                  <select value={petForm.type} onChange={e => setPetForm({ ...petForm, type: e.target.value })}
                    className='bg-white px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm'>
                    {['DOG','CAT','BIRD','RABBIT'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold text-[#4A6580]'>Breed</label>
                  <input value={petForm.breed} onChange={e => setPetForm({ ...petForm, breed: e.target.value })}
                    className='bg-white px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold text-[#4A6580]'>Birth Date</label>
                  <input type='date' value={petForm.birthDate} onChange={e => setPetForm({ ...petForm, birthDate: e.target.value })}
                    className='bg-white px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold text-[#4A6580]'>Gender</label>
                  <select value={petForm.gender} onChange={e => setPetForm({ ...petForm, gender: e.target.value })}
                    className='bg-white px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm'>
                    {['MALE','FEMALE'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold text-[#4A6580]'>Weight (kg)</label>
                  <input type='number' step='any' value={petForm.weight}
                    onChange={e => setPetForm({ ...petForm, weight: e.target.value })}
                    className='bg-white px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                </div>
              </div>
              <div className='flex gap-2'>
                <button type='button' disabled={petSaving} onClick={submitPet}
                  className='bg-[#46CEAC] hover:bg-[#3ab99a] disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl text-sm transition'>
                  {petSaving ? <i className='fa-solid fa-spinner fa-spin'></i> : 'Save Pet'}
                </button>
                <button type='button' onClick={() => setShowPetForm(false)}
                  className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm transition'>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Date */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-semibold text-[#4A6580]'>Date</label>
            <input type='date' name='appointmentDate' value={formData.appointmentDate}
              onChange={handleChange} required
              className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl
                         outline-none text-sm focus:ring-2 focus:ring-[#3276BD]' />
          </div>

          {/* Time */}
          <div className='flex gap-3'>
            <div className='flex flex-col gap-1 flex-1'>
              <label className='text-sm font-semibold text-[#4A6580]'>Start Time</label>
              <input type='time' name='startTime' value={formData.startTime}
                onChange={handleChange} required
                className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl
                           outline-none text-sm focus:ring-2 focus:ring-[#3276BD]' />
            </div>
            <div className='flex flex-col gap-1 flex-1'>
              <label className='text-sm font-semibold text-[#4A6580]'>End Time</label>
              <input type='time' name='endTime' value={formData.endTime}
                onChange={handleChange} required
                className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl
                           outline-none text-sm focus:ring-2 focus:ring-[#3276BD]' />
            </div>
          </div>

          {/* Reason */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-semibold text-[#4A6580]'>Reason (optional)</label>
            <input type='text' name='reason' placeholder='e.g. Annual checkup'
              value={formData.reason} onChange={handleChange}
              className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl
                         outline-none text-sm focus:ring-2 focus:ring-[#3276BD]' />
          </div>

          {errMsg && (
            <div className='bg-red-50 p-3 border border-red-200 rounded-xl text-red-500 text-sm'>
              ⚠️ {errMsg}
            </div>
          )}

          <button type='submit' disabled={submitting || pets.length === 0}
            className='bg-[#46CEAC] hover:bg-[#3ab99a] disabled:opacity-50 py-2 rounded-xl
                       font-bold text-white transition'>
            {submitting ? <i className='fa-solid fa-spinner fa-spin'></i> : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}