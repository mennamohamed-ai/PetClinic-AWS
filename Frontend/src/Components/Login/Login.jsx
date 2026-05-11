import style from './Login.module.css'
import React, { useContext, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../../Context/UserContext'

export default function Login () {
  const [role, setRole] = useState(null)
  let navigate = useNavigate()
  let [APIERR, setAPIERR] = useState(null)
  let [loadingSpinner, setloadingSpinner] = useState(false)
  let { setUserData, setUserName, setUserPhone, setUserID, setUserRole } = useContext(UserContext)

  let validationSchema = yup.object().shape({
    email: yup.string().email('email is invalid').required('email is required'),
    password: yup.string().min(1).required('password is required')
  })

  let formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: loginForm
  })

  async function loginForm (values) {
    try {
      setloadingSpinner(true)
      setAPIERR(null)
      let { data } = await axios.post(
        `http://localhost:9090/api/auth/login`,
        values,
        { withCredentials: true }
      )
      setUserData(String(data.userId))
      setUserName(data.name)
      setUserPhone(data.phone)
      setUserID(data.userId)
      setUserRole(data.role)

      const roleMap = {
        'patient': 'PET_OWNER',
        'doctor': 'VET',
        'admin': 'ADMIN',
        'receptionist': 'RECEPTIONIST'
      }
      if (roleMap[role] && roleMap[role] !== data.role) {
        setAPIERR(`Access denied. Your account role is ${data.role}, not ${role}.`)
        setUserData(null); setUserName(null); setUserPhone(null)
        setUserID(null); setUserRole(null)
        setloadingSpinner(false)
        return
      }

      if (data.role === 'ADMIN')             navigate('/admin')
      else if (data.role === 'VET')          navigate('/DoctorHome')
      else if (data.role === 'RECEPTIONIST') navigate('/receptionist')
      else                                   navigate('/')

      setloadingSpinner(false)
    } catch (err) {
      setAPIERR(err?.response?.data?.message || 'Invalid credentials')
      setloadingSpinner(false)
    }
  }

  const roleCards = [
    {
      key: 'patient',
      icon: '🐾',
      label: 'Patient',
      desc: 'Pet owner',
      activeClass: 'border-[#46CEAC] bg-[#f0fdf9]',
      iconBg: 'bg-[#d1fae5]',
      checkColor: 'text-[#46CEAC]'
    },
    {
      key: 'doctor',
      icon: '🩺',
      label: 'Doctor',
      desc: 'Veterinarian',
      activeClass: 'border-blue-400 bg-blue-50',
      iconBg: 'bg-blue-100',
      checkColor: 'text-blue-500'
    },
    {
      key: 'admin',
      icon: '🛡️',
      label: 'Admin',
      desc: 'System admin',
      activeClass: 'border-amber-400 bg-amber-50',
      iconBg: 'bg-amber-100',
      checkColor: 'text-amber-500'
    },
    {
      key: 'receptionist',
      icon: '🗂️',
      label: 'Reception',
      desc: 'Front desk',
      activeClass: 'border-violet-400 bg-violet-50',
      iconBg: 'bg-violet-100',
      checkColor: 'text-violet-500'
    }
  ]

  const activeCard = roleCards.find(r => r.key === role)

  return (
    <section className='flex md:flex-row flex-col min-h-screen bg-[#F0F4FB] font-[Plus_Jakarta_Sans,sans-serif]'>

      {/* ── Left Panel ── */}
      <div className='relative left overflow-hidden bg-[#1a4fa0] px-8 py-10 md:w-[42%] w-full flex flex-col'>
        {/* decorative circles */}
        <div className='absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none' />
        <div className='absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-[#46CEAC]/10 pointer-events-none' />

        {/* Brand */}
        <div className='flex items-center gap-2 mb-10 relative z-10'>
          <span className='w-2.5 h-2.5 rounded-full bg-[#46CEAC]' />
          <span className='text-white/60 text-sm font-semibold tracking-wide'>VetCare</span>
        </div>

        {/* Headline */}
        <p className='relative z-10 text-white font-bold text-[26px] leading-snug mb-3'>
          Your pet deserves <span className='text-[#46CEAC]'>the best care</span>
        </p>
        <p className='relative z-10 text-white/55 text-sm leading-relaxed mb-8'>
          Sign in to manage appointments, records, and connect with our expert veterinary team.
        </p>

        {/* Feature list */}
        <div className='relative z-10 flex flex-col gap-3 flex-1'>
          {[
            { icon: 'fa-calendar-check', text: 'Book and manage appointments online' },
            { icon: 'fa-file-medical',   text: 'View medical records and prescriptions' },
            { icon: 'fa-comment-medical',text: 'Secure messaging with your vet' },
            { icon: 'fa-bell',           text: '24/7 emergency support access' },
          ].map(({ icon, text }) => (
            <div key={text} className='flex items-center gap-3 bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3'>
              <span className='w-8 h-8 rounded-lg bg-[#46CEAC]/20 flex items-center justify-center flex-shrink-0'>
                <i className={`fa-solid ${icon} text-[#46CEAC] text-sm`} />
              </span>
              <span className='text-white/75 text-[13px] font-medium'>{text}</span>
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className='relative z-10 mt-8 flex items-center gap-2 bg-[#46CEAC]/10 border border-[#46CEAC]/30 rounded-full px-4 py-2 w-fit'>
          <i className='fa-solid fa-shield-halved text-[#46CEAC] text-sm' />
          <span className='text-white/60 text-xs'>SSL secured · HIPAA compliant</span>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className='right flex-1 bg-[#F0F4FB] px-8 py-10 overflow-y-auto'>

        {/* Header */}
        <div className='mb-7'>
          <h2 className='text-2xl font-bold text-gray-900 mb-1'>Welcome back</h2>
          <p className='text-sm text-gray-500'>Sign in to your account to continue</p>
        </div>

        {/* Role label */}
        <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3'>Sign in as</p>

        {/* Role cards */}
        <div className='grid grid-cols-4 gap-2 mb-6'>
          {roleCards.map(r => (
            <button
              key={r.key}
              type='button'
              onClick={() => setRole(r.key)}
              className={`flex flex-col items-center bg-white border-[1.5px] rounded-2xl px-2 py-3 cursor-pointer transition-all duration-150
                ${role === r.key
                  ? `${r.activeClass} shadow-sm -translate-y-[2px]`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 text-lg ${r.iconBg}`}>
                {r.icon}
              </div>
              <p className='text-[12px] font-semibold text-gray-800 flex items-center gap-1'>
                {r.label}
                {role === r.key && (
                  <span className={`w-4 h-4 rounded-full bg-current flex items-center justify-center ${r.checkColor}`}>
                    <i className='fa-solid fa-check text-white' style={{ fontSize: '8px' }} />
                  </span>
                )}
              </p>
              <p className='text-[11px] text-gray-400 mt-0.5'>{r.desc}</p>
            </button>
          ))}
        </div>

        {/* Form — shown after role selection */}
        {role && (
          <div className='bg-white border border-gray-200 rounded-2xl p-5 shadow-sm'>

            {/* Selected role indicator */}
            <div className='flex items-center gap-2 mb-4 pb-4 border-b border-gray-100'>
              <i className='fa-solid fa-circle-check text-[#46CEAC] text-base' />
              <span className='text-sm text-gray-500'>Signing in as</span>
              <span className='text-sm font-semibold text-gray-800 capitalize'>{role}</span>
            </div>

            <form onSubmit={formik.handleSubmit} className='flex flex-col gap-3'>

              {/* API error */}
              {APIERR && (
                <div className='flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-red-600 text-xs'>
                  <i className='fa-solid fa-triangle-exclamation text-sm' />
                  {APIERR}
                </div>
              )}

              {/* Fields */}
              {[
                { name: 'email',    type: 'email',    placeholder: 'Enter your email',    label: 'Email address' },
                { name: 'password', type: 'password', placeholder: 'Enter your password', label: 'Password' },
              ].map(({ name, type, placeholder, label }) => (
                <div key={name} className='flex flex-col gap-1'>
                  <label className='text-xs font-semibold text-gray-500'>{label}</label>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 px-3 py-2.5 border rounded-xl text-sm text-gray-800 outline-none transition
                      focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                      ${formik.touched[name] && formik.errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                  {formik.touched[name] && formik.errors[name] && (
                    <p className='text-red-500 text-[11px] flex items-center gap-1'>
                      <i className='fa-solid fa-circle-exclamation text-xs' />
                      {formik.errors[name]}
                    </p>
                  )}
                </div>
              ))}

              {/* Submit */}
              <button
                type='submit'
                disabled={loadingSpinner}
                className='flex justify-center items-center gap-2 bg-[#1a4fa0] hover:bg-[#163e82] active:scale-[0.98] disabled:opacity-60 mt-1 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-150'
              >
                {loadingSpinner
                  ? <i className='fa-solid fa-spinner fa-spin' />
                  : <>
                      <i className='fa-solid fa-arrow-right-to-bracket text-sm' />
                      Sign in as <span className='capitalize'>{role}</span>
                    </>
                }
              </button>

              {/* Divider + signup */}
              <div className='flex items-center gap-3 mt-1'>
                <span className='flex-1 h-px bg-gray-100' />
                <span className='text-xs text-gray-400'>New here?</span>
                <span className='flex-1 h-px bg-gray-100' />
              </div>
              <p className='text-center text-xs text-gray-500'>
                Don't have an account?{' '}
                <Link to='/register' className='text-[#46CEAC] hover:text-[#3ab89b] font-semibold'>
                  Sign up
                </Link>
              </p>

            </form>
          </div>
        )}
      </div>
    </section>
  )
}
