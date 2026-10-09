import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { organizationAPI } from '../../api/organization'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Input from '../../components/common/Input'
import Skeleton from '../../components/common/Skeleton'
import WardBoundaryMap from '../../components/organization/WardBoundaryMap'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { unwrapApiData, unwrapApiList } from '../../utils/apiData'
import { buildWardGeoBoundary, validateWardBoundary } from '../../utils/wardBoundary'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
const sections = {
  departments: { title: 'Departments', noun: 'department', load: organizationAPI.getDepartments, save: (form) => organizationAPI.createDepartment({ name: form.name.trim() }) },
  areas: { title: 'Wards / Areas', noun: 'ward', load: organizationAPI.getWards, save: (form, boundaryPoints) => organizationAPI.createWard({ name: form.name.trim(), geo_boundary: buildWardGeoBoundary(boundaryPoints) }) },
  categories: { title: 'Issue Categories', noun: 'category', load: organizationAPI.getCategories, save: (form) => organizationAPI.createCategory({ name: form.name.trim(), department_id: form.departmentId }) },
  staff: { title: 'Department Staff', noun: 'staff member', load: organizationAPI.getStaff, save: (form) => organizationAPI.createStaff({ name: form.name.trim(), email: form.email.trim(), password: form.password, ...(form.departmentId ? { department_id: form.departmentId } : {}) }) },
}

function rowsFor(response, key) {
  return unwrapApiList(response, [key])
}

export default function OrganizationManagement() {
  const { pathname } = useLocation()
  const sectionKey = pathname.split('/')[2]
  const section = sections[sectionKey] || sections.departments
  const [rows, setRows] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', departmentId: '' })
  const [boundaryPoints, setBoundaryPoints] = useState([])
  const [wardTouched, setWardTouched] = useState(false)
  const [mapResetVersion, setMapResetVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [departmentsError, setDepartmentsError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      setDepartmentsError('')
      try {
        const response = await section.load()
        const listKey = sectionKey === 'areas' ? 'wards' : sectionKey
        const items = rowsFor(response, listKey)
        if (active) setRows(items)
      } catch (loadError) {
        if (active) setError(getApiErrorMessage(loadError, `Unable to load ${section.title.toLowerCase()}.`))
      }
      if (['categories', 'staff'].includes(sectionKey)) {
        try {
          const response = await organizationAPI.getDepartments()
          if (active) setDepartments(rowsFor(response, 'departments'))
        } catch (loadError) {
          if (active) setDepartmentsError(getApiErrorMessage(loadError, 'Unable to load departments.'))
        }
      }
      if (active) setLoading(false)
    }
    load()
    return () => { active = false }
  }, [reloadKey, section, sectionKey])

  const departmentOptions = useMemo(() => departments.map((department) => ({ value: department.id, label: department.name })), [departments])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    setSuccess('')
    try {
      if (!form.name.trim()) throw new Error(sectionKey === 'areas' ? 'Please enter a ward name.' : `Enter a ${section.noun} name.`)
      if (sectionKey === 'areas') {
        const boundaryError = validateWardBoundary(form.name, boundaryPoints)
        if (boundaryError) throw new Error(boundaryError)
      }
      if (['categories', 'staff'].includes(sectionKey) && departmentsError) throw new Error(departmentsError)
      if (sectionKey === 'categories' && !form.departmentId) throw new Error('Select a department for this category.')
      if (sectionKey === 'staff' && (!form.email.trim() || !form.password)) throw new Error('Enter the staff member’s email and password.')
      unwrapApiData(await section.save(form, boundaryPoints))
      setForm({ name: '', email: '', password: '', departmentId: '' })
      if (sectionKey === 'areas') {
        setBoundaryPoints([])
        setWardTouched(false)
        setMapResetVersion((version) => version + 1)
      }
      setSuccess(sectionKey === 'areas' ? 'Ward created successfully.' : `${section.title.replace(/s$/, '')} created successfully.`)
      setReloadKey((key) => key + 1)
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError, `Unable to create ${section.noun}.`))
    } finally {
      setSaving(false)
    }
  }

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const wardValidationMessage = sectionKey === 'areas' ? validateWardBoundary(form.name, boundaryPoints) : ''

  return <div>
    <div className="page-heading"><div><p className="eyebrow">Organization workspace</p><h2>{section.title}</h2><p className="muted">Manage live {section.title.toLowerCase()} records.</p></div></div>
    {error && <div className="surface"><ErrorState title={`Unable to load ${section.title.toLowerCase()}`} message={error} action={<Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>} /></div>}
    {!error && <section className="dashboard-section">
      <div className="section-heading"><h3>Current {section.title.toLowerCase()}</h3></div>
      {loading ? <div className="table-wrap surface"><Skeleton /></div> : rows.length ? <div className="table-wrap surface"><table><thead><tr>{sectionKey === 'departments' ? <><th>Department</th><th>ID</th><th>Total issues</th><th>Open issues</th><th>Resolved</th></> : sectionKey === 'areas' ? <><th>Ward</th><th>ID</th><th>Issues</th></> : sectionKey === 'categories' ? <><th>Category</th><th>ID</th></> : <><th>Name</th><th>Email</th><th>Role</th><th>ID</th></>}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{sectionKey === 'departments' ? <><td>{row.name || 'Not available'}</td><td>{row.id || 'Not available'}</td><td>{row.dashboard?.total_issues ?? 'Not available'}</td><td>{row.dashboard?.open_issues ?? 'Not available'}</td><td>{row.dashboard?.resolved_issues ?? 'Not available'}</td></> : sectionKey === 'areas' ? <><td>{row.name || 'Not available'}</td><td>{row.id || 'Not available'}</td><td>{Array.isArray(row.issues) ? row.issues.length : typeof row.issues === 'number' ? row.issues : 'Not available'}</td></> : sectionKey === 'categories' ? <><td>{row.name || 'Not available'}</td><td>{row.id || 'Not available'}</td></> : <><td>{row.name || 'Not available'}</td><td>{row.email || 'Not available'}</td><td>{row.role || 'Not available'}</td><td>{row.id || 'Not available'}</td></>}</tr>)}</tbody></table></div> : <div className="surface"><EmptyState title={sectionKey === 'areas' ? 'No wards / areas found.' : `No ${section.title.toLowerCase()} found`} message="Records returned by the backend will appear here." /></div>}
    </section>}

    <section className="dashboard-section surface">
      <div className="section-heading"><h3>Add {section.noun}</h3></div>
      {departmentsError && ['categories', 'staff'].includes(sectionKey) && <p className="field-error" role="alert">{departmentsError}</p>}
      <form className="report-form" onSubmit={submit}>
        {sectionKey !== 'areas' && <Input label={sectionKey === 'categories' ? 'Category name' : sectionKey === 'staff' ? 'Staff member name' : 'Department name'} value={form.name} onChange={update('name')} required />}
        {sectionKey === 'areas' && <>
          <Input label="Ward name" placeholder="Enter ward name" value={form.name} onChange={(event) => { update('name')(event); setWardTouched(true) }} minLength={2} required />
          <WardBoundaryMap key={mapResetVersion} wards={rows} onBoundaryChange={setBoundaryPoints} />
        </>}
        {sectionKey === 'categories' && <label className="field"><span>Department</span><select className="input" value={form.departmentId} onChange={update('departmentId')} required><option value="">Select department</option>{departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
        {sectionKey === 'staff' && <>
          <Input label="Email" type="email" value={form.email} onChange={update('email')} required />
          <Input label="Temporary password" type="password" value={form.password} onChange={update('password')} required />
          <label className="field"><span>Department (optional)</span><select className="input" value={form.departmentId} onChange={update('departmentId')}><option value="">No department selected</option>{departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        </>}
        {formError && <p className="field-error" role="alert">{formError}</p>}
        {sectionKey === 'areas' && !formError && wardTouched && wardValidationMessage && <p className="field-error" role="alert">{wardValidationMessage}</p>}
        {success && <p className="muted" role="status">{success}</p>}
        {sectionKey !== 'areas' && <Button type="submit" disabled={saving || loading || (['categories', 'staff'].includes(sectionKey) && departmentsError)}>{saving ? 'Saving...' : `Add ${section.noun}`}</Button>}
        {sectionKey === 'areas' && <Button type="submit" disabled={saving || loading || Boolean(wardValidationMessage)}>{saving ? 'Saving...' : 'Add Ward'}</Button>}
      </form>
    </section>
  </div>
}
