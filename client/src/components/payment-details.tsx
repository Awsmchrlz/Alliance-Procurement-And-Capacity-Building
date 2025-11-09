import React from 'react';
import { useState } from 'react';
import { Banknote, Building2, CreditCard, Landmark, Smartphone, Wallet, Copy } from 'lucide-react';

interface DetailRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: (text: string) => void;
}

const DetailRow = ({ label, value, copyable = false, onCopy }: DetailRowProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
    <span className="text-sm font-medium text-gray-500 w-24 flex-shrink-0">
      {label}:
    </span>
    <div className="flex-1 flex items-center">
      <span className="font-medium text-gray-800">{value}</span>
      {copyable && onCopy && (
        <button 
          onClick={() => onCopy(value)}
          className="ml-2 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          title="Copy to clipboard"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

const PaymentDetails = () => {
  const bankAccounts = {
    'SME Account (ZMK)': {
      accountNumber: '63136716785',
      currency: 'ZMW',
      type: 'SME Account',
      bank: 'FNB',
      branch: 'Makeni Junction',
      swiftCode: 'FIRNZMLX',
      sortCode: '260016'
    },
    'Call Account (USD)': {
      accountNumber: '63136717006',
      currency: 'USD',
      type: 'Call (Global) Account',
      bank: 'FNB',
      branch: 'Makeni Junction',
      swiftCode: 'FIRNZMLX',
      sortCode: '260016'
    }
  };

  const [activeTab, setActiveTab] = useState<'SME Account (ZMK)' | 'Call Account (USD)'>('SME Account (ZMK)');
  const currentAccount = bankAccounts[activeTab];
  const bankDetails = bankAccounts[activeTab];

  const mobileMoney = {
    title: 'Airtel Money',
    icon: <Smartphone className="w-6 h-6 text-[#1C356B]" />,
    details: [
      { label: 'Number', value: '077 3484004', copyable: true },
      { label: 'Name', value: 'Alliance Procurement and Capacity Building Foundation' },
      { label: 'Network', value: 'Airtel Zambia - Chipo Buumba' },
    ],
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here if needed
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1C356B] mb-2">Bank Transfer Details</h2>
        <p className="text-gray-600">Please use the following bank details for your payment</p>
      </div>

      <div className="grid gap-6">
        {/* Bank Account Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Landmark className="w-6 h-6 text-[#1C356B]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1C356B]">Bank Transfer</h3>
            </div>

            {/* Account Type Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              {Object.entries(bankAccounts).map(([key, account]) => (
                <button
                  key={key}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab(key as any)}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Account Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <DetailRow 
                  label="Bank" 
                  value={bankDetails.bank} 
                  copyable
                  onCopy={handleCopy}
                />
                <DetailRow 
                  label="Branch" 
                  value={bankDetails.branch} 
                  copyable
                  onCopy={handleCopy}
                />
                <DetailRow 
                  label="Account #" 
                  value={currentAccount.accountNumber} 
                  copyable
                  onCopy={handleCopy}
                />
              </div>
              <div className="space-y-3">
                <DetailRow 
                  label="Account Name" 
                  value="Alliance Procurement and Capacity Building Foundation" 
                  copyable
                  onCopy={handleCopy}
                />
                <DetailRow 
                  label="Account Type" 
                  value={currentAccount.type} 
                  onCopy={handleCopy}
                />
                <DetailRow 
                  label="Currency" 
                  value={currentAccount.currency} 
                  onCopy={handleCopy}
                />
                <div className="flex items-center gap-4">
                  <DetailRow 
                    label="Swift Code" 
                    value={bankDetails.swiftCode} 
                    copyable 
                    onCopy={handleCopy}
                  />
                  <DetailRow 
                    label="Sort Code" 
                    value={bankDetails.sortCode} 
                    onCopy={handleCopy}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Money Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              {mobileMoney.icon}
            </div>
            <h3 className="text-xl font-semibold text-[#1C356B]">{mobileMoney.title}</h3>
          </div>
          
          <div className="space-y-3">
            {mobileMoney.details.map((detail, i) => (
              <DetailRow 
                key={i} 
                label={detail.label} 
                value={detail.value} 
                copyable={detail.copyable}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </div>
      </div>
      


      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-[#1C356B] mb-2 flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Payment Instructions
        </h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          <li>Use your name as the payment reference</li>
          <li>Email your proof of payment to accounts@allianceprocurement.org</li>
          <li>Payments are processed within 24-48 hours</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentDetails;
