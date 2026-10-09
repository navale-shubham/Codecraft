import Modal from './Modal'
import Button from './Button'
export default function ConfirmDialog({ open, title = 'Are you sure?', onClose, onConfirm }) { return <Modal open={open} title={title} onClose={onClose}><p className="muted">Confirm this action to continue.</p><div className="modal-actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={onConfirm}>Confirm</Button></div></Modal> }
