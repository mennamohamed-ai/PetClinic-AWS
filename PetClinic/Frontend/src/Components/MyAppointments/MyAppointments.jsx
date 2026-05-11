import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import style from './MyAppointments.module.css'

const API = 'http://localhost:9090/api'

export default function MyAppointments () {
  const { UserID } = useContext(UserContext)
  const [activeTab,    setActiveTab]    = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [invoices,     setInvoices]     = useState([])
  const [ownerId,      setOwnerId]      = useState(null)
  const [owner,        setOwner]        = useState(null)
  const [pets,         setPets]         = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [success,      setSuccess]      = useState(null)
  const [permissions,  setPermissions]  = useState({})

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '', city: '' })
  const [profileSaving, setProfileSaving] = useState(false)

  const [petForm, setPetForm] = useState({ name: '', type: 'DOG', breed: '', birthDate: '', gender: 'MALE', weight: '' })
  const [petSaving, setPetSaving] = useState(false)
  const [editingPetId, setEditingPetId] = useState(null)

  // Step 1: جيب الـ ownerId من userId
  useEffect(() => {
    async function loadOwner () {
      try {
        const { data } = await axios.get(`${API}/owners/me`, { withCredentials: true })
        setOwnerId(data.id)
        setOwner(data)
        setProfileForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || ''
        })
      } catch (err) {
        setError('Could not load owner profile.')
        setLoading(false)
      }
    }
    if (UserID) loadOwner()
  }, [UserID])

  useEffect(() => {
    async function fetchPermissions () {
      try {
        const { data } = await axios.get(`${API}/auth/me/permissions`, { withCredentials: true })
        setPermissions(data?.permissions || {})
      } catch (err) {
        setPermissions({})
      }
    }
    if (UserID) fetchPermissions()
  }, [UserID])

  // Step 2: جيب الـ appointments لما ownerId يتحدد
  useEffect(() => {
    if (ownerId) fetchAppointments()
  }, [ownerId])

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t) }
  }, [success])

  async function fetchPets () {
    if (!ownerId) return
    setLoading(true); setError(null)
    try {
      const { data } = await axios.get(`${API}/pets/owner/${ownerId}`, { withCredentials: true })
      setPets(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load pets.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchAppointments () {
    setLoading(true); setError(null)
    try {
      const { data } = await axios.get(`${API}/appointments/owner/${ownerId}`, { withCredentials: true })
      setAppointments(Array.isArray(data) ? data : [])
    } catch (err) { setError('Failed to load appointments.') }
    finally { setLoading(false) }
  }

  async function fetchInvoices () {
    setLoading(true); setError(null)
    try {
      const { data } = await axios.get(`${API}/invoices/owner/${ownerId}`, { withCredentials: true })
      setInvoices(Array.isArray(data) ? data : [])
    } catch (err) { setError('Failed to load invoices.') }
    finally { setLoading(false) }
  }

  async function payInvoice (id) {
    try {
      await axios.put(`${API}/invoices/${id}/pay`, {}, { withCredentials: true })
      setSuccess('✅ Payment successful!')
      fetchInvoices()
    } catch (err) { setError('Payment failed.') }
  }

  async function cancelAppointment (id) {
    try {
      await axios.put(`${API}/appointments/${id}/cancel`, {}, { withCredentials: true })
      setSuccess('✅ Appointment cancelled.')
      fetchAppointments()
    } catch (err) { setError('Could not cancel appointment.') }
  }

  async function saveProfile () {
    if (!owner) return
    setProfileSaving(true); setError(null)
    try {
      const { data } = await axios.put(`${API}/owners/me`, profileForm, { withCredentials: true })
      setOwner(data)
      setSuccess('✅ Profile updated.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function savePet (e) {
    e.preventDefault()
    if (!ownerId) return
    setPetSaving(true); setError(null)
    try {
      const payload = {
        ownerId,
        name: petForm.name,
        type: petForm.type,
        breed: petForm.breed,
        birthDate: petForm.birthDate,
        gender: petForm.gender,
        weight: parseFloat(petForm.weight)
      }
      if (editingPetId) {
        await axios.put(`${API}/pets/${editingPetId}`, payload, { withCredentials: true })
        setSuccess('✅ Pet updated.')
      } else {
        await axios.post(`${API}/pets`, payload, { withCredentials: true })
        setSuccess('✅ Pet added.')
      }
      setPetForm({ name: '', type: 'DOG', breed: '', birthDate: '', gender: 'MALE', weight: '' })
      setEditingPetId(null)
      fetchPets()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save pet.')
    } finally {
      setPetSaving(false)
    }
  }

  function startEditPet (p) {
    setEditingPetId(p.id)
    setPetForm({
      name: p.name || '',
      type: p.type || 'DOG',
      breed: p.breed || '',
      birthDate: p.birthDate || '',
      gender: p.gender || 'MALE',
      weight: String(p.weight ?? '')
    })
  }

  async function deletePet (id) {
    setError(null)
    try {
      await axios.delete(`${API}/pets/${id}`, { withCredentials: true })
      setSuccess('✅ Pet deleted.')
      fetchPets()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete pet.')
    }
  }

  function switchTab (tab) {
    setActiveTab(tab); setError(null)
    if (tab === 'appointments') fetchAppointments()
    if (tab === 'billing')      fetchInvoices()
    if (tab === 'profile')      fetchPets()
  }

  const tabs = [
    { key: 'appointments', label: '📅 My Appointments' },
    { key: 'billing',      label: '🧾 Billing' },
    { key: 'profile',      label: '👤 Profile & Pets' },
  ].filter(t => {
    const map = {
      appointments: 'OWNER_TAB_APPOINTMENTS',
      billing: 'OWNER_TAB_BILLING',
      profile: 'OWNER_TAB_PROFILE'
    }
    return permissions[map[t.key]] !== false
  })

  useEffect(() => {
    if (tabs.length && !tabs.some(t => t.key === activeTab)) {
      switchTab(tabs[0].key)
    }
  }, [permissions])

  return (
    <div className={style.page}>
      {/* Header */}
      <div className={style.header}>
        <h2 className='my-2 font-semibold text-xl'>My Account</h2>
        <p className='my-2 text-sm text-gray-500'>Manage your appointments and view invoices</p>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 mb-4 flex-wrap px-4'>
        {tabs.map(t => (
          <button key={t.key} onClick={() => switchTab(t.key)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition
              ${activeTab === t.key ? 'bg-[#3276BD] text-white' : 'bg-white border border-[#C5D8EE] text-[#4A6580] hover:bg-[#e8f1fb]'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.length === 0 && (
        <div className='mx-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-xl mb-4'>
          No dashboard sections are enabled for PET_OWNER.
        </div>
      )}

      {/* Notifications */}
      {error   && <div className='mx-4 bg-red-100 border border-red-400 text-red-600 px-4 py-2 rounded-xl mb-4'>{error}</div>}
      {success && <div className='mx-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-xl mb-4'>{success}</div>}

      {loading ? (
        <div className={style.loading}>Loading...</div>
      ) : (
        <>
          {/* ── APPOINTMENTS ── */}
          {activeTab === 'appointments' && (
            <>
              {appointments.length === 0 ? (
                <div className={style.empty}>No appointments found</div>
              ) : (
                <div className={style.grid}>
                  {appointments.map(app => (
                    <div key={app.id} className={style.card}>
                      <div className={style.topRow}>
                        <div>
                          <p className={style.subText}>Pet: <span>{app.petName}</span></p>
                        </div>
                        <span className={`${style.status} ${
                          app.status === 'CONFIRMED'  ? style.confirmed :
                          app.status === 'PENDING'    ? style.pending   :
                          (app.status === 'COMPLETED' || app.status === 'DONE') ? style.confirmed :
                          style.cancelled}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className={style.info}>
                        <p>Doctor: <span>{app.vetName}</span></p>
                        <p>Date: {app.appointmentDate}</p>
                        <p>Time: <span>{app.startTime} - {app.endTime}</span></p>
                        {app.reason && <p>Reason: {app.reason}</p>}
                      </div>
                      {app.status === 'PENDING' && (
                        <button onClick={() => cancelAppointment(app.id)}
                          className='mt-3 w-full bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold py-1.5 rounded-xl transition'>
                          ❌ Cancel Appointment
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── BILLING ── */}
          {activeTab === 'billing' && (
            <div className='px-4'>
              {invoices.length === 0 ? (
                <div className={style.empty}>No invoices found</div>
              ) : (
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {invoices.map(inv => (
                    <div key={inv.id} className='bg-white rounded-2xl shadow-sm border border-[#e8f1fb] p-5'>
                      <div className='flex justify-between items-start mb-3'>
                        <div>
                          <p className='font-bold text-gray-800 text-lg'>{inv.amount} EGP</p>
                          <p className='text-gray-400 text-xs'>Invoice #{inv.id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold
                          ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className='text-gray-500 text-sm'>📅 Issued: {inv.issuedAt?.substring(0,10)}</p>
                      {inv.paidAt && <p className='text-gray-500 text-sm'>✅ Paid: {inv.paidAt?.substring(0,10)}</p>}
                      {inv.status === 'UNPAID' && (
                        <button onClick={() => payInvoice(inv.id)}
                          className='mt-3 w-full bg-[#46CEAC] hover:bg-[#3ab99a] text-white font-bold py-2 rounded-xl transition text-sm'>
                          💳 Pay Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE & PETS ── */}
          {activeTab === 'profile' && (
            <div className='px-4 grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {/* Profile */}
              <div className='bg-white rounded-2xl shadow-sm border border-[#e8f1fb] p-5'>
                <h3 className='font-bold text-[#3276BD] text-lg mb-3'>Owner Profile</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {[
                    { label: 'Name', field: 'name' },
                    { label: 'Phone', field: 'phone' },
                    { label: 'City', field: 'city' },
                    { label: 'Address', field: 'address' },
                  ].map(({ label, field }) => (
                    <div key={field} className='flex flex-col gap-1'>
                      <label className='text-sm font-semibold text-[#4A6580]'>{label}</label>
                      <input
                        value={profileForm[field]}
                        onChange={e => setProfileForm({ ...profileForm, [field]: e.target.value })}
                        className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm'
                      />
                    </div>
                  ))}
                </div>
                <button onClick={saveProfile} disabled={profileSaving}
                  className='mt-4 bg-[#3276BD] hover:bg-[#255fa3] disabled:opacity-60 text-white font-bold px-5 py-2 rounded-xl transition'>
                  {profileSaving ? <i className='fa-solid fa-spinner fa-spin'></i> : 'Save Profile'}
                </button>
              </div>

              {/* Pets */}
              <div className='bg-white rounded-2xl shadow-sm border border-[#e8f1fb] p-5'>
                <h3 className='font-bold text-[#3276BD] text-lg mb-3'>My Pets</h3>

                <form onSubmit={savePet} className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Name</label>
                    <input value={petForm.name} onChange={e => setPetForm({ ...petForm, name: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Type</label>
                    <select value={petForm.type} onChange={e => setPetForm({ ...petForm, type: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm'>
                      {['DOG','CAT','BIRD','RABBIT'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Breed</label>
                    <input value={petForm.breed} onChange={e => setPetForm({ ...petForm, breed: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Birth Date</label>
                    <input type='date' value={petForm.birthDate} onChange={e => setPetForm({ ...petForm, birthDate: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Gender</label>
                    <select value={petForm.gender} onChange={e => setPetForm({ ...petForm, gender: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm'>
                      {['MALE','FEMALE'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Weight (kg)</label>
                    <input type='number' step='any' value={petForm.weight} onChange={e => setPetForm({ ...petForm, weight: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                  </div>
                  <div className='md:col-span-2 flex gap-2 mt-1'>
                    <button type='submit' disabled={petSaving}
                      className='bg-[#46CEAC] hover:bg-[#3ab99a] disabled:opacity-60 text-white font-bold px-5 py-2 rounded-xl transition'>
                      {petSaving ? <i className='fa-solid fa-spinner fa-spin'></i> : editingPetId ? 'Update Pet' : 'Add Pet'}
                    </button>
                    {editingPetId && (
                      <button type='button'
                        onClick={() => { setEditingPetId(null); setPetForm({ name: '', type: 'DOG', breed: '', birthDate: '', gender: 'MALE', weight: '' }) }}
                        className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-5 py-2 rounded-xl transition'>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className='mt-4 flex flex-col gap-2'>
                  {pets.length === 0 ? (
                    <p className='text-gray-400 text-sm'>No pets yet.</p>
                  ) : pets.map(p => (
                    <div key={p.id} className='flex items-center justify-between bg-[#F4F8FF] border border-[#C5D8EE] rounded-xl px-3 py-2'>
                      <div className='text-sm'>
                        <p className='font-bold text-gray-700'>{p.name} <span className='text-gray-400 font-normal'>({p.type})</span></p>
                        <p className='text-gray-500 text-xs'>{p.breed} • {p.gender} • {p.weight}kg</p>
                      </div>
                      <div className='flex gap-2'>
                        <button onClick={() => startEditPet(p)}
                          className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold'>
                          ✏️ Edit
                        </button>
                        <button onClick={() => deletePet(p.id)}
                          className='bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs font-bold'>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}