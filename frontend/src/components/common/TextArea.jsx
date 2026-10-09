export default function TextArea({ label, ...props }) { return <label className="field"><span>{label}</span><textarea className="input focus-ring" rows="4" {...props} /></label> }
