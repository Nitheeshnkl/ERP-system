import React from 'react'

interface EmailVerificationModalProps {
  open: boolean
  onClose: () => void
  onResend: () => void
}

export default function EmailVerificationModal({ open, onClose, onResend }: EmailVerificationModalProps) {
  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="email-verify-title">
      <div className="modal">
        <h2 id="email-verify-title">Email Verification Required</h2>
        <p>
          Your account was created successfully. Please check your email and click the verification link.
        </p>
        <button type="button" onClick={onResend}>
          Resend Verification Email
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
