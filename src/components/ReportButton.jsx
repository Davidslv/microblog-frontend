import { useState } from 'react';
import ReportModal from './ReportModal';

export default function ReportButton({ postId, onReportSuccess }) {
  const [showModal, setShowModal] = useState(false);

  const handleReport = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSuccess = () => {
    setShowModal(false);
    if (onReportSuccess) {
      onReportSuccess();
    }
  };

  return (
    <>
      <button
        onClick={handleReport}
      className="text-red-600 hover:text-red-800 text-sm transition-colors"
      title="Report this post"
    >
      Report
    </button>
    {showModal && (
      <ReportModal
        postId={postId}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    )}
    </>
  );
}

