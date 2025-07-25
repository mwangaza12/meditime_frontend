import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";

export const PasswordChangeModal = ({ open, onClose, onSubmit }: any) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">
          <Dialog.Title className="text-xl font-bold mb-6 text-gray-900">Change Password</Dialog.Title>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(currentPassword, newPassword);
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-800 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors duration-200 font-medium shadow-lg"
              >
                Update Password
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};