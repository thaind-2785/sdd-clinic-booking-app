'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface AppointmentActionsProps {
  appointmentId: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  onActionComplete?: () => void;
}

export function AppointmentActions({
  appointmentId,
  status,
  onActionComplete,
}: AppointmentActionsProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/appointments/${appointmentId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve appointment');
      }

      setMessage({
        text: 'Appointment approved successfully',
        type: 'success',
      });
      setShowApproveModal(false);
      onActionComplete?.();
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Failed to approve appointment',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.trim().length < 10) {
      setMessage({
        text: 'Rejection reason must be at least 10 characters',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/appointments/${appointmentId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rejection_reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject appointment');
      }

      setMessage({
        text: 'Appointment rejected successfully',
        type: 'success',
      });
      setShowRejectModal(false);
      setRejectionReason('');
      onActionComplete?.();
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Failed to reject appointment',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'Pending') {
    return null;
  }

  return (
    <>
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => setShowApproveModal(true)}
          disabled={loading}
        >
          Approve
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
        >
          Reject
        </Button>
      </div>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
      >
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Confirm Approval
          </h3>
          <p className="mb-6 text-gray-600">
            Are you sure you want to approve this appointment? The time slot
            will be marked as unavailable.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowApproveModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal with Reason */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Reject Appointment
          </h3>
          <p className="mb-4 text-gray-600">
            Please provide a reason for rejecting this appointment (minimum 10
            characters):
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="focus:ring-healthcare-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
            rows={4}
            placeholder="Enter rejection reason..."
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReject} disabled={loading}>
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Message Notification */}
      {message && (
        <div
          className={`fixed top-4 right-4 rounded-lg px-4 py-3 shadow-lg ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.text}
        </div>
      )}
    </>
  );
}
