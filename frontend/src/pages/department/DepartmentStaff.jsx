import { useEffect, useState } from 'react'
import { departmentAPI } from '../../api/department'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Input from '../../components/common/Input'
import Skeleton from '../../components/common/Skeleton'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { unwrapApiData, unwrapApiList } from '../../utils/apiData'

export default function DepartmentStaff() {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const loadStaff = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await departmentAPI.getFieldStaff()
        if (active) setStaff(unwrapApiList(response, ['staff', 'field_staff']))
      } catch (loadError) {
        if (active) setError(getApiErrorMessage(loadError, 'Unable to load field staff.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    loadStaff()
    return () => { active = false }
  }, [reloadKey])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    setSuccess('')
    try {
      unwrapApiData(await departmentAPI.createFieldStaff(form.name.trim(), form.email.trim(), form.password))
      setForm({ name: '', email: '', password: '' })
      setSuccess('Field staff member created successfully.')
      setReloadKey((key) => key + 1)
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError, 'Unable to create field staff member.'))
    } finally {
      setSaving(false)
    }
  }

  return <div>
    <div className="page-heading"><div><p className="eyebrow">Department workspace</p><h2>Field staff</h2><p className="muted">Manage staff assigned to department issues.</p></div><Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Refresh</Button></div>
    {error ? <div className="surface"><ErrorState title="Unable to load field staff" message={error} action={<Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>} /></div> : loading ? <div className="table-wrap surface"><Skeleton /></div> : staff.length ? <div className="table-wrap surface"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>ID</th></tr></thead><tbody>{staff.map((member) => <tr key={member.id}><td>{member.name || 'Not available'}</td><td>{member.email || 'Not available'}</td><td>{member.role || 'FIELD_STAFF'}</td><td>{member.id || 'Not available'}</td></tr>)}</tbody></table></div> : <div className="surface"><EmptyState title="No field staff found" message="Staff returned by the backend will appear here." /></div>}
    <section className="dashboard-section surface"><div className="section-heading"><h3>Add field staff</h3></div><form className="report-form" onSubmit={submit}>
      <Input label="Full name" value={form.name} onChange={update('name')} required maxLength={100} />
      <Input label="Email" type="email" value={form.email} onChange={update('email')} required maxLength={255} />
      <Input label="Temporary password" type="password" value={form.password} onChange={update('password')} required />
      {formError && <p className="field-error" role="alert">{formError}</p>}
      {success && <p className="muted" role="status">{success}</p>}
      <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create field staff'}</Button>
    </form></section>
  </div>
}
