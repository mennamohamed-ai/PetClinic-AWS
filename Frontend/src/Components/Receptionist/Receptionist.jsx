import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'

const API = 'http://localhost:9090/api'

export default function Receptionist () {
  const { userRole, UserData } = useContext(UserContext)
  const navigate = useNavigate()

  const [activeTab,    setActiveTab]    = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [owners,       setOwners]       = useState([])
  const [invoices,     setInvoices]     = useState([])
  const [vets,         setVets]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [success,      setSuccess]      = useState(null)
  const [search,       setSearch]       = useState('')
  const [permissions,  setPermissions]  = useState({})

  // Book appointment form
  const [showBookForm, setShowBookForm] = useState(false)
  const [bookForm, setBookForm]         = useState({ ownerId: '', petId: '', vetId: '', appointmentDate: '', startTime: '', endTime: '', reason: '' })
  const [ownerPets, setOwnerPets]       = useState([])
  const [bookLoading, setBookLoading]   = useState(false)

  // Invoice form
  const [showInvForm, setShowInvForm]   = useState(false)
  const [invForm, setInvForm]           = useState({ appointmentId: '', ownerId: '', amount: '' })
  const [invLoading, setInvLoading]     = useState(false)

  useEffect(() => {
    if (!UserData || userRole !== 'RECEPTIONIST') navigate('/Login')
  }, [UserData, userRole])

  useEffect(() => { fetchAppointments(); fetchVets() }, [])
  useEffect(() => {
    async function fetchPermissions () {
      try {
        const { data } = await axios.get(`${API}/auth/me/permissions`, { withCredentials: true })
        setPermissions(data?.permissions || {})
      } catch (err) {
        setPermissions({})
      }
    }
    fetchPermissions()
  }, [])
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t) }
  }, [success])

  // ── Fetchers ─────────────────────────────────────────────────────
  async function fetchAppointments () {
    setLoading(true)
    try {
      const vetsRes = await axios.get(`${API}/vets`, { withCredentials: true })
      const allApts = []
      for (const vet of vetsRes.data) {
        const res = await axios.get(`${API}/appointments/vet/${vet.id}`, { withCredentials: true })
        allApts.push(...res.data)
      }
      const unique = [...new Map(allApts.map(a => [a.id, a])).values()]
      setAppointments(unique.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)))
    } catch (err) { setError('Failed to load appointments.') }
    finally { setLoading(false) }
  }

  async function fetchVets () {
    try { const { data } = await axios.get(`${API}/vets`); setVets(data) }
    catch (err) { console.error(err) }
  }

  async function fetchOwners () {
    setLoading(true)
    try { const { data } = await axios.get(`${API}/owners`, { withCredentials: true }); setOwners(data) }
    catch (err) { setError('Failed to load owners.') }
    finally { setLoading(false) }
  }

  async function fetchInvoices () {
    setLoading(true)
    try {
      // جيب invoices من كل الـ appointments
      const res = await axios.get(`${API}/invoices`, { withCredentials: true })
      setInvoices(res.data)
    } catch (err) {
      // fallback: receptionist لو مش admin, نشيل error
      setInvoices([])
      setError('Could not load invoices. Contact admin.')
    }
    finally { setLoading(false) }
  }

  async function fetchOwnerPets (ownerId) {
    try { const { data } = await axios.get(`${API}/pets/owner/${ownerId}`, { withCredentials: true }); setOwnerPets(data) }
    catch (err) { setOwnerPets([]) }
  }

  // ── Actions ──────────────────────────────────────────────────────
  async function updateStatus (id, status) {
    try {
      await axios.put(`${API}/appointments/${id}/status`, { status }, { withCredentials: true })
      setSuccess(`✅ Status updated to ${status}`)
      fetchAppointments()
    } catch (err) { setError(err?.response?.data?.message || 'Update failed') }
  }

  async function cancelAppointment (id) {
    try {
      await axios.put(`${API}/appointments/${id}/cancel`, {}, { withCredentials: true })
      setSuccess('✅ Appointment cancelled')
      fetchAppointments()
    } catch (err) { setError(err?.response?.data?.message || 'Cancel failed') }
  }

  async function submitBooking (e) {
    e.preventDefault(); setBookLoading(true)
    try {
      await axios.post(`${API}/appointments`, {
        ownerId: parseInt(bookForm.ownerId),
        petId:   parseInt(bookForm.petId),
        vetId:   parseInt(bookForm.vetId),
        appointmentDate: bookForm.appointmentDate,
        startTime: bookForm.startTime + ':00',
        endTime:   bookForm.endTime   + ':00',
        reason: bookForm.reason
      }, { withCredentials: true })
      setSuccess('✅ Appointment booked'); setShowBookForm(false)
      setBookForm({ ownerId: '', petId: '', vetId: '', appointmentDate: '', startTime: '', endTime: '', reason: '' })
      fetchAppointments()
    } catch (err) { setError(err?.response?.data?.message || 'Booking failed') }
    finally { setBookLoading(false) }
  }

  async function submitInvoice (e) {
    e.preventDefault(); setInvLoading(true)
    try {
      await axios.post(`${API}/invoices`, {
        appointmentId: parseInt(invForm.appointmentId),
        ownerId: parseInt(invForm.ownerId),
        amount: parseFloat(invForm.amount)
      }, { withCredentials: true })
      setSuccess('✅ Invoice created'); setShowInvForm(false)
      setInvForm({ appointmentId: '', ownerId: '', amount: '' })
    } catch (err) { setError(err?.response?.data?.message || 'Invoice creation failed') }
    finally { setInvLoading(false) }
  }

  function switchTab (tab) {
    const tabPermissionMap = {
      appointments: 'RECEPTIONIST_TAB_APPOINTMENTS',
      owners: 'RECEPTIONIST_TAB_OWNERS',
      invoices: 'RECEPTIONIST_TAB_INVOICES'
    }
    const required = tabPermissionMap[tab]
    if (required && permissions[required] === false) return
    setActiveTab(tab); setError(null); setSearch('')
    setShowBookForm(false); setShowInvForm(false)
    if (tab === 'appointments') fetchAppointments()
    if (tab === 'owners')       fetchOwners()
    if (tab === 'invoices')     fetchInvoices()
  }

  const filteredApts = appointments.filter(a =>
    a.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    a.petName?.toLowerCase().includes(search.toLowerCase()) ||
    a.vetName?.toLowerCase().includes(search.toLowerCase()))

  const tabs = [
    { key: 'appointments', label: '📅 Appointments' },
    { key: 'owners',       label: '👤 Pet Owners'  },
    { key: 'invoices',     label: '🧾 Billing'      },
  ].filter(t => {
    const tabPermissionMap = {
      appointments: 'RECEPTIONIST_TAB_APPOINTMENTS',
      owners: 'RECEPTIONIST_TAB_OWNERS',
      invoices: 'RECEPTIONIST_TAB_INVOICES'
    }
    const required = tabPermissionMap[t.key]
    return permissions[required] !== false
  })

  useEffect(() => {
    if (tabs.length && !tabs.some(t => t.key === activeTab)) {
      switchTab(tabs[0].key)
    }
  }, [permissions])
  const th = 'px-4 py-3 font-semibold text-left text-sm'
  const td = 'px-4 py-3 text-sm'

  return (
    <div className='bg-[#F4F8FF] min-h-screen p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-[#3276BD]'>🗂️ Receptionist Dashboard</h1>
          <p className='text-[#4A6580] mt-1'>Appointments, check-in/out, billing and owner registrations</p>
        </div>

        <div className='flex gap-2 mb-6 flex-wrap'>
          {tabs.map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition
                ${activeTab === t.key ? 'bg-[#3276BD] text-white shadow' : 'bg-white text-[#4A6580] hover:bg-[#e8f1fb]'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {tabs.length === 0 && (
          <div className='bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-xl mb-4'>
            No dashboard sections are enabled for RECEPTIONIST.
          </div>
        )}

        {error   && <div className='bg-red-100 border border-red-400 text-red-600 px-4 py-2 rounded-xl mb-4'>{error}</div>}
        {success && <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-xl mb-4'>{success}</div>}

        <div className='mb-4 flex justify-between items-center flex-wrap gap-3'>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder='🔍 Search...'
            className='w-full md:w-72 bg-white px-4 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm focus:ring-2 focus:ring-[#3276BD]' />
          {activeTab === 'appointments' && (
            <button onClick={() => setShowBookForm(v => !v)}
              className='bg-[#46CEAC] hover:bg-[#3ab99a] text-white font-bold px-4 py-2 rounded-xl text-sm transition'>
              + Book Appointment
            </button>
          )}
          {activeTab === 'invoices' && (
            <button onClick={() => setShowInvForm(v => !v)}
              className='bg-[#3276BD] hover:bg-[#255fa3] text-white font-bold px-4 py-2 rounded-xl text-sm transition'>
              + Create Invoice
            </button>
          )}
        </div>

        {loading && <div className='text-center py-10'><i className='fa-solid fa-spinner fa-spin text-3xl text-[#3276BD]'></i></div>}

        {/* ── BOOK FORM ── */}
        {activeTab === 'appointments' && showBookForm && (
          <div className='bg-white rounded-2xl shadow-sm p-6 mb-6'>
            <h2 className='text-lg font-bold text-[#3276BD] mb-4'>📅 Book New Appointment</h2>
            <form onSubmit={submitBooking} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold text-[#4A6580]'>Owner ID</label>
                <input type='number' value={bookForm.ownerId} required
                  onChange={e => { setBookForm({...bookForm, ownerId: e.target.value, petId: ''}); if (e.target.value) fetchOwnerPets(e.target.value) }}
                  className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold text-[#4A6580]'>Pet</label>
                <select value={bookForm.petId} required
                  onChange={e => setBookForm({...bookForm, petId: e.target.value})}
                  className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm'>
                  <option value=''>Select pet...</option>
                  {ownerPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold text-[#4A6580]'>Vet</label>
                <select value={bookForm.vetId} required
                  onChange={e => setBookForm({...bookForm, vetId: e.target.value})}
                  className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm'>
                  <option value=''>Select vet...</option>
                  {vets.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold text-[#4A6580]'>Date</label>
                <input type='date' value={bookForm.appointmentDate} required
                  onChange={e => setBookForm({...bookForm, appointmentDate: e.target.value})}
                  className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold text-[#4A6580]'>Start Time</label>
                <input type='time' value={bookForm.startTime} required
                  onChange={e => setBookForm({...bookForm, startTime: e.target.value})}
                  className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-semibold text-[#4A6580]'>End Time</label>
                <input type='time' value={bookForm.endTime} required
                  onChange={e => setBookForm({...bookForm, endTime: e.target.value})}
                  className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
              </div>
              <div className='flex flex-col gap-1 md:col-span-2'>
                <label className='text-sm font-semibold text-[#4A6580]'>Reason (optional)</label>
                <input type='text' value={bookForm.reason}
                  onChange={e => setBookForm({...bookForm, reason: e.target.value})}
                  className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
              </div>
              <div className='md:col-span-2 flex gap-3'>
                <button type='submit' disabled={bookLoading}
                  className='bg-[#46CEAC] hover:bg-[#3ab99a] disabled:opacity-60 text-white font-bold px-6 py-2 rounded-xl transition'>
                  {bookLoading ? <i className='fa-solid fa-spinner fa-spin'></i> : 'Confirm Booking'}
                </button>
                <button type='button' onClick={() => setShowBookForm(false)}
                  className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2 rounded-xl transition'>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── INVOICE FORM ── */}
        {activeTab === 'invoices' && showInvForm && (
          <div className='bg-white rounded-2xl shadow-sm p-6 mb-6'>
            <h2 className='text-lg font-bold text-[#3276BD] mb-4'>🧾 Create Invoice</h2>
            <form onSubmit={submitInvoice} className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {[
                { label: 'Appointment ID', field: 'appointmentId', type: 'number' },
                { label: 'Owner ID',       field: 'ownerId',       type: 'number' },
                { label: 'Amount (EGP)',   field: 'amount',        type: 'number' },
              ].map(({ label, field, type }) => (
                <div key={field} className='flex flex-col gap-1'>
                  <label className='text-sm font-semibold text-[#4A6580]'>{label}</label>
                  <input type={type} value={invForm[field]} required step='any'
                    onChange={e => setInvForm({...invForm, [field]: e.target.value})}
                    className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm' />
                </div>
              ))}
              <div className='md:col-span-3 flex gap-3'>
                <button type='submit' disabled={invLoading}
                  className='bg-[#3276BD] hover:bg-[#255fa3] disabled:opacity-60 text-white font-bold px-6 py-2 rounded-xl transition'>
                  {invLoading ? <i className='fa-solid fa-spinner fa-spin'></i> : 'Create Invoice'}
                </button>
                <button type='button' onClick={() => setShowInvForm(false)}
                  className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2 rounded-xl transition'>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── APPOINTMENTS TABLE ── */}
        {activeTab === 'appointments' && !loading && (
          <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-[#3276BD] text-white'>
                <tr>{['Owner','Pet','Vet','Date','Time','Status','Actions'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredApts.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F8FF]'}>
                    <td className={`${td} font-medium`}>{a.ownerName}</td>
                    <td className={td}>🐾 {a.petName}</td>
                    <td className={td}>🩺 {a.vetName}</td>
                    <td className={td}>{a.appointmentDate}</td>
                    <td className={td}>{a.startTime}–{a.endTime}</td>
                    <td className={td}>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${(a.status === 'COMPLETED' || a.status === 'DONE') ? 'bg-green-100 text-green-700' :
                          a.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          a.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className={`${td} flex gap-1 flex-wrap`}>
                      {a.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(a.id, 'CONFIRMED')}
                            className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap'>
                            ✅ Check In
                          </button>
                          <button onClick={() => cancelAppointment(a.id)}
                            className='bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg text-xs font-bold'>
                            ❌ Cancel
                          </button>
                        </>
                      )}
                      {a.status === 'CONFIRMED' && (
                        <button onClick={() => updateStatus(a.id, 'DONE')}
                          className='bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap'>
                          ✔️ Check Out
                        </button>
                      )}
                      {(a.status === 'COMPLETED' || a.status === 'DONE' || a.status === 'CANCELLED') && (
                        <span className='text-gray-400 text-xs'>—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredApts.length === 0 && <tr><td colSpan={7} className='text-center py-8 text-gray-400'>No appointments found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── OWNERS TABLE ── */}
        {activeTab === 'owners' && !loading && (
          <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-[#3276BD] text-white'>
                <tr>{['ID','Name','Phone','City','Address'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {owners.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search))
                  .map((o, i) => (
                    <tr key={o.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F8FF]'}>
                      <td className={td}>{o.id}</td>
                      <td className={`${td} font-medium`}>{o.name}</td>
                      <td className={td}>{o.phone}</td>
                      <td className={td}>{o.city || '—'}</td>
                      <td className={td}>{o.address || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── INVOICES TABLE ── */}
        {activeTab === 'invoices' && !loading && (
          <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-[#3276BD] text-white'>
                <tr>{['ID','Owner','Appointment','Amount','Status','Issued','Paid'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F8FF]'}>
                    <td className={td}>{inv.id}</td>
                    <td className={td}>{inv.ownerId}</td>
                    <td className={td}>{inv.appointmentId}</td>
                    <td className={`${td} font-semibold`}>{inv.amount} EGP</td>
                    <td className={td}>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className={td}>{inv.issuedAt?.substring(0,10)}</td>
                    <td className={td}>{inv.paidAt?.substring(0,10) || '—'}</td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={7} className='text-center py-8 text-gray-400'>No invoices found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}