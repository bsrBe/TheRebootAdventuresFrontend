import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Calendar, MapPin, User, CreditCard } from 'lucide-react';

interface TicketData {
  ticket: {
    reference: string;
    invoiceId: string;
    transactionId: string;
    userId: string;
    eventName: string;
    amount: number;
    status: 'valid' | 'used' | 'expired';
    createdAt: string;
    expiresAt?: string;
  };
  invoice: {
    invoiceId: string;
    amount: number;
    currency: string;
    paidAt: string;
    receiptData: {
      senderName: string;
      confirmedAmount: number;
      date: string;
      receiver: string;
    };
    metadata: {
      eventName: string;
      place: string;
      time: string;
    };
  };
  user: {
    fullName: string;
    email: string;
    telegramUsername?: string;
  };
  event: {
    name: string;
    location: string;
    date: string;
    description?: string;
  };
}

type VerificationStatus = 'loading' | 'valid' | 'invalid' | 'expired' | 'error';

export default function TicketVerification() {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [error, setError] = useState<string>('');

  // Side effect: Verify ticket when component mounts or reference changes
  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setError('No ticket reference provided');
      return;
    }

    verifyTicket();
  }, [reference]);

  const verifyTicket = async () => {
    try {
      setStatus('loading');
      setError('');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/ticket/${reference}`);
      const data = await response.json();
      
      if (data.success) {
        setTicketData(data.data);
        setStatus(data.data.ticket.status === 'valid' ? 'valid' : 
                data.data.ticket.status === 'expired' ? 'expired' : 'invalid');
      } else {
        setStatus('invalid');
        setError(data.message || 'Invalid ticket');
      }
    } catch (err) {
      setStatus('error');
      setError('Failed to verify ticket. Please try again.');
      console.error('Ticket verification error:', err);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'expired':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case 'invalid':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-gray-500" />;
      default:
        return <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-50 border-green-200';
      case 'expired': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'invalid': return 'text-red-600 bg-red-50 border-red-200';
      case 'error': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'valid': return 'Valid Ticket';
      case 'expired': return 'Ticket Expired';
      case 'invalid': return 'Invalid Ticket';
      case 'error': return 'Verification Error';
      default: return 'Verifying...';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          {getStatusIcon()}
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Verifying Ticket...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your ticket.</p>
        </div>
      </div>
    );
  }

  if (status === 'error' || status === 'invalid' || status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          {getStatusIcon()}
          <h2 className={`text-2xl font-bold mt-4 ${getStatusColor().split(' ')[0]}`}>
            {getStatusText()}
          </h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`border-2 ${getStatusColor().split(' ')[2]} p-6 text-center`}>
            {getStatusIcon()}
            <h1 className={`text-3xl font-bold mt-4 ${getStatusColor().split(' ')[0]}`}>
              {getStatusText()}
            </h1>
            <p className="text-gray-600 mt-2">Reference: {reference}</p>
          </div>

          {/* Ticket Details */}
          {ticketData && (
            <div className="p-6 space-y-6">
              {/* Event Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Event Details
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Event Name</p>
                    <p className="font-semibold">{ticketData.event.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {ticketData.event.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold">
                      {new Date(ticketData.event.date).toLocaleDateString()} at{' '}
                      {new Date(ticketData.invoice.metadata.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ticket Price</p>
                    <p className="font-semibold flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {ticketData.invoice.amount} {ticketData.invoice.currency}
                    </p>
                  </div>
                </div>
                {ticketData.event.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-800">{ticketData.event.description}</p>
                  </div>
                )}
              </div>

              {/* Attendee Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Attendee Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold">{ticketData.user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{ticketData.user.email}</p>
                  </div>
                  {ticketData.user.telegramUsername && (
                    <div>
                      <p className="text-sm text-gray-600">Telegram</p>
                      <p className="font-semibold">@{ticketData.user.telegramUsername}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Invoice ID</p>
                    <p className="font-semibold">{ticketData.invoice.invoiceId}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-semibold">
                      {new Date(ticketData.invoice.paidAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-semibold">{ticketData.invoice.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payer Name</p>
                    <p className="font-semibold">{ticketData.invoice.receiptData.senderName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-semibold">
                      {ticketData.invoice.receiptData.confirmedAmount} {ticketData.invoice.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t">
                <p className="text-sm text-gray-500">
                  This ticket was verified on {new Date().toLocaleString()}
                </p>
                <button
                  onClick={() => window.print()}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Print Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
