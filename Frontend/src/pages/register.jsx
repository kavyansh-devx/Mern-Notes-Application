
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../service/api'
import { Feedback } from '../components/Feedback'
import { getErrorMessage } from '../service/errors'

const Register = () => {

  const navigate = useNavigate();

  const [username, setusername] = useState('')
  const [password, setpassword] = useState('')
  const [confirmPassword, setconfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')

    if (!username || !password || !confirmPassword) {
      setErrorMessage('Please complete all fields.')
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return;
    }

    try {
      setSuccessMessage('')
      setIsSubmitting(true)
      await api.post('/auth/register', {
        username,
        password
      })

      setSuccessMessage('Your account was created. Redirecting to sign in…')

      setusername('')
      setpassword('')
      setconfirmPassword('')

      window.setTimeout(() => navigate('/login'), 1200)

    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to create your account. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }

  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-[#f8f8f8] px-4 py-16 text-black sm:px-6 sm:py-8 dark:bg-[#090909] dark:text-white">

      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-white/4 blur-[120px] rounded-full -top-25 left-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-5">
          <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg dark:bg-white">
            <span className="text-white text-2xl font-bold dark:text-black">N</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Create account.
          </h1>

          <p className="text-[#888888] mt-1 text-xs">
            Start organizing your thoughts in one place.
          </p>
        </div>

        {/* Register Card */}
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xl sm:p-6 dark:bg-[#151515] dark:border-[#292929] dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)]">

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <Feedback message={errorMessage} onDismiss={() => setErrorMessage('')} />
            {successMessage && (
              <p role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">
                {successMessage}
              </p>
            )}

            {/* Username */}
            <div>
              <label htmlFor="register-username" className="block text-sm font-medium mb-2">
                Username
              </label>

              <input
                id="register-username"
                onChange={(e) => setusername(e.target.value)}
                value={username}
                type="text"
                name="username"
                autoComplete="username"
                minLength={3}
                maxLength={64}
                required
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f5] border border-black/10 text-sm outline-none transition-all duration-300 focus:border-black dark:bg-[#202020] dark:border-[#383838] dark:text-white dark:placeholder:text-[#666666] dark:focus:border-[#888888] dark:focus:bg-[#252525]"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                id="register-password"
                onChange={(e) => setpassword(e.target.value)}
                value={password}
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f5] border border-black/10 text-sm outline-none transition-all duration-300 focus:border-black dark:bg-[#202020] dark:border-[#383838] dark:text-white dark:placeholder:text-[#666666] dark:focus:border-[#888888] dark:focus:bg-[#252525]"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>

              <input
                id="register-confirm-password"
                onChange={(e) => setconfirmPassword(e.target.value)}
                value={confirmPassword}
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f5] border border-black/10 text-sm outline-none transition-all duration-300 focus:border-black dark:bg-[#202020] dark:border-[#383838] dark:text-white dark:placeholder:text-[#666666] dark:focus:border-[#888888] dark:focus:bg-[#252525]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || Boolean(successMessage)}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E5]"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-[#333333] flex-1"></div>
            <span className="text-[9px] tracking-[2px] text-[#666666]">
              ALREADY A MEMBER?
            </span>
            <div className="h-px bg-[#333333] flex-1"></div>
          </div>

          {/* Login */}
          <p className="text-center text-xs text-[#888888]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-black underline underline-offset-4 transition hover:text-gray-600 dark:text-white dark:hover:text-[#BBBBBB]"
            >
              Sign in
            </Link>
          </p>

        </div>

        <p className="text-center text-[9px] text-[#555555] mt-5 tracking-[3px]">
          NOTES · YOUR PERSONAL SPACE
        </p>

      </div>
    </div>
  )
}

export default Register
