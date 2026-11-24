import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../service/api'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'
import { Feedback } from '../components/Feedback'
import { getErrorMessage } from '../service/errors'

const Login = () => {

  const navigate = useNavigate()

  const [username, setusername] = useState('')
  const [password, setpassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const {setUser, authError, setAuthError} = useContext(AuthContext)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!username || !password) {
      setErrorMessage('Please enter both your username and password.')
      return
    }

    try {
      setErrorMessage('')
      setAuthError('')
      setLoading(true)

      const response = await api.post('/auth/login', {
        username,
        password,
      })

      setusername('')
      setpassword('')

      setUser(response.data.user)
      navigate('/dashboard')

    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to sign in. Please try again.'))

    } finally {
      setLoading(false)
      setusername('')
      setpassword('')

    }

  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#f8f8f8] px-4 py-16 text-black sm:px-6 sm:py-10 dark:bg-[#090909] dark:text-white">

      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-white/4 blur-[120px] rounded-full -top-25 left-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="mb-7 text-center sm:mb-9">

          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black shadow-lg sm:h-14 sm:w-14 sm:mb-6 dark:bg-white">
            <span className="text-white text-3xl font-bold dark:text-black">N</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back.
          </h1>

          <p className="text-[#888888] mt-2 text-sm">
            Enter your details to access your workspace.
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xl sm:p-8 dark:bg-[#151515] dark:border-[#292929] dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)]">

          <form onSubmit={handleSubmit} className="space-y-6">
            <Feedback
              message={errorMessage || authError}
              onDismiss={() => {
                setErrorMessage('')
                setAuthError('')
              }}
            />

            {/* Username */}
            <div>
              <label htmlFor="login-username" className="block text-sm font-medium mb-2">
                Username
              </label>

              <input
                id="login-username"
                onChange={(e) => setusername(e.target.value)}
                value={username}
                type="text"
                name="username"
                autoComplete="username"
                minLength={1}
                maxLength={64}
                required
                placeholder="Enter your username"
                className="w-full px-4 py-3.5 rounded-xl bg-[#f5f5f5] border border-black/10 outline-none transition-all duration-300 focus:border-black dark:bg-[#202020] dark:border-[#383838] dark:text-white dark:placeholder:text-[#666666] dark:focus:border-[#888888] dark:focus:bg-[#252525]"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                id="login-password"
                onChange={(e) => setpassword(e.target.value)}
                value={password}
                type="password"
                name="password"
                autoComplete="current-password"
                maxLength={72}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 rounded-xl bg-[#f5f5f5] border border-black/10 outline-none transition-all duration-300 focus:border-black dark:bg-[#202020] dark:border-[#383838] dark:text-white dark:placeholder:text-[#666666] dark:focus:border-[#888888] dark:focus:bg-[#252525]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="h-px bg-[#333333] flex-1"></div>
            <span className="text-[10px] tracking-[2px] text-[#666666]">
              NEW HERE?
            </span>
            <div className="h-px bg-[#333333] flex-1"></div>
          </div>

          {/* Register */}
          <p className="text-center text-sm text-[#888888]">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-black underline underline-offset-4 transition hover:text-gray-600 dark:text-white dark:hover:text-[#BBBBBB]"
            >
              Create account
            </Link>
          </p>

        </div>

        <p className="text-center text-[10px] text-[#555555] mt-8 tracking-[3px]">
          NOTES · YOUR PERSONAL SPACE
        </p>

      </div>
    </div>
  )
}

export default Login
