import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../service/api'
import AuthLayout, { Field, Spinner } from '../components/AuthLayout'

const strengthLabels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong']

function getStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const Register = () => {

  const navigate = useNavigate();

  const [username, setusername] = useState('')
  const [password, setpassword] = useState('')
  const [confirmPassword, setconfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getStrength(password)
  const barColors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']

  async function handleSubmit(e) {
    e.preventDefault()

    if (!username || !password || !confirmPassword) {
      alert("Please fill in all fields!")
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return;
    }

    try {
      setLoading(true)

      const response = await api.post('/auth/register', {
        username,
        password
      })

      console.log("Registration successful:", response.data)
      alert("Registration successful! Please log in.")

      setusername('')
      setpassword('')
      setconfirmPassword('')

      navigate('/login')

    } catch (err) {
      console.error("Registration failed:", err.response ? err.response.data : err.message)

      alert("Registration failed: " + (err.response ? err.response.data.message : err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout watermark="join">

      {/* Logo + heading */}
      <div className="fade-up mb-6 text-center" style={{ animationDelay: '100ms' }}>

        <div className="logo-float mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 shadow-[0_10px_30px_rgba(41,37,36,0.25)] dark:bg-white">
          <span className="text-2xl font-bold text-white dark:text-black">N</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Create <span className="font-serif italic">account.</span>
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Start organizing your thoughts in one place.
        </p>

      </div>

      {/* Card */}
      <div
        className="fade-up rounded-3xl border border-stone-200/80 bg-white/80 p-7 shadow-[0_2px_6px_rgba(55,45,28,0.05),0_24px_60px_rgba(55,45,28,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#151515]/85 dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        style={{ animationDelay: '250ms' }}
      >

        <form onSubmit={handleSubmit} className="space-y-5">

          <Field
            label="Username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
            placeholder="Choose a username"
            autoComplete="username"
          />

          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
          >
            {/* Strength meter */}
            {password && (
              <div className="mt-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= strength ? barColors[strength] : 'bg-stone-200 dark:bg-white/10'}`}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-gray-400">{strengthLabels[strength]}</p>
              </div>
            )}
          </Field>

          <Field
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setconfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
          >
            {confirmPassword && (
              <p className={`mt-2 text-[11px] ${password === confirmPassword ? 'text-emerald-500' : 'text-red-400'}`}>
                {password === confirmPassword ? '✓ Passwords match' : "Passwords don't match yet"}
              </p>
            )}
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(41,37,36,0.18),0_14px_30px_rgba(41,37,36,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-800 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5]"
          >
            {loading ? <><Spinner />Creating...</> : 'Create Account'}
          </button>

        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-stone-200 dark:bg-white/10"></div>
          <span className="text-[10px] tracking-[2px] text-gray-400">ALREADY A MEMBER?</span>
          <div className="h-px flex-1 bg-stone-200 dark:bg-white/10"></div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-stone-900 underline underline-offset-4 transition hover:text-gray-500 dark:text-white dark:hover:text-gray-300"
          >
            Sign in
          </Link>
        </p>

      </div>

      <p className="fade-up mt-6 text-center text-[10px] tracking-[3px] text-gray-400" style={{ animationDelay: '450ms' }}>
        NOTES · YOUR PERSONAL SPACE
      </p>

    </AuthLayout>
  )
}

export default Register