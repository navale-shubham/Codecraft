import EmptyState from '../../components/common/EmptyState'

export default function Notifications() {
  return <div>
    <div className="page-heading"><div><p className="eyebrow">Stay informed</p><h2>Notifications</h2><p className="muted">Updates about your reports.</p></div></div>
    <div className="surface"><EmptyState title="Notifications are unavailable" message="The current backend API does not expose a notifications endpoint." /></div>
  </div>
}
