import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../features/store';
import { useCreateComplaintMutation } from '../api/complaintsApi';
import { FaPaperPlane, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

type Props = {
  apId: number;
};

const MyComplaints = ({ apId }: Props) => {
  const user = useSelector((state: RootState) => state.user?.user);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!user) {
      toast.error("User not found. Please log in again.");
      return;
    }

    try {
      await createComplaint({
        userId: user.user_id,
        apId,
        subject: subject.trim(),
        description: description.trim(),
      }).unwrap();

      toast.success("Complaint submitted successfully.");
      setSubject('');
      setDescription('');
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to submit complaint.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (subject.trim() || description.trim()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setSubject('');
        setDescription('');
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const isFormValid = subject.trim() && description.trim();
  const remainingChars = 500 - description.length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <FaExclamationTriangle className="inline mr-2" />
        Provide Feedback
        <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative transform transition-all duration-200 animate-in zoom-in-95"
            role="dialog"
            aria-labelledby="complaint-title"
            aria-describedby="complaint-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 id="complaint-title" className="text-xl font-semibold text-gray-900">
                  Provide Feedback
                </h2>
                <p id="complaint-description" className="text-sm text-gray-600 mt-1">
                  Help us improve by sharing your feedback
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Close dialog"
              >
                <FaTimes className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Subject Field */}
              <div>
                <label 
                  htmlFor="complaint-subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="complaint-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 placeholder-gray-400"
                  placeholder="Brief summary of the issue (e.g., Doctor was late)"
                  maxLength={100}
                  required
                />
                <div className="mt-1 text-xs text-gray-500">
                  {subject.length}/100 characters
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label 
                  htmlFor="complaint-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="complaint-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 placeholder-gray-400 resize-none"
                  placeholder="Please provide detailed information about the issue, including what happened, when it occurred, and how it affected you..."
                  maxLength={500}
                  required
                />
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-gray-500">Be as specific as possible</span>
                  <span className={`${remainingChars < 50 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {remainingChars} characters remaining
                  </span>
                </div>
              </div>

              {/* Form Validation Message */}
              {!isFormValid && (subject || description) && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <FaExclamationTriangle className="text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-amber-700">
                    Please fill in all required fields to submit your complaint.
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !isFormValid}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyComplaints;