export default function Button({ children, variant = 'primary', className = '', ...props }) { return <button className={`btn btn-${variant} focus-ring ${className}`} {...props}>{children}</button> }
