import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, CheckCircle2, Clock3, MapPinned, UsersRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { redirectForRole } from '../../config/roles'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { getApiErrorMessage } from '../../utils/apiErrors'

export default function Login() {
  const { login, retryProfile, logout, profileError, accountType: restoredAccountType, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAccountType, setSelectedAccountType] = useState(null)
  const accountType = selectedAccountType ?? restoredAccountType
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { identifier: '', password: '' } })

  const submit = async (values) => {
    try {
      setError('')
      setIsLoading(true)
      const session = await login(values.identifier, values.password, accountType)
      const role = session.user?.role
      if (!role || !redirectForRole[role]) throw new Error('The server did not provide a supported account role. Please contact your administrator.')
      navigate(location.state?.from?.pathname || redirectForRole[role], { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside gradient-panel">
        <Link to="/" className="brand auth-brand">
          <span className="brand-icon"><MapPinned size={17} /></span>
          <span>Civic<span>Connect</span></span>
        </Link>
        <div className="auth-promo">
          <p className="eyebrow auth-eyebrow">Build a better community</p>
          <h1>Your city works <span>better when everyone</span> can participate.</h1>
          <p className="auth-description">One clear place to report civic problems, follow progress, and make change visible.</p>
          <ul className="auth-benefits">
            <li><CheckCircle2 aria-hidden="true" /><span>Report civic issues easily</span></li>
            <li><Clock3 aria-hidden="true" /><span>Track progress in real time</span></li>
            <li><UsersRound aria-hidden="true" /><span>Connect citizens with civic teams</span></li>
          </ul>
        </div>
      </aside>
      <main className="auth-card-wrap">
        <div className="auth-card">
          <p className="eyebrow">Sign in to CivicConnect</p>
          <h2>Good to see you again.</h2>
          <p className="muted">Enter your credentials to access your dashboard.</p>
          <form onSubmit={handleSubmit(submit)}>
            <label className="field">
              <span>Account type</span>
              <select className="input" value={accountType} onChange={(event) => setSelectedAccountType(event.target.value)} required>
                <option value="" disabled>Select your account type</option>
                <option value="CITIZEN">Citizen</option>
                <option value="ORG_ADMIN">Organization administrator</option>
                <option value="DEPARTMENT_STAFF">Department staff</option>
                <option value="FIELD_STAFF">Field staff</option>
              </select>
            </label>
            <Input
              label="Email"
              type="email"
              {...register('identifier', { required: 'Email is required' })}
              error={errors.identifier?.message}
            />
            <Input
              label="Password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />
            {error && !profileError && <p className="field-error">{error}</p>}
            {profileError && <div role="alert" className="surface auth-notice">
              <p className="field-error">{profileError}</p>
              {restoredAccountType && <Button type="button" className="btn-secondary" disabled={isLoading} onClick={async () => {
                setError('')
                setIsLoading(true)
                try {
                  const session = await retryProfile(accountType)
                  const role = session?.user?.role
                  if (role && redirectForRole[role]) navigate(redirectForRole[role], { replace: true })
                } catch (err) {
                  setError(getApiErrorMessage(err, 'Unable to load your profile. Please try again.'))
                } finally {
                  setIsLoading(false)
                }
              }}>Retry profile</Button>}
              <Button type="button" className="btn-ghost" onClick={logout}>Logout</Button>
            </div>}
            <div className="form-row">
              <label className="check-label">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-button">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="full-button" disabled={isLoading || authLoading}>
              {isLoading || authLoading ? 'Signing in...' : <>Sign in <ArrowRight size={16} /></>}
            </Button>
          </form>
          <p className="auth-switch">
            New to CivicConnect? <Link to="/register">Create a citizen account</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

