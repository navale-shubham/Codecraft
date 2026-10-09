# CivicConnect Frontend

A React-based web application for crowdsourced civic issue reporting and resolution. This frontend integrates with the FastAPI backend to manage civic issue lifecycle across multiple stakeholder roles.

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_BASE_URL=https://codecraft.fastapicloud.dev/api/v1
VITE_BACKEND_URL=https://codecraft.fastapicloud.dev
```

The organization Wards / Areas map uses OpenStreetMap tiles and Leaflet-Geoman for free polygon drawing and editing. The map requires no provider API key and displays OpenStreetMap attribution.

### Development

```bash
npm run dev
```

Starts dev server at `http://localhost:5173`

### Build

```bash
npm run build
```

Creates optimized production build in `dist/`

### Lint

```bash
npm run lint
```

## Features by Role

### 👤 Citizens
- Report civic issues with location, photos, and description
- Track issue status from report to resolution
- View all reported issues and their progress
- Browse issues by category

### 🏢 Organization Administrators
- Oversee all issues across organization
- Manage departments and staff
- Configure issue categories and wards
- View organization-wide analytics

### 👥 Department Staff
- Manage issues assigned to their department
- Assign issues to field staff with due dates
- Approve field staff resolutions
- Track department performance

### 🔧 Field Staff
- View assigned issues
- Update issue status and provide progress
- Mark issues as completed for review
- Access detailed issue information

## Architecture

### API Integration

The frontend uses a centralized API client architecture:

```
src/api/
├── client.js          # Axios instance with interceptors
├── auth.js            # Authentication endpoints
├── citizen.js         # Citizen operations
├── organization.js    # Organization admin operations
├── department.js      # Department staff operations
└── fieldStaff.js      # Field staff operations
```

### State Management

- **Authentication**: React Context + localStorage
- **Component State**: React Hooks (useState, useEffect)
- **Form State**: react-hook-form

### Key Components

- **ProtectedRoute**: Enforces authentication
- **RoleRoute**: Enforces role-based access
- **AuthContext**: Global authentication state

## API Endpoints

All endpoints follow the backend contract at:
`https://codecraft.fastapicloud.dev/api/v1`

See `INTEGRATION_SUMMARY.md` for complete endpoint documentation.

## Development Guide

### Adding a New Feature

1. Create API service in `src/api/` (if needed)
2. Create page component in `src/pages/`
3. Add route in `src/routes/AppRoutes.jsx`
4. Use `useAuth()` for user context
5. Implement error/loading states
6. Add to appropriate role's navigation

### Common Patterns

#### Fetch Data with Error Handling
```jsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const load = async () => {
    try {
      const res = await apiModule.getFunction()
      setData(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [])
```

#### File Upload
```jsx
const file = fileInputRef.current.files[0]
await citizenAPI.uploadIssueMedia(issueId, file)
```

## Troubleshooting

### API Connection Issues
- Verify `VITE_API_BASE_URL` in `.env`
- Check backend is running
- Look for 401/403 errors (authentication/authorization)

### Build Errors
```bash
npm install  # Reinstall dependencies
npm run build  # Check for actual errors
```

### State Not Updating
- Ensure using proper hooks
- Check async operations are awaited
- Use proper dependency arrays in useEffect

## Performance

- **Bundle**: 788 KB JS, 25 KB CSS (gzipped)
- **Loading**: Skeleton states on all API-driven pages
- **Error Handling**: Graceful errors with retry options

## Security Notes

- Never hardcode API keys or tokens
- All tokens are managed securely via interceptors
- 401 errors trigger automatic logout
- Forms validate on both client and server

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

When modifying the integration:

1. Keep API calls in service modules only
2. Never hardcode test/mock data
3. Always implement loading and error states
4. Use the centralized API client (`src/api/client.js`)
5. Test on all supported browsers

## Deployment

### Production Build

```bash
npm run build
```

Deploy `dist/` folder to static hosting:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static server

### Environment Variables

Set `VITE_API_BASE_URL` and `VITE_BACKEND_URL` at deployment time or via `.env.production`

## Support

For issues or questions:
1. Check `INTEGRATION_SUMMARY.md` for integration details
2. Review component implementation in `src/pages/`
3. Check backend API documentation

---

**Status**: Frontend-Backend integration complete ✅

See `INTEGRATION_SUMMARY.md` for detailed integration documentation.
