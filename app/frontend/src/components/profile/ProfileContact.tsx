

interface Contact {
  email: string;
  phone: string;
  location: string;
}

const ProfileContact = ({ contact }: { contact: Contact }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Contact Information</h3>
    <div className="space-y-2">
      <div className="flex items-center">
        <span className="font-medium w-20">Email:</span>
        <span className="text-gray-700">{contact.email || 'Not provided'}</span>
      </div>
      <div className="flex items-center">
        <span className="font-medium w-20">Phone:</span>
        <span className="text-gray-700">{contact.phone || 'Not provided'}</span>
      </div>
      <div className="flex items-center">
        <span className="font-medium w-20">Location:</span>
        <span className="text-gray-700">{contact.location || 'Not provided'}</span>
      </div>
    </div>
  </div>
);

export default ProfileContact;
