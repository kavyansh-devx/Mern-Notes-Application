import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../service/api'
import AuthContext from '../context/AuthContext'
import AuthLayout, { Field, Spinner } from '../components/AuthLayout'

const Login = () => {

  const navigate = useNavigate()

  const [username, setusername] = useState('')
  const [password, setpassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { setUser } = useContext(AuthContext)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!username || !password) {
      alert('Please fill all fields')
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/auth/login', {
        username,
        password,
      })

      console.log('Login successful:', response.data)

      setusername('')
      setpassword('')

      setUser(response.data.user)
      navigate('/dashboard')

    } catch (error) {
      console.error('Login failed:', error)

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid username or password'
      )

    } finally {
      setLoading(false)
      setusername('')
      setpassword('')
    }
  }

  return (
    <AuthLayout watermark="login">

      {/* Logo + heading */}
      <div className="fade-up mb-8 text-center" style={{ animationDelay: '100ms' }}>

        <div className="logo-float mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 shadow-[0_10px_30px_rgba(41,37,36,0.25)] dark:bg-white">
          <span className="text-3xl font-bold text-white dark:text-black">N</span>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight">
          Welcome <span className="font-serif italic">back.</span>
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter your details to access your workspace.
        </p>

      </div>

      {/* Card */}
      <div
        className="fade-up rounded-3xl border border-stone-200/80 bg-white/80 p-8 shadow-[0_2px_6px_rgba(55,45,28,0.05),0_24px_60px_rgba(55,45,28,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#151515]/85 dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        style={{ animationDelay: '250ms' }}
      >

        <form onSubmit={handleSubmit} className="space-y-6">

          <Field
            label="Username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
          />

          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(41,37,36,0.18),0_14px_30px_rgba(41,37,36,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-800 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5]"
          >
            {loading ? <><Spinner />Signing in...</> : 'Sign In'}
          </button>

        </form>

        {/* Divider */}
        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-stone-200 dark:bg-white/10"></div>
          <span className="text-[10px] tracking-[2px] text-gray-400">NEW HERE?</span>
          <div className="h-px flex-1 bg-stone-200 dark:bg-white/10"></div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-stone-900 underline underline-offset-4 transition hover:text-gray-500 dark:text-white dark:hover:text-gray-300"
          >
            Create account
          </Link>
        </p>

      </div>

      <p className="fade-up mt-8 text-center text-[10px] tracking-[3px] text-gray-400" style={{ animationDelay: '450ms' }}>
        NOTES · YOUR PERSONAL SPACE
      </p>

    </AuthLayout>
  )
}

export default Login