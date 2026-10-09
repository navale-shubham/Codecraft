import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle2, MapPin, Upload, AlertCircle, Loader as LoaderIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { citizenAPI } from '../../api/citizen'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import TextArea from '../../components/common/TextArea'
import { extractIssueArray, normalizeIssue } from '../../utils/issues'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { unwrapApiData } from '../../utils/apiData'

export default function ReportIssue() {
  const [submitted, setSubmitted] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState(null)
  const [categoryReloadKey, setCategoryReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submissionProgress, setSubmissionProgress] = useState('')
  const [submitError, setSubmitError] = useState(null)
  const [uploadFailed, setUploadFailed] = useState(false)
  const [refreshFailed, setRefreshFailed] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', category: '', latitude: '', longitude: '' }
  })
  const latitude = watch('latitude')
  const longitude = watch('longitude')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        setCategoriesError(null)
        const response = await citizenAPI.getIssueCategories()
        
        if (response.success && Array.isArray(response.data)) {
          const validCategories = response.data.filter((category) => category?.id && category?.name)
          setCategories(validCategories)
          if (!validCategories.length) setCategoriesError('No categories are currently available.')
        } else {
          setCategoriesError('The server returned an unexpected category list.')
        }
      } catch (err) {
        setCategoriesError(getApiErrorMessage(err, 'Unable to load categories.'))
      } finally {
        setLoadingCategories(false)
      }
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude, { shouldValidate: true })
          setValue('longitude', position.coords.longitude, { shouldValidate: true })
        },
        () => {}
      )
    }

    loadCategories()
  }, [categoryReloadKey, setValue])

  const onSubmit = async (values) => {
    try {
      setSubmitting(true)
      setSubmitError(null)
      setUploadFailed(false)
      setRefreshFailed(false)

      const latitudeNumber = Number(values.latitude)
      const longitudeNumber = Number(values.longitude)
      if (!values.title?.trim() || !values.description?.trim() || !values.category || !Number.isFinite(latitudeNumber) || !Number.isFinite(longitudeNumber) || Math.abs(latitudeNumber) > 90 || Math.abs(longitudeNumber) > 180) {
        throw new Error('Enter a title, description, category, and valid latitude and longitude.')
      }

      setSubmissionProgress('Submitting issue...')
      const response = await citizenAPI.createIssue({
        title: values.title.trim(),
        description: values.description.trim(),
        category_id: values.category,
        location: { latitude: latitudeNumber, longitude: longitudeNumber },
      })

      if (!response?.success || !response.data?.id) {
        throw new Error(response?.message || 'The server did not confirm that the issue was created.')
      }

      const createdIssue = response.data
      const issueId = createdIssue.id
      
      if (selectedFiles.length) {
        for (const [index, file] of selectedFiles.entries()) {
          setSubmissionProgress(`Uploading image ${index + 1} of ${selectedFiles.length}...`)
          try {
            unwrapApiData(await citizenAPI.uploadIssueMedia(issueId, file))
          } catch {
            setUploadFailed(true)
          }
        }
      }

      let refreshedIssue = normalizeIssue(createdIssue)
      try {
        const latestIssues = extractIssueArray(await citizenAPI.getMyIssues())
        refreshedIssue = latestIssues.find((issue) => issue.id === issueId) || refreshedIssue
      } catch {
        setRefreshFailed(true)
      }
      setSubmitted(refreshedIssue)
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Unable to create the issue. Please try again.'))
    } finally {
      setSubmitting(false)
      setSubmissionProgress('')
    }
  }

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files || []))
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude, { shouldValidate: true })
          setValue('longitude', position.coords.longitude, { shouldValidate: true })
        },
        () => {
          setSubmitError('Unable to get current location. Please enable location services.')
        }
      )
    }
  }

  if (submitted) {
    return (
      <div className="success-page">
        <CheckCircle2 size={48} />
        <p className="eyebrow">Report submitted</p>
        <h1>Issue reported successfully.</h1>
        <p className="muted">
          Your issue ID is <strong>{submitted.issue_number || submitted.id}</strong>. It is ready for review.
        </p>
        {uploadFailed && <p className="field-error" role="alert">Issue was created successfully, but the image upload failed.</p>}
        {refreshFailed && <p className="muted" role="status">The issue was created, but we could not refresh your issue list.</p>}
        <div className="form-row">
          <Button onClick={() => navigate(`/citizen/issues/${submitted.id}`)}>View issue</Button>
          <Button variant="secondary" onClick={() => navigate('/citizen/issues')}>Track all issues</Button>
        </div>
      </div>
    )
  }

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }))

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Make your neighborhood heard</p>
          <h2>Report an issue</h2>
          <p className="muted">A few details help the right team respond faster.</p>
        </div>
      </div>

      <div className="report-layout">
        <form className="surface report-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-step">
            <span>01</span>
            <div>
              <h3>Where is the issue?</h3>
              <p className="muted">Pinpointing the location helps route your report automatically.</p>
            </div>
          </div>

          <div className="map-placeholder">
            <MapPin size={26} />
            <strong>Location: {Number.isFinite(Number(latitude)) && latitude !== '' && Number.isFinite(Number(longitude)) && longitude !== '' ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}` : 'Not set'}</strong>
            <small>Use the button below to get your current location or enter coordinates manually.</small>
            <button type="button" className="text-button" onClick={handleUseCurrentLocation}>
              Use current location
            </button>
          </div>

          <div className="form-grid">
            <Input label="Latitude" type="number" step="any" placeholder="e.g. 19.076" {...register('latitude', { valueAsNumber: true, required: 'Latitude is required', min: { value: -90, message: 'Latitude must be between -90 and 90' }, max: { value: 90, message: 'Latitude must be between -90 and 90' } })} error={errors.latitude?.message} />
            <Input label="Longitude" type="number" step="any" placeholder="e.g. 72.8777" {...register('longitude', { valueAsNumber: true, required: 'Longitude is required', min: { value: -180, message: 'Longitude must be between -180 and 180' }, max: { value: 180, message: 'Longitude must be between -180 and 180' } })} error={errors.longitude?.message} />
          </div>

          <div className="form-step">
            <span>02</span>
            <div>
              <h3>Tell us what happened</h3>
              <p className="muted">Describe the problem clearly so the team can act.</p>
            </div>
          </div>

          <Input
            label="Issue title"
            placeholder="Give your issue a clear name"
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
          />

          <div className="form-grid">
            {loadingCategories ? (
              <p className="muted">Loading categories...</p>
            ) : categoriesError ? (
              <div><p className="field-error">{categoriesError}</p><Button type="button" variant="secondary" onClick={() => setCategoryReloadKey((key) => key + 1)}>Retry categories</Button></div>
            ) : (
              <Select
                label="Category"
                options={categoryOptions}
                {...register('category', { required: 'Category is required' })}
                error={errors.category?.message}
              />
            )}
          </div>

          <TextArea
            label="Description"
            placeholder="What did you notice? Include useful details."
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message}
          />

          <div className="form-step">
            <span>03</span>
            <div>
              <h3>Add evidence</h3>
              <p className="muted">Photos make reports easier to verify.</p>
            </div>
          </div>

          <label className="upload-box">
            <Upload size={22} />
            <strong>Upload photos</strong>
            <small>{selectedFiles.length ? `Selected: ${selectedFiles.map((file) => file.name).join(', ')}` : 'Choose one or more images from your device'}</small>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
          </label>

          {submitError && (
            <div className="field-error field-error-message">
              <AlertCircle size={16} className="field-error-icon" />
              <span>{submitError}</span>
            </div>
          )}

          <Button type="submit" disabled={submitting || loadingCategories}>
            {submitting ? <>
              <LoaderIcon size={16} />
              {submissionProgress || 'Submitting issue...'}
            </> : 'Review and submit'}
          </Button>
        </form>

        <aside className="report-aside surface">
          <p className="eyebrow">What happens next?</p>
          <h3>Your report follows a clear path.</h3>
          <ol>
            <li><b>Reviewed</b><span>A coordinator checks the details.</span></li>
            <li><b>Routed</b><span>The right department receives it.</span></li>
            <li><b>Resolved</b><span>You can follow every update.</span></li>
          </ol>
        </aside>
      </div>
    </div>
  )
}

