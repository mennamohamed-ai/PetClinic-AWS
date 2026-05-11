import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'

const API = 'http://localhost:9090/api'
const ANIMAL_TYPES = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'FISH', 'OTHER']
const USER_ROLES = ['PET_OWNER', 'VET', 'RECEPTIONIST', 'ADMIN']
const EMPTY_VET = {
  userId: '', name: '', phone: '', city: '', address: '', specialization: '',
  animalType: 'DOG', consultationFee: '', rating: '', experienceYears: '',
  availableDays: '', bio: '', available: true
}

export default function Admin () {
  const { userRole, UserData } = useContext(UserContext)
  const navigate = useNavigate()

  const [activeTab,    setActiveTab]    = useState('summary')
  const [summary,      setSummary]      = useState(null)
  const [appointments, setAppointments] = useState([])
  const [invoices,     setInvoices]     = useState([])
  const [users,        setUsers]        = useState([])
  const [roleDrafts,   setRoleDrafts]   = useState({})
  const [permissionsByRole, setPermissionsByRole] = useState({})
  const [selectedPermissionRole, setSelectedPermissionRole] = useState('RECEPTIONIST')
  const [vets,         setVets]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [success,      setSuccess]      = useState(null)

  const [showVetForm,  setShowVetForm]  = useState(false)
  const [editingVet,   setEditingVet]   = useState(null)
  const [vetForm,      setVetForm]      = useState(EMPTY_VET)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formLoading,  setFormLoading]  = useState(false)

  useEffect(() => {
    if (!UserData || userRole !== 'ADMIN') navigate('/Login')
  }, [UserData, userRole])

  useEffect(() => { fetchSummary() }, [])
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t) }
  }, [success])
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 4000); return () => clearTimeout(t) }
  }, [error])

  async function apiFetch (url, opts = {}) {
    const res = await fetch(url, { credentials: 'include', ...opts })
    if (!res.ok) { const msg = await res.text().catch(() => ''); throw new Error(msg || `HTTP ${res.status}`) }
    return res.status === 204 ? null : res.json()
  }

  async function fetchSummary () {
    setLoading(true)
    try { setSummary(await apiFetch(`${API}/admin/reports/summary`)) }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  async function fetchAppointments () {
    setLoading(true)
    try { setAppointments(await apiFetch(`${API}/admin/reports/appointments`)) }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  async function fetchInvoices () {
    setLoading(true)
    try { setInvoices(await apiFetch(`${API}/admin/reports/invoices`)) }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  async function fetchUsers () {
    setLoading(true)
    try {
      const data = await apiFetch(`${API}/admin/users`)
      setUsers(data)
      setRoleDrafts(Object.fromEntries((data || []).map(u => [u.id, u.role])))
    }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function updateUserRole (userId) {
    const nextRole = roleDrafts[userId]
    if (!nextRole) return
    try {
      const updated = await apiFetch(`${API}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      })
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)))
      setSuccess(`✅ Role updated for user #${userId}`)
    } catch (err) {
      setError(err.message)
    }
  }
  async function fetchVets () {
    setLoading(true)
    try { setVets(await apiFetch(`${API}/vets`)) }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function fetchPermissions () {
    setLoading(true)
    try {
      const rows = await apiFetch(`${API}/admin/permissions`)
      const mapped = Object.fromEntries((rows || []).map(r => [r.role, r.permissions || {}]))
      setPermissionsByRole(mapped)
      const firstRole = Object.keys(mapped)[0]
      if (firstRole && !mapped[selectedPermissionRole]) setSelectedPermissionRole(firstRole)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function switchTab (tab) {
    setActiveTab(tab); setError(null); setSuccess(null)
    setShowVetForm(false); setEditingVet(null)
    if (tab === 'summary')      fetchSummary()
    if (tab === 'appointments') fetchAppointments()
    if (tab === 'invoices')     fetchInvoices()
    if (tab === 'users')        fetchUsers()
    if (tab === 'vets')         fetchVets()
    if (tab === 'permissions')  fetchPermissions()
  }

  function openAddForm () { setVetForm(EMPTY_VET); setEditingVet(null); setShowVetForm(true) }
  function openEditForm (vet) {
    setVetForm({ userId: vet.userId ?? '', name: vet.name, phone: vet.phone, city: vet.city, address: vet.address,
                 specialization: vet.specialization, animalType: vet.animalType || 'DOG',
                 consultationFee: vet.consultationFee, rating: vet.rating,
                 experienceYears: vet.experienceYears, availableDays: vet.availableDays,
                 bio: vet.bio, available: vet.available })
    setEditingVet(vet); setShowVetForm(true)
  }
  function cancelForm () { setShowVetForm(false); setEditingVet(null); setVetForm(EMPTY_VET) }

  async function submitVetForm (e) {
    e.preventDefault(); setFormLoading(true)
    try {
      const payload = { ...vetForm,
                        userId: parseInt(vetForm.userId),
                        consultationFee: parseFloat(vetForm.consultationFee),
                        rating: parseFloat(vetForm.rating), experienceYears: parseInt(vetForm.experienceYears) }
      if (editingVet) {
        await apiFetch(`${API}/vets/${editingVet.id}`, { method: 'PUT',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        setSuccess('✅ Doctor updated')
      } else {
        await apiFetch(`${API}/vets`, { method: 'POST',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        setSuccess('✅ Doctor added')
      }
      cancelForm(); fetchVets()
    } catch (err) { setError(err.message) }
    finally { setFormLoading(false) }
  }

  async function confirmDelete () {
    if (!deleteTarget) return
    try {
      await apiFetch(`${API}/vets/${deleteTarget}`, { method: 'DELETE' })
      setSuccess('✅ Doctor deleted')
      setVets(prev => prev.filter(v => v.id !== deleteTarget))
    } catch (err) { setError(err.message) }
    finally { setDeleteTarget(null) }
  }

  async function updatePermission (role, key, enabled) {
    try {
      const updated = await apiFetch(`${API}/admin/permissions/${role}/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      setPermissionsByRole(prev => ({ ...prev, [role]: updated.permissions || {} }))
      setSuccess(`✅ Permission updated: ${key}`)
    } catch (err) { setError(err.message) }
  }

  const statCards = summary ? [
    { label: 'Total Users',        value: summary.totalUsers,            color: 'bg-blue-100 text-blue-700' },
    { label: 'Total Appointments', value: summary.totalAppointments,     color: 'bg-green-100 text-green-700' },
    { label: 'Pending',            value: summary.pendingAppointments,   color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Completed',          value: summary.completedAppointments, color: 'bg-teal-100 text-teal-700' },
    { label: 'Cancelled',          value: summary.cancelledAppointments, color: 'bg-red-100 text-red-700' },
    { label: 'Total Invoices',     value: summary.totalInvoices,         color: 'bg-purple-100 text-purple-700' },
    { label: 'Revenue (EGP)',      value: summary.totalRevenue?.toFixed(2), color: 'bg-orange-100 text-orange-700' },
  ] : []

  const tabs = [
    { key: 'summary',      label: '📊 Summary' },
    { key: 'vets',         label: '🩺 Doctors' },
    { key: 'appointments', label: '📅 Appointments' },
    { key: 'invoices',     label: '🧾 Invoices' },
    { key: 'users',        label: '👥 Users' },
    { key: 'permissions',  label: '🔐 Permissions' },
  ]
  const th = 'px-4 py-3 font-semibold text-left text-sm'
  const td = 'px-4 py-3 text-sm'

  return (
    <div className='min-h-screen bg-[#F4F8FF] p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-[#3276BD]'>🛡️ Admin Dashboard</h1>
          <p className='text-[#4A6580] mt-1'>System overview, reports and doctor management</p>
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

        {error   && <div className='bg-red-100 border border-red-400 text-red-600 px-4 py-2 rounded-xl mb-4'>{error}</div>}
        {success && <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-xl mb-4'>{success}</div>}
        {loading && <div className='text-center py-10'><i className='fa-solid fa-spinner fa-spin text-3xl text-[#3276BD]'></i></div>}

        {/* SUMMARY */}
        {activeTab === 'summary' && !loading && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {statCards.map((c, i) => (
              <div key={i} className={`rounded-2xl p-5 shadow-sm ${c.color}`}>
                <p className='text-sm font-medium opacity-70'>{c.label}</p>
                <p className='text-3xl font-bold mt-1'>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* DOCTORS */}
        {activeTab === 'vets' && !loading && (
          <div>
            {!showVetForm && (
              <button onClick={openAddForm}
                className='mb-4 bg-[#3276BD] hover:bg-[#255fa3] text-white font-bold px-5 py-2 rounded-xl transition'>
                + Add New Doctor
              </button>
            )}
            {showVetForm && (
              <div className='bg-white rounded-2xl shadow-sm p-6 mb-6'>
                <h2 className='text-xl font-bold text-[#3276BD] mb-4'>
                  {editingVet ? `✏️ Edit: ${editingVet.name}` : '➕ Add New Doctor'}
                </h2>
                <form onSubmit={submitVetForm} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {[
                    { label: 'User ID (login id)', field: 'userId',        type: 'number' },
                    { label: 'Full Name',        field: 'name',           type: 'text' },
                    { label: 'Phone',            field: 'phone',          type: 'text' },
                    { label: 'City',             field: 'city',           type: 'text' },
                    { label: 'Address',          field: 'address',        type: 'text' },
                    { label: 'Specialization',   field: 'specialization', type: 'text' },
                    { label: 'Fee (EGP)',         field: 'consultationFee',type: 'number' },
                    { label: 'Rating (0–5)',      field: 'rating',         type: 'number' },
                    { label: 'Experience (yrs)', field: 'experienceYears',type: 'number' },
                    { label: 'Available Days (e.g. SAT,MON)', field: 'availableDays', type: 'text' },
                  ].map(({ label, field, type }) => (
                    <div key={field} className='flex flex-col gap-1'>
                      <label className='text-sm font-semibold text-[#4A6580]'>{label}</label>
                      <input type={type} value={vetForm[field]} required step={type === 'number' ? 'any' : undefined}
                        onChange={e => setVetForm({ ...vetForm, [field]: e.target.value })}
                        className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm focus:ring-2 focus:ring-[#3276BD]' />
                    </div>
                  ))}
                  <div className='flex flex-col gap-1 md:col-span-2'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Bio</label>
                    <textarea value={vetForm.bio} required rows={3}
                      onChange={e => setVetForm({ ...vetForm, bio: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm focus:ring-2 focus:ring-[#3276BD] resize-none' />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Animal Type</label>
                    <select value={vetForm.animalType}
                      onChange={e => setVetForm({ ...vetForm, animalType: e.target.value })}
                      className='bg-[#F4F8FF] px-3 py-2 border border-[#C5D8EE] rounded-xl outline-none text-sm'>
                      {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className='flex items-center gap-3'>
                    <label className='text-sm font-semibold text-[#4A6580]'>Available?</label>
                    <button type='button'
                      onClick={() => setVetForm({ ...vetForm, available: !vetForm.available })}
                      className={`w-12 h-6 rounded-full transition-colors ${vetForm.available ? 'bg-green-400' : 'bg-gray-300'}`}>
                      <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${vetForm.available ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className='text-sm'>{vetForm.available ? 'Yes' : 'No'}</span>
                  </div>
                  <div className='md:col-span-2 flex gap-3 mt-2'>
                    <button type='submit' disabled={formLoading}
                      className='bg-[#3276BD] hover:bg-[#255fa3] disabled:opacity-60 text-white font-bold px-6 py-2 rounded-xl transition'>
                      {formLoading ? <i className='fa-solid fa-spinner fa-spin'></i> : editingVet ? 'Save Changes' : 'Add Doctor'}
                    </button>
                    <button type='button' onClick={cancelForm}
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
                  <tr>{['ID','Name','City','Specialization','Fee','Rating','Status','Actions'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {vets.map((v, i) => (
                    <tr key={v.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F8FF]'}>
                      <td className={td}>{v.id}</td>
                      <td className={`${td} font-medium`}>{v.name}</td>
                      <td className={td}>{v.city}</td>
                      <td className={td}>{v.specialization}</td>
                      <td className={td}>{v.consultationFee} EGP</td>
                      <td className={td}>⭐ {v.rating}</td>
                      <td className={td}>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${v.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {v.available ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={`${td} flex gap-2`}>
                        <button onClick={() => openEditForm(v)} className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold'>✏️ Edit</button>
                        <button onClick={() => setDeleteTarget(v.id)} className='bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs font-bold'>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                  {vets.length === 0 && <tr><td colSpan={8} className='text-center py-8 text-gray-400'>No doctors found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {activeTab === 'appointments' && !loading && (
          <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-[#3276BD] text-white'>
                <tr>{['ID','Owner','Pet','Vet','Date','Status','Reason'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F8FF]'}>
                    <td className={td}>{a.id}</td>
                    <td className={td}>{a.ownerName}</td>
                    <td className={td}>🐾 {a.petName}</td>
                    <td className={td}>{a.vetName}</td>
                    <td className={td}>{a.appointmentDate}</td>
                    <td className={td}>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${(a.status === 'COMPLETED' || a.status === 'DONE') ? 'bg-green-100 text-green-700' :
                          a.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className={`${td} max-w-xs truncate`}>{a.reason || '—'}</td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan={7} className='text-center py-8 text-gray-400'>No appointments</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* INVOICES */}
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
                {invoices.length === 0 && <tr><td colSpan={7} className='text-center py-8 text-gray-400'>No invoices</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && !loading && (
          <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-[#3276BD] text-white'>
                <tr>{['ID','Name','Email','Phone','Role','Actions'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F8FF]'}>
                    <td className={td}>{u.id}</td>
                    <td className={`${td} font-medium`}>{u.name}</td>
                    <td className={td}>{u.email}</td>
                    <td className={td}>{u.phone}</td>
                    <td className={td}>
                      <select
                        value={roleDrafts[u.id] || u.role}
                        onChange={e => setRoleDrafts(prev => ({ ...prev, [u.id]: e.target.value }))}
                        disabled={String(u.id) === String(UserData)}
                        className='bg-white px-2 py-1 border border-[#C5D8EE] rounded-lg text-sm'
                      >
                        {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className={td}>
                      {String(u.id) === String(UserData)
                        ? <span className='text-xs text-gray-500'>Current admin</span>
                        : (
                          <button
                            onClick={() => updateUserRole(u.id)}
                            className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold'
                          >
                            Save Role
                          </button>
                          )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className='text-center py-8 text-gray-400'>No users</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* PERMISSIONS */}
        {activeTab === 'permissions' && !loading && (
          <div className='bg-white rounded-2xl shadow-sm p-5'>
            <div className='flex items-center gap-3 mb-4'>
              <label className='text-sm font-semibold text-[#4A6580]'>Select Role</label>
              <select
                value={selectedPermissionRole}
                onChange={e => setSelectedPermissionRole(e.target.value)}
                className='bg-white px-3 py-2 border border-[#C5D8EE] rounded-xl text-sm'
              >
                {Object.keys(permissionsByRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {Object.entries(permissionsByRole[selectedPermissionRole] || {}).map(([key, enabled]) => (
                <div key={key} className='flex items-center justify-between bg-[#F4F8FF] border border-[#C5D8EE] rounded-xl px-3 py-2'>
                  <p className='text-sm font-medium text-[#35516f]'>{key}</p>
                  <button
                    type='button'
                    onClick={() => updatePermission(selectedPermissionRole, key, !enabled)}
                    className={`w-14 h-7 rounded-full transition-colors ${enabled ? 'bg-green-400' : 'bg-gray-300'}`}
                    title={enabled ? 'Enabled' : 'Disabled'}
                  >
                    <span className={`block w-6 h-6 bg-white rounded-full shadow transition-transform mx-0.5 ${enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4'>
            <h3 className='text-xl font-bold text-gray-800 mb-2'>Delete Doctor?</h3>
            <p className='text-gray-500 mb-6'>This action cannot be undone.</p>
            <div className='flex gap-3'>
              <button onClick={confirmDelete} className='flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl'>Yes, Delete</button>
              <button onClick={() => setDeleteTarget(null)} className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-xl'>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}