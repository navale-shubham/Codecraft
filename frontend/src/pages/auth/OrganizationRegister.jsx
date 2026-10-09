import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, CheckCircle2, MapPinned } from 'lucide-react'
import { authAPI } from '../../api/auth'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { getApiErrorMessage } from '../../utils/apiErrors'

export default function OrganizationRegister() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const submit = async (values) => {
    try {
      setError('')
      setIsLoading(true)
      await authAPI.registerOrganization(
        values.contactName,
        values.email,
        values.organizationName,
        values.password
      )
      setSubmitted(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="success-page">
        <CheckCircle2 size={48} />
        <p className="eyebrow">You are all set</p>
        <h1>Welcome to CivicConnect.</h1>
        <p className="muted">Your organization account has been created successfully. You can now sign in as an administrator.</p>
        <Button onClick={() => navigate('/login')}>
          Go to login <ArrowRight size={16} />
        </Button>
      </div>
    )
  }

  return (
    <div className="auth-page register-page">
      <div className="auth-aside gradient-panel">
        <Link to="/" className="brand auth-brand">
          <span className="brand-icon"><MapPinned size={17} /></span>
          <span>Civic<span>Connect</span></span>
        </Link>
        <div>
          <p className="eyebrow auth-eyebrow">Register your organization</p>
          <h1>Manage civic issues at scale.</h1>
          <p>Create an organization account to coordinate your team's response to community reports.</p>
        </div>
      </div>
      <main className="auth-card-wrap">
        <div className="auth-card register-card">
          <p className="eyebrow">Create an organization account</p>
          <h2>Let's get started.</h2>
          <form onSubmit={handleSubmit(submit)}>
            <Input
              label="Organization Name"
              {...register('organizationName', { required: 'Organization name is required' })}
              error={errors.organizationName?.message}
            />
            <Input
              label="Contact Person Name"
              {...register('contactName', { required: 'Contact name is required' })}
              error={errors.contactName?.message}
            />
            <Input
              label="Email address"
              type="email"
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Use at least 6 characters' } })}
              error={errors.password?.message}
            />
            <Input
              label="Confirm password"
              type="password"
              {...register('confirmPassword', { validate: (value) => value === password || 'Passwords do not match' })}
              error={errors.confirmPassword?.message}
            />
            {error && <p className="field-error">{error}</p>}
            <Button type="submit" className="full-button" disabled={isLoading}>
              {isLoading ? 'Creating account...' : <>Create organization account <ArrowRight size={16} /></>}
            </Button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p className="auth-switch">
            Citizen? <Link to="/register">Create a citizen account</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
