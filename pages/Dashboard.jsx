import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// New Complaint Form Component
function NewComplaintForm({ user }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [files, setFiles] = useState([]);
  const [classification, setClassification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const classifyComplaint = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please enter both title and description for classification');
      return;
    }

    setIsClassifying(true);
    setError('');

    try {
      const response = await fetch('http://localhost:6969/api/ml/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `${formData.title} ${formData.description}`
        })
      });

             const data = await response.json();
       console.log('Classification API response:', data);

       if (data.success) {
         // Transform the API response to match expected format
         const classificationData = {
           category: data.data.predicted_category,
           priority: data.data.predicted_priority,
           method: data.data.classification_method
         };
         console.log('Transformed classification data:', classificationData);
         setClassification(classificationData);
       } else {
         setError(data.message || 'Classification failed');
       }
    } catch (error) {
      setError('Failed to classify complaint. Please try again.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());

      // Add files if any
      files.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      const response = await fetch('http://localhost:6969/api/complaints/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Complaint submitted successfully!');
        setFormData({ title: '', description: '' });
        setFiles([]);
        setClassification(null);
      } else {
        setError(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Technical': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Academic': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Hostel/Mess': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Maintenance': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submit New Complaint</h2>
            <p className="text-gray-600">Describe your issue and we'll help you get it resolved</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Brief description of your issue"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Please provide detailed information about your issue..."
              required
            />
          </div>

          {/* Classification Button */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={classifyComplaint}
              disabled={!formData.title.trim() || !formData.description.trim() || isClassifying}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isClassifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Classifying...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  <span>Classify Complaint</span>
                </>
              )}
            </button>
            
            {classification && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircleSolidIcon className="h-5 w-5" />
                <span>Classified successfully</span>
              </div>
            )}
          </div>

                     {/* Classification Results */}
           {classification && (
             <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Classification Results</h3>
               {console.log('Rendering classification:', classification)}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className={`p-4 rounded-xl border ${getCategoryColor(classification.category)}`}>
                   <div className="flex items-center space-x-2">
                     <DocumentTextIcon className="h-5 w-5" />
                     <span className="font-medium">Category</span>
                   </div>
                   <p className="text-lg font-semibold mt-1">{classification.category || 'N/A'}</p>
                 </div>
                 <div className={`p-4 rounded-xl border ${getPriorityColor(classification.priority)}`}>
                   <div className="flex items-center space-x-2">
                     <ExclamationTriangleIcon className="h-5 w-5" />
                     <span className="font-medium">Priority</span>
                   </div>
                   <p className="text-lg font-semibold mt-1 capitalize">{classification.priority || 'N/A'}</p>
                 </div>
               </div>
               <p className="text-sm text-gray-600 mt-3">
                 <span className="font-medium">Method:</span> {classification.method || 'N/A'}
               </p>
             </div>
           )}

          {/* File Upload */}
          <div>
            <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="files"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label htmlFor="files" className="cursor-pointer">
                <div className="text-center">
                  <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload files or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Images, PDF, DOC files up to 10MB each
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <PaperClipIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircleSolidIcon className="h-5 w-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Raise Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// AI Assistant Chat Popup Component
function AIAssistantPopup({ isOpen, onClose, user }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:6969/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message,
          user_id: user?.id,
          user_role: user?.role
        })
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.bot_response,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          complaintData: data.complaint_data || null
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        setError(data.message || 'Failed to get response from AI assistant');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const formatMessage = (text) => {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/📋|🎫|👤|📝|💻|🔴|🟡|📅|🔄|📎|⏳|🤖/g, '')
      .replace(/\n/g, '<br>');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Chat Popup */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-600">Ask me anything about your complaints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Assistant</h3>
                <p className="text-gray-600 mb-4">I'm here to help you with your complaints and queries</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">📋 Check Complaint Status</h4>
                    <p className="text-sm text-gray-600">Ask about your ticket status and progress</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">🔍 General Questions</h4>
                    <p className="text-sm text-gray-600">Get help with any complaint-related queries</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-6 py-4 shadow-sm border ${message.sender === 'user' ? 'border-blue-200' : 'border-gray-200'}`}>
                  <div 
                    className="prose prose-sm max-w-none leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                  />
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                    <div className="flex items-center space-x-2">
                      {message.sender === 'bot' && (
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <SparklesIcon className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <span className="text-xs opacity-70">
                        {message.sender === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 rounded-2xl px-6 py-4 shadow-sm border border-gray-200 max-w-[85%]">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 text-red-700 rounded-2xl px-6 py-4 shadow-sm border border-red-200 max-w-[85%]">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your complaints..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Track Progress Component
function TrackProgressSection({ user }) {
  const { token } = useAuth();
  const [ticketId, setTicketId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const searchComplaint = async () => {
    if (!ticketId.trim()) {
      setError('Please enter a ticket ID');
      return;
    }

    setLoading(true);
    setError('');
    setComplaint(null);
    setSearched(true);

    try {
      const response = await fetch(`http://localhost:6969/api/chatbot/check-status?ticket_id=${ticketId.trim()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.has_complaint_data) {
        setComplaint(data.complaint_data);
      } else {
        setError(data.message || 'Complaint not found');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchComplaint();
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'in_progress': return 2;
      case 'resolved': return 3;
      case 'closed': return 3;
      default: return 1;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Track Progress</h2>
            <p className="text-gray-600">Enter your ticket ID to track the status of your complaint</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700 mb-2">
              Ticket ID
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                id="ticketId"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                placeholder="Enter your ticket ID (e.g., CMP20241201ABCD)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-mono"
                required
              />
              <button
                type="submit"
                disabled={loading || !ticketId.trim()}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <span>Track</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl mt-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Progress Display */}
      {complaint && (
        <div className="space-y-6">
          {/* Complaint Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{complaint.title}</h3>
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                    {complaint.ticket_id}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{complaint.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created: {formatDate(complaint.created_at)}</span>
                  {complaint.resolved_at && (
                    <span>Resolved: {formatDate(complaint.resolved_at)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Progress Timeline</h4>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Steps */}
                <div className="space-y-8">
                  {/* Step 1: Raised */}
                  <div className="relative flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full z-10 relative">
                      <CheckCircleIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-6 flex-1">
                      <h5 className="text-lg font-semibold text-gray-900">Complaint Raised</h5>
                      <p className="text-gray-600 mb-2">Your complaint has been successfully submitted</p>
                      <p className="text-sm text-gray-500">{formatDate(complaint.created_at)}</p>
                    </div>
                  </div>

                  {/* Step 2: In Progress */}
                  <div className="relative flex items-start">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full z-10 relative ${
                      getStatusStep(complaint.status) >= 2 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {getStatusStep(complaint.status) >= 2 ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <ClockIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-6 flex-1">
                      <h5 className="text-lg font-semibold text-gray-900">Under Review</h5>
                      <p className="text-gray-600 mb-2">Your complaint is being reviewed by our team</p>
                      {complaint.status === 'in_progress' && (
                        <p className="text-sm text-blue-600 font-medium">Currently in progress</p>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Completed */}
                  <div className="relative flex items-start">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full z-10 relative ${
                      getStatusStep(complaint.status) >= 3 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {getStatusStep(complaint.status) >= 3 ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <ClockIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-6 flex-1">
                      <h5 className="text-lg font-semibold text-gray-900">Completed</h5>
                      <p className="text-gray-600 mb-2">Your complaint has been resolved</p>
                      {complaint.status === 'resolved' && (
                        <p className="text-sm text-green-600 font-medium">Successfully resolved</p>
                      )}
                      {complaint.resolved_at && (
                        <p className="text-sm text-gray-500">{formatDate(complaint.resolved_at)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Response */}
            {complaint.admin_response && (
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h5 className="text-lg font-semibold text-blue-900 mb-3">Admin Response</h5>
                <p className="text-blue-800 leading-relaxed">{complaint.admin_response}</p>
              </div>
            )}

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mt-8">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {complaint.attachments.map((attachment, index) => (
                    <div key={index} className="relative group">
                      {attachment.file_type.startsWith('image/') ? (
                        <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                          <img
                            src={attachment.file_url}
                            alt={attachment.original_filename}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                  <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 rounded-b-xl">
                        <p className="truncate font-medium">{attachment.original_filename}</p>
                        <p className="text-xs opacity-75">{attachment.file_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searched && !complaint && !loading && !error && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaint found</h3>
          <p className="text-gray-600">Please check your ticket ID and try again.</p>
        </div>
      )}
    </div>
  );
}

// Reports Component
function ReportsSection({ user }) {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0
  });

  const fetchComplaints = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString()
      });

      const endpoint = user?.role === 'admin' 
        ? 'http://localhost:6969/api/complaints/all'
        : 'http://localhost:6969/api/complaints/my-complaints';

      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setComplaints(data.data.complaints);
        setPagination(prev => ({
          ...prev,
          page: data.data.pagination.page,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages,
          has_next: data.data.pagination.has_next,
          has_prev: data.data.pagination.has_prev
        }));
      } else {
        setError(data.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:6969/api/complaints/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  const handlePageChange = (newPage) => {
    fetchComplaints(newPage);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Technical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Academic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Hostel/Mess': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Maintenance': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <ChartBarIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complaint Reports</h2>
            <p className="text-gray-600">View and manage all your complaints with detailed information</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_complaints}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.status_stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.status_stats.in_progress}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.status_stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Complaints List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Complaints</h3>
          <p className="text-sm text-gray-600">
            Showing {complaints.length} of {pagination.total} complaints
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading complaints...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or create a new complaint.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{complaint.title}</h4>
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {complaint.ticket_id}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{complaint.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(complaint.category)}`}>
                        {complaint.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {formatDate(complaint.created_at)}</span>
                      {complaint.resolved_at && (
                        <span>Resolved: {formatDate(complaint.resolved_at)}</span>
                      )}
                    </div>
                  </div>

                  
                </div>

                                 {/* Attachments */}
                 {complaint.attachments && complaint.attachments.length > 0 && (
                   <div className="mt-4">
                     <h5 className="text-sm font-medium text-gray-700 mb-3">Attachments:</h5>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                       {complaint.attachments.map((attachment, index) => (
                         <div key={index} className="relative group">
                           {attachment.file_type.startsWith('image/') ? (
                             <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                               <img
                                 src={attachment.file_url}
                                 alt={attachment.original_filename}
                                 className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                 onError={(e) => {
                                   e.target.style.display = 'none';
                                   e.target.parentElement.innerHTML = `
                                     <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                       <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                       </svg>
                                     </div>
                                   `;
                                 }}
                               />
                             </div>
                           ) : (
                             <div className="aspect-square bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                               <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                             </div>
                           )}
                           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 rounded-b-xl">
                             <p className="truncate font-medium">{attachment.original_filename}</p>
                             <p className="text-xs opacity-75">{attachment.file_type}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                {/* Admin Response */}
                {complaint.admin_response && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Admin Response:</h5>
                    <p className="text-sm text-blue-800">{complaint.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = (role) => {
    return role === 'student' ? AcademicCapIcon : UserGroupIcon;
  };

  const getRoleColor = (role) => {
    return role === 'student' ? 'text-blue-600' : 'text-purple-600';
  };

  const RoleIcon = getRoleIcon(user?.role);
  const roleColor = getRoleColor(user?.role);

  const navigation = [
    { name: 'Dashboard', icon: DocumentTextIcon, href: 'dashboard', current: activeSection === 'dashboard' },
    { name: 'New Complaint', icon: DocumentTextIcon, href: 'new-complaint', current: activeSection === 'new-complaint' },
    { name: 'Track Progress', icon: ClockIcon, href: 'track-progress', current: activeSection === 'track-progress' },
    { name: 'Resolved', icon: CheckCircleIcon, href: 'resolved', current: activeSection === 'resolved' },
    { name: 'Reports', icon: ChartBarIcon, href: 'reports', current: activeSection === 'reports' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center ${roleColor}`}>
                  <RoleIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
                  <p className="text-gray-600">Manage your complaints and track their progress</p>
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <RoleIcon className={`h-5 w-5 ${roleColor}`} />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveSection('new-complaint')}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">New Complaint</h3>
                <p className="text-sm text-gray-600">Submit a new complaint or issue</p>
              </div>

              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveSection('track-progress')}
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">Monitor your complaint status</p>
              </div>

              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveSection('resolved')}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolved</h3>
                <p className="text-sm text-gray-600">View resolved complaints</p>
              </div>

              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveSection('reports')}
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
                <p className="text-sm text-gray-600">Generate complaint reports</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Hostel WiFi Issue</span>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Cafeteria Service</span>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Library Access</span>
                  </div>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'new-complaint':
        return <NewComplaintForm user={user} />;
      
      case 'track-progress':
        return <TrackProgressSection user={user} />;
      
      case 'resolved':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resolved Complaints</h2>
            <p className="text-gray-600">Resolved complaints list will be implemented here.</p>
          </div>
        );
      
      case 'reports':
        return <ReportsSection user={user} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-4 lg:ml-0">
                  Query Pro
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.name}</span>
                </div>
                                 <button 
                   onClick={() => setAiAssistantOpen(true)}
                   className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors bg-white/50 rounded-lg"
                 >
                   <SparklesIcon className="h-5 w-5" />
                   <span>AI Assistant</span>
                 </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-sm transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out shadow-xl lg:shadow-none`}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="mt-8 px-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => setActiveSection(item.href)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                        item.current
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </button>
                  </li>
                ))}
                
                {/* Logout Button */}
                <li className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {renderContent()}
            </main>
          </div>
        </div>

                 {/* Mobile sidebar overlay */}
         {sidebarOpen && (
           <div
             className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
             onClick={() => setSidebarOpen(false)}
           />
         )}

         {/* AI Assistant Popup */}
         <AIAssistantPopup 
           isOpen={aiAssistantOpen}
           onClose={() => setAiAssistantOpen(false)}
           user={user}
         />
       </div>
     </div>
   );
 }

export default Dashboard; 