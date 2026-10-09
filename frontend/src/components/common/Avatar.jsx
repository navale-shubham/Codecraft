export default function Avatar({ initials = 'CC', size = 'md' }) { return <span className={`avatar avatar-${size}`} aria-label={`Avatar ${initials}`}>{initials}</span> }
