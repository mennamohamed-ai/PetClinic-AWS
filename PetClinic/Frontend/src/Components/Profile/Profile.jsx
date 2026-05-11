import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../Context/UserContext'
import styles from './Profile.module.css'

export default function Profile() {
  const { userName, setUserName, UserPhone, setUserPhone, UserID } =
    useContext(UserContext)

  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [toast, setToast] = useState(null)

  const [formData, setFormData] = useState({
    name: userName || '',
    phone: UserPhone || ''
  })

  useEffect(() => {
    if (!editMode) {
      setFormData({
        name: userName || '',
        phone: UserPhone || ''
      })
    }
  }, [userName, UserPhone, editMode])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:9090/api/account/${UserID}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, phone: formData.phone })
      })
      if (!res.ok) throw new Error('Update failed')
      setUserName(formData.name)
      setUserPhone(formData.phone)
      setEditMode(false)
      showToast('Profile updated successfully.')
    } catch (err) {
      showToast('Failed to update profile.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:9090/api/account/${UserID}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Delete failed')
      showToast('Account deleted.')
    } catch (err) {
      showToast('Failed to delete account.', 'error')
    } finally {
      setLoading(false)
      setDeleteConfirm(false)
    }
  }

  const initials = (formData.name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <h2>{formData.name || '—'}</h2>
            <p>ID: {UserID}</p>
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.field}>
            <label>Name</label>
            {editMode ? (
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <span>{formData.name || '—'}</span>
            )}
          </div>

          <div className={styles.field}>
            <label>Phone</label>
            {editMode ? (
              <input
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            ) : (
              <span>{formData.phone || '—'}</span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {!editMode ? (
            <>
              <button onClick={() => setEditMode(true)}>Edit</button>
              <button
                className={styles.delete}
                onClick={() => setDeleteConfirm(true)}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={handleUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </>
          )}
        </div>

        {deleteConfirm && (
          <div className={styles.confirm}>
            <p>Are you sure you want to delete your account?</p>
            <button onClick={handleDelete}>Yes</button>
            <button onClick={() => setDeleteConfirm(false)}>No</button>
          </div>
        )}
      </div>

      {toast && (
        <div className={styles.toast}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}