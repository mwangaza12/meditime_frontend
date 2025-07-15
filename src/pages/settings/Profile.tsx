import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { Upload, KeyRound } from "lucide-react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import axios from "axios";
import { userApi } from "../../feature/api/userApi";
import type { RootState } from "../../app/store";

export const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: userData } = userApi.useGetUserByUserIdQuery({ userId: user.userId });
  const [updateAvatar] = userApi.useUpdateAvatarMutation();

  const cloud_name = "dbhok4lft";
  const preset_key = "meditime";

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const profilePicture =
    previewImage ||
    userData?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.firstName || "User")}&background=4ade80&color=fff&size=128`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset_key);

    const loadingToastId = toast.loading("Uploading image...");
    setUploading(true);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData
      );
      const profileUrl = response.data.secure_url;

      await updateAvatar({ id: user.userId, profileUrl });

      toast.success("Profile updated successfully!", { id: loadingToastId });
      setPreviewImage(null);
    } catch (err) {
      toast.error("Image upload failed", { id: loadingToastId });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <p className="text-gray-600">View and manage your profile details.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col items-center lg:items-start lg:w-1/3">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-blue-100 shadow-xl bg-gray-100">
              <img
                src={profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-blue-800 hover:bg-blue-900 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center lg:text-left mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {userData?.firstName} {userData?.lastName}
            </h2>
            <p className="text-gray-600 mb-3">{userData?.email}</p>
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {userData?.role}
            </span>
          </div>
        </div>

        <div className="lg:w-2/3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="First Name" value={userData?.firstName} />
            <ProfileField label="Last Name" value={userData?.lastName} />
            <ProfileField label="Email Address" value={userData?.email} />
            <ProfileField label="Address" value={userData?.address} />
            <ProfileField label="Contact Phone" value={userData?.contactPhone} />
          </div>

          <div className="flex flex-wrap gap-3 pt-6">
            <button
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors duration-200 shadow-sm"
              onClick={() => setIsPasswordOpen(true)}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Change Password
            </button>
          </div>
        </div>
      </div>

      <PasswordChangeModal
        open={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        onSubmit={async (currentPassword: string, newPassword: string) => {
          try {
            await axios.post("http://localhost:3000/users/change-password", {
              currentPassword,
              newPassword,
              userId: user.userId,
            });
            toast.success("Password updated successfully.");
            setIsPasswordOpen(false);
          } catch {
            toast.error("Failed to update password.");
          }
        }}
      />
    </div>
  );
};

const ProfileField = ({ label, value }: { label: string; value?: string }) => (
  <div className="group">
    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">{label}</p>
    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 group-hover:border-gray-300 transition-colors duration-200">
      <p className="text-sm font-medium text-gray-900">{value || "N/A"}</p>
    </div>
  </div>
);

const PasswordChangeModal = ({ open, onClose, onSubmit }: any) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
