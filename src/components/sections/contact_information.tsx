import React from 'react';

interface ContactInfoProps {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  address,
  phone,
  email,
  hours,
}) => {
  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Address</h3>
              <p className="text-gray-600">{address}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Phone</h3>
              <p className="text-gray-600">{phone}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Email</h3>
              <p className="text-gray-600">{email}</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Operating Hours
            </h2>
            <p className="text-gray-600">{hours}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;