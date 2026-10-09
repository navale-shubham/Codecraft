import { ArrowRight, CheckCircle2, FilePlus2, GitBranch, MapPinned, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicNavbar from '../../components/layout/PublicNavbar'
import Button from '../../components/common/Button'

export default function Home() {
  return <div className="public-shell">
    <PublicNavbar />
    <main>
      <section className="hero page-container">
        <div className="hero-copy">
          <p className="eyebrow">A better way to improve your city</p>
          <h1>Report problems.<br /><span className="gradient-text">Track progress.</span><br />Improve your community.</h1>
          <p className="hero-description">A shared place for citizens and civic teams to report, manage, and follow community issues.</p>
          <div className="hero-actions"><Link to="/register"><Button>Report an issue <ArrowRight size={16} /></Button></Link><Link to="/about" className="secondary-link">Explore the platform <ArrowRight size={15} /></Link></div>
          <div className="hero-trust"><span><CheckCircle2 size={15} /> Transparent by design</span><span><ShieldCheck size={15} /> Built for communities</span></div>
        </div>
        <div className="hero-preview"><div className="preview-window">
          <div className="preview-top"><span className="preview-dots">•••</span><span>How CivicConnect works</span><span>•••</span></div>
          <div className="preview-body">
            <div className="preview-stat"><small>Your dashboard</small><strong>Live account data</strong><span>Sign in to view current reports</span></div>
            <div className="preview-list">
              <div><span className="preview-avatar">01</span><span><b>Report an issue</b><small>Add a description and location</small></span></div>
              <div><span className="preview-avatar purple">02</span><span><b>Team review</b><small>The responsible team reviews reports</small></span></div>
              <div><span className="preview-avatar green">03</span><span><b>Track progress</b><small>Follow status changes in your account</small></span></div>
            </div>
          </div>
        </div></div>
      </section>
      <section className="how-section page-container"><div className="center-heading"><p className="eyebrow">Simple by design</p><h2>From report to resolution</h2><p>Every issue follows a clear path, so everyone knows what happens next.</p></div><div className="steps">{[['01', 'Report', FilePlus2, 'A citizen reports a civic issue.'], ['02', 'Route', GitBranch, 'The issue reaches the right department.'], ['03', 'Resolve', ShieldCheck, 'Staff work on the problem.'], ['04', 'Track', MapPinned, 'Everyone can follow the progress.']].map(([number, title, Icon, description]) => <div className="step" key={number}><span>{number}</span><Icon size={23} /><h3>{title}</h3><p>{description}</p></div>)}</div></section>
      <section className="feature-band"><div className="page-container feature-content"><div><p className="eyebrow">One shared civic workspace</p><h2>Make visible progress on the places you call home.</h2></div><div className="feature-points"><span><Users size={18} /> Citizens heard</span><span><ShieldCheck size={18} /> Departments aligned</span><span><CheckCircle2 size={18} /> Issues resolved</span></div></div></section>
      <section className="cta-section page-container"><h2>See something that needs attention?</h2><p>Turn a local observation into a visible step toward a better community.</p><Link to="/register"><Button>Start a report <ArrowRight size={16} /></Button></Link></section>
    </main>
    <footer className="public-footer page-container"><span className="brand"><span className="brand-icon"><MapPinned size={17} /></span>Civic<span>Connect</span></span><span>© 2026 CivicConnect · Built for better neighborhoods</span></footer>
  </div>
}
