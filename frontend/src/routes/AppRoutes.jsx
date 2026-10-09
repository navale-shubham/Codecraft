import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../components/layout/DashboardLayout'
import Home from '../pages/public/Home'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import OrganizationRegister from '../pages/auth/OrganizationRegister'
import ForgotPassword from '../pages/auth/ForgotPassword'
import CitizenDashboard from '../pages/citizen/CitizenDashboard'
import ReportIssue from '../pages/citizen/ReportIssue'
import MyIssues from '../pages/citizen/MyIssues'
import IssueDetails from '../pages/citizen/IssueDetails'
import OrganizationDashboard from '../pages/organization/OrganizationDashboard'
import DepartmentDashboard from '../pages/department/DepartmentDashboard'
import CitizenProfile from '../pages/citizen/CitizenProfile'
import Notifications from '../pages/citizen/Notifications'
import RoleRoute from './RoleRoute'
import StaffDashboard from '../pages/staff/StaffDashboard'
import AssignedIssueDetails from '../pages/staff/AssignedIssueDetails'
import OrganizationManagement from '../pages/organization/OrganizationManagement'
import DepartmentIssues from '../pages/department/DepartmentIssues'
import DepartmentStaff from '../pages/department/DepartmentStaff'
import DepartmentAssignments from '../pages/department/DepartmentAssignments'
import AccountProfile from '../pages/auth/AccountProfile'

function Placeholder({ title, message = 'The current backend API does not expose this module yet.' }) {
  return (
    <main className="page-container page-message">
      <p className="eyebrow">CivicConnect</p>
      <h1>{title}</h1>
      <p>{message}</p>
    </main>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/organization" element={<OrganizationRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/about" element={<Placeholder title="About CivicConnect" message="CivicConnect brings citizens and civic teams into one issue reporting and resolution workflow." />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute roles={['CITIZEN']} />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/report" element={<ReportIssue />} />
            <Route path="/citizen/issues" element={<MyIssues />} />
            <Route path="/citizen/issues/:id" element={<IssueDetails />} />
            <Route path="/citizen/notifications" element={<Notifications />} />
            <Route path="/citizen/profile" element={<CitizenProfile />} />
            <Route path="/citizen/*" element={<Placeholder title="Citizen workspace" />} />
          </Route>
          <Route
            path="/organization/dashboard"
            element={
              <RoleRoute roles={['ORG_ADMIN']}>
                <OrganizationDashboard />
              </RoleRoute>
            }
          />
          <Route path="/organization/departments" element={<RoleRoute roles={['ORG_ADMIN']}><OrganizationManagement /></RoleRoute>} />
          <Route path="/organization/areas" element={<RoleRoute roles={['ORG_ADMIN']}><OrganizationManagement /></RoleRoute>} />
          <Route path="/organization/categories" element={<RoleRoute roles={['ORG_ADMIN']}><OrganizationManagement /></RoleRoute>} />
          <Route path="/organization/staff" element={<RoleRoute roles={['ORG_ADMIN']}><OrganizationManagement /></RoleRoute>} />
          <Route path="/organization/analytics" element={<RoleRoute roles={['ORG_ADMIN']}><OrganizationDashboard /></RoleRoute>} />
          <Route path="/organization/notifications" element={<RoleRoute roles={['ORG_ADMIN']}><Placeholder title="Notifications" /></RoleRoute>} />
          <Route
            path="/organization/*"
            element={
              <RoleRoute roles={['ORG_ADMIN']}>
                <Placeholder title="Organization workspace" />
              </RoleRoute>
            }
          />
          <Route
            path="/department/dashboard"
            element={
              <RoleRoute roles={['DEPARTMENT_STAFF']}>
                <DepartmentDashboard />
              </RoleRoute>
            }
          />
          <Route path="/department/issues" element={<RoleRoute roles={['DEPARTMENT_STAFF']}><DepartmentIssues /></RoleRoute>} />
          <Route path="/department/issues/:id" element={<RoleRoute roles={['DEPARTMENT_STAFF']}><DepartmentIssues /></RoleRoute>} />
          <Route path="/department/assignments" element={<RoleRoute roles={['DEPARTMENT_STAFF']}><DepartmentAssignments /></RoleRoute>} />
          <Route path="/department/staff" element={<RoleRoute roles={['DEPARTMENT_STAFF']}><DepartmentStaff /></RoleRoute>} />
          <Route path="/department/analytics" element={<RoleRoute roles={['DEPARTMENT_STAFF']}><DepartmentDashboard /></RoleRoute>} />
          <Route path="/department/notifications" element={<RoleRoute roles={['DEPARTMENT_STAFF']}><Placeholder title="Notifications" /></RoleRoute>} />
          <Route
            path="/field-staff/dashboard"
            element={
              <RoleRoute roles={['FIELD_STAFF']}>
                <StaffDashboard />
              </RoleRoute>
            }
          />
          <Route path="/field-staff/assignments" element={<RoleRoute roles={['FIELD_STAFF']}><StaffDashboard /></RoleRoute>} />
          <Route path="/field-staff/issues/:id" element={<RoleRoute roles={['FIELD_STAFF']}><AssignedIssueDetails /></RoleRoute>} />
          <Route path="/field-staff/notifications" element={<RoleRoute roles={['FIELD_STAFF']}><Placeholder title="Notifications" /></RoleRoute>} />
          <Route path="/field-staff/updates" element={<RoleRoute roles={['FIELD_STAFF']}><Placeholder title="Updates" /></RoleRoute>} />
          <Route
            path="/department/*"
            element={
              <RoleRoute roles={['DEPARTMENT_STAFF']}>
                <Placeholder title="Department workspace" />
              </RoleRoute>
            }
          />
          <Route
            path="/field-staff/*"
            element={
              <RoleRoute roles={['FIELD_STAFF']}>
                <Placeholder title="Field staff workspace" />
              </RoleRoute>
            }
          />
          <Route
            path="/staff/*"
            element={
              <RoleRoute roles={['FIELD_STAFF']}>
                <Placeholder title="Field staff workspace" />
              </RoleRoute>
            }
          />
          <Route path="/profile" element={<AccountProfile />} />
        </Route>
      </Route>
      <Route path="*" element={<Placeholder title="Page not found" message="This page does not exist." />} />
    </Routes>
  )
}

