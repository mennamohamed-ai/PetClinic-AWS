import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../../Context/UserContext'

const API = 'http://localhost:9090/api'

const EMPTY_RECORD = {
  appointmentId: '', petId: '', diagnosis: '',
  prescription: '', notes: '', recordDate: '', followUpDate: ''
}

export default function DoctorHome () {
  const { UserID } = useContext(UserContext)
  const [vetId,      setVetId]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('today')
  const [patients,   setPatients]   = useState([])
  const [records,    setRecords]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [success,    setSuccess]    = useState(null)
  const [permissions, setPermissions] = useState({})

  const [showRecordForm, setShowRecordForm] = useState(false)
  const [editingRecord,  setEditingRecord]  = useState(null)
  const [recordForm,     setRecordForm]     = useState(EMPTY_RECORD)
  const [formLoading,    setFormLoading]    = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function loadVetId () {
      try {
        const { data } = await axios.get(`${API}/vets/me`, { withCredentials: true })
        setVetId(data.id)
      } catch (err) { setError('Could not load your vet profile.') }
    }
    loadVetId()
  }, [])

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
    if (!vetId) return
    if (activeTab === 'today') fetchAppointments('today')
    else if (activeTab === 'all') fetchAppointments('all')
    else if (activeTab === 'records') fetchRecords()
  }, [vetId, activeTab])

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t) }
  }, [success])

  async function fetchAppointments (type) {
    setLoading(true); setError(null)
    try {
      const url = type === 'today'
        ? `${API}/appointments/vet/${vetId}?date=${today}`
        : `${API}/appointments/vet/${vetId}`
      const { data } = await axios.get(url, { withCredentials: true })
      setPatients(data)
    } catch (err) { setError('Failed to load appointments.') }
    finally { setLoading(false) }
  }

  async function fetchRecords () {
    setLoading(true); setError(null)
    try {
      const { data } = await axios.get(`${API}/medical-records/vet/${vetId}`, { withCredentials: true })
      setRecords(data)
    } catch (err) { setError('Failed to load medical records.') }
    finally { setLoading(false) }
  }

  async function submitRecord (e) {
    e.preventDefault(); setFormLoading(true)
    try {
      const payload = {
        ...recordForm,
        appointmentId: parseInt(recordForm.appointmentId),
        petId: parseInt(recordForm.petId),
        vetId: vetId,
        followUpDate: recordForm.followUpDate || null
      }
      if (editingRecord) {
        await axios.put(`${API}/medical-records/${editingRecord.id}`, payload, { withCredentials: true })
        setSuccess('✅ Record updated')
      } else {
        await axios.post(`${API}/medical-records`, payload, { withCredentials: true })
        setSuccess('✅ Visit documented')
      }
      setShowRecordForm(false); setEditingRecord(null); setRecordForm(EMPTY_RECORD)
      fetchRecords()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record')
    } finally { setFormLoading(false) }
  }

  function openEditRecord (rec) {
    setRecordForm({ appointmentId: rec.appointmentId, petId: rec.petId,
                    diagnosis: rec.diagnosis, prescription: rec.prescription,
                    notes: rec.notes || '', recordDate: rec.recordDate,
                    followUpDate: rec.followUpDate || '' })
    setEditingRecord(rec); setShowRecordForm(true); setActiveTab('records')
  }

  const tabs = [
    { key: 'today',   label: "📅 Today's Patients" },
    { key: 'all',     label: '📋 All Appointments' },
    { key: 'records', label: '🗒️ Medical Records' },
  ].filter(t => {
    const map = {
      today: 'VET_TAB_TODAY',
      all: 'VET_TAB_ALL',
      records: 'VET_TAB_RECORDS'
    }
    return permissions[map[t.key]] !== false
  })

  useEffect(() => {
    if (tabs.length && !tabs.some(t => t.key === activeTab)) {
      setActiveTab(tabs[0].key)
    }
  }, [permissions])
  const th = 'px-4 py-3 font-semibold text-left text-sm'
  const td = 'px-4 py-3 text-sm'

  return (
    <div className='bg-[#F4F8FF] min-h-screen p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-[#3276BD]'>🩺 Doctor Dashboard</h1>
            <p className='text-[#4A6580] text-sm'>Manage appointments and medical records</p>
          </div>
          {vetId && (
            <Link to={`/patient?vetId=${vetId}`}
              className='bg-[#46CEAC] hover:bg-[#3ab99a] text-white font-semibold px-4 py-2 rounded-xl text-sm transition'>
              👥 My Patients
            </Link>
          )}
        </div>

        <div className='flex gap-2 mb-6 flex-wrap'>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition
                ${activeTab === t.key ? 'bg-[#3276BD] text-white' : 'bg-white text-[#4A6580] hover:bg-[#e8f1fb]'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {tabs.length === 0 && (
          <div className='bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-xl mb-4'>
            No dashboard sections are enabled for VET.
          </div>
        )}

        {error   && <div className='bg-red-100 border border-red-400 text-red-600 px-4 py-2 rounded-xl mb-4'>{error}</div>}
        {success && <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-xl mb-4'>{success}</div>}
        {loading && <div className='text-center py-20'><i className='fa-solid fa-spinner fa-spin text-3xl text-[#3276BD]'></i></div>}

        {/* Appointments tabs */}
        {(activeTab === 'today' || activeTab === 'all') && !loading && (
          <>
            {patients.length === 0 && !error && (
              <div className='text-center py-20 text-gray-400'><p className='text-5xl mb-3'>😴</p><p>No appointments found</p></div>
            )}
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {patients.map(p => (
                <div key={p.id} className='bg-white rounded-2xl shadow-sm hover:shadow-md p-5 transition border border-[#e8f1fb]'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <h2 className='font-bold text-[#3276BD] text-lg'>{p.ownerName}</h2>
                      <p className='text-gray-500 text-sm'>🐾 {p.petName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                      ${(p.status === 'COMPLETED' || p.status === 'DONE') ? 'bg-green-100 text-green-700' :
                        p.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className='text-gray-600 text-sm'>📅 {p.appointmentDate}</p>
                  <p className='text-gray-600 text-sm'>⏰ {p.startTime} – {p.endTime}</p>
                  {p.reason && <p className='text-gray-500 text-xs mt-2 truncate'>📝 {p.reason}</p>}
                  {p.status === 'CONFIRMED' && (
                    <button onClick={() => { setRecordForm(f => ({ ...f, appointmentId: String(p.id), petId: String(p.petId) })); setShowRecordForm(true); setActiveTab('records') }}
                      className='mt-3 w-full bg-[#3276BD] hover:bg-[#255fa3] text-white text-xs font-bold py-1.5 rounded-xl transition'>
                      + Add Visit Documentation
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && !loading && (
          <div>
            {!showRecordForm && (
              <button onClick={() => { setRecordForm(EMPTY_RECORD); setEditingRecord(null); setShowRecordForm(true) }}
                className='mb-4 bg-[#3276BD] hover:bg-[#255fa3] text-white font-bold px-5 py-2 rounded-xl transition'>
                + Add Visit Documentation
              </button>
            )}

            {showRecordForm && (
              <div className='bg-white rounded-2xl shadow-sm p-6 mb-6'>
                <h2 className='text-xl font-bold text-[#3276BD] mb-4'>
                  {editingRecord ? '✏️ Update Medical Record' : '📋 Add Visit Documentation'}
                </h2>
                <form onSubmit={submitRecord} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {[
                    { label: 'Appointment ID', field: 'appointmentId', type: 'number' },
                    { label: 'Pet ID',          field: 'petId',         type: 'number' },
                    { label: 'Record Date',     field: 'recordDate',    type: 'date' },
                    { label: 'Follow-up Date (optional)', field: 'followUpDate', type: 'date', required: false },
                  ].map(({ label, field, type, required = true }) => (
                    <div key={field} className='flex flex-col gap-1'>
                      <label className='text-sm font-semibold text-[#4A6580]'>{label}</label>
                      <input type={type} value={recordForm[field]} required={required}
                        onChange={e => setRecordForm({ ...recordForm, [field]: e.target.value })}
                        className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm focus:ring-2 focus:ring-[#3276BD]' />
                    </div>
                  ))}
                  {[
                    { label: 'Diagnosis',    field: 'diagnosis' },
                    { label: 'Prescription', field: 'prescription' },
                  ].map(({ label, field }) => (
                    <div key={field} className='flex flex-col gap-1 md:col-span-2'>
                      <label className='text-sm font-semibold text-[#4A6580]'>{label}</label>
                      <textarea value={recordForm[field]} required rows={2}
                        onChange={e => setRecordForm({ ...recordForm, [field]: e.target.value })}
                        className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm focus:ring-2 focus:ring-[#3276BD] resize-none' />
                    </div>
                  ))}
                  <div className='flex flex-col gap-1 md:col-span-2'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Notes (optional)</label>
                    <textarea value={recordForm.notes} rows={2}
                      onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm focus:ring-2 focus:ring-[#3276BD] resize-none' />
                  </div>
                  <div className='md:col-span-2 flex gap-3 mt-2'>
                    <button type='submit' disabled={formLoading}
                      className='bg-[#3276BD] hover:bg-[#255fa3] disabled:opacity-60 text-white font-bold px-6 py-2 rounded-xl transition'>
                      {formLoading ? <i className='fa-solid fa-spinner fa-spin'></i> : editingRecord ? 'Update Record' : 'Save Record'}
                    </button>
                    <button type='button' onClick={() => { setShowRecordForm(false); setEditingRecord(null) }}
                      className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2 rounded-xl transition'>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
              <table className='w-full text-left'>
                <thead className='bg-[#3276BD] text-white'>
                  <tr>{['Pet ID','Date','Diagnosis','Prescription','Notes','Follow-up','Actions'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F8FF]'}>
                      <td className={td}>🐾 {r.petId}</td>
                      <td className={td}>{r.recordDate}</td>
                      <td className={`${td} max-w-xs truncate`}>{r.diagnosis}</td>
                      <td className={`${td} max-w-xs truncate`}>{r.prescription}</td>
                      <td className={td}>{r.notes || '—'}</td>
                      <td className={td}>{r.followUpDate || '—'}</td>
                      <td className={td}>
                        <button onClick={() => openEditRecord(r)}
                          className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold'>
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && <tr><td colSpan={7} className='text-center py-8 text-gray-400'>No medical records yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}