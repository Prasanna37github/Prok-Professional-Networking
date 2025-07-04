import React from 'react';

const ProfileContact = ({ contact }: { contact: any }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Contact Information</h3>
    <div>Email: {contact.email}</div>
    <div>Phone: {contact.phone}</div>
    <div>Location: {contact.location}</div>
  </div>
);

export default ProfileContact;
