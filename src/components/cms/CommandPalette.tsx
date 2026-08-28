import React from 'react';

const CommandPalette = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-[#FCFAF7] border border-[#E0D7C9] p-4 rounded-2xl shadow-xl w-full max-w-md">
        <input type="text" placeholder="Search..." className="w-full p-2.5 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
        <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-black">Close</button>
      </div>
    </div>
  );
};

export default CommandPalette;
