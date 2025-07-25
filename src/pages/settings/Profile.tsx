import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { Upload, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { userApi } from "../../feature/api/userApi";
import type { RootState } from "../../app/store";
import { PasswordChangeModal } from "./PasswordChangeModal";

export const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: userData } = userApi.useGetUserByUserIdQuery({ userId: user.userId });
  const [updateAvatar] = userApi.useUpdateAvatarMutation();
  const [changePassword] = userApi.useChangePasswordMutation();
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  
  
  const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset_key = import.meta.env.VITE_CLOUDINARY_PRESET_KEY;
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
    setUploadProgress(0);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percent);
          },
        }
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
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center rounded-2xl">
                  <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-white text-xs mt-2">{uploadProgress}%</span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
              className={`absolute -bottom-2 -right-2 p-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-800 hover:bg-blue-900 text-white"
              }`}
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
            await changePassword({ id: user.userId, currentPassword, newPassword }).unwrap();
            toast.success("Password updated successfully.");
            setIsPasswordOpen(false);
          } catch (err: any) {
            toast.error(err?.data?.error || "Failed to update password.");
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

