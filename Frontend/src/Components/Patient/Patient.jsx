import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:9090/api'

export default function Patient () {
  const [searchParams] = useSearchParams()
  const vetId = searchParams.get('vetId')

  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')

  useEffect(() => { if (vetId) fetchPatients() }, [vetId])

  async function fetchPatients () {
    setLoading(true); setError(null)
    try {
      const { data } = await axios.get(`${API}/appointments/vet/${vetId}/all`, { withCredentials: true })
      const groups = {}
      data.forEach(apt => {
        if (!groups[apt.ownerName])
          groups[apt.ownerName] = { ownerName: apt.ownerName, ownerId: apt.ownerId, visits: [] }
        groups[apt.ownerName].visits.push(apt)
      })
      setGrouped(groups)
    } catch (err) { setError('Failed to load patients.') }
    finally { setLoading(false) }
  }

  const filteredGroups = Object.values(grouped).filter(g =>
    g.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='bg-[#F4F8FF] min-h-screen p-6'>
      <div className='max-w-5xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-[#3276BD]'>👥 My Patients</h1>
          <p className='text-[#4A6580] text-sm mt-1'>{Object.keys(grouped).length} unique patients total</p>
        </div>

        <input type='text' value={search} onChange={e => setSearch(e.target.value)}
          placeholder='🔍 Search by patient name...'
          className='w-full md:w-80 bg-white px-4 py-2 border border-[#C5D8EE] rounded-xl
                     outline-none text-sm focus:ring-2 focus:ring-[#3276BD] mb-4' />

        {error   && <div className='bg-red-100 border border-red-400 text-red-600 px-4 py-2 rounded-xl mb-4'>{error}</div>}
        {loading && <div className='text-center py-20'><i className='fa-solid fa-spinner fa-spin text-3xl text-[#3276BD]'></i></div>}
        {!vetId && !loading && <div className='text-center py-20 text-gray-400'><p>Please open this page from your Doctor Dashboard</p></div>}

        <div className='grid md:grid-cols-2 gap-4'>
          {!loading && filteredGroups.map(group => (
            <div key={group.ownerId} className='bg-white rounded-2xl shadow-sm border border-[#e8f1fb] p-5 hover:shadow-md transition'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 rounded-full bg-[#3276BD] flex items-center justify-center text-white font-bold text-lg'>
                  {group.ownerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className='font-bold text-gray-800 text-lg'>{group.ownerName}</h2>
                  <p className='text-gray-400 text-xs'>{group.visits.length} visits</p>
                </div>
              </div>
              <div className='space-y-2 max-h-48 overflow-y-auto'>
                {group.visits
                  .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                  .map(v => (
                    <div key={v.id} className='flex justify-between items-center bg-[#F4F8FF] px-3 py-2 rounded-xl text-sm'>
                      <div>
                        <span className='font-medium text-gray-700'>🐾 {v.petName}</span>
                        <span className='text-gray-400 ml-2 text-xs'>{v.appointmentDate}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                        ${v.status === 'DONE' ? 'bg-green-100 text-green-700' :
                          v.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                        {v.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}