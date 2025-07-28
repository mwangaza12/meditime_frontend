import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { KeyRound, User, Mail, MapPin, Phone, Edit3, Camera, Bell, Shield, Globe, Moon, Sun, Download, Trash2, LogOut, Settings } from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  
  const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset_key = import.meta.env.VITE_CLOUDINARY_PRESET_KEY;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profilePicture =
    previewImage ||
    userData?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.firstName || "User")}&background=1e40af&color=fff&size=200`;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
              <p className="text-slate-600 mt-1">Manage your account information and preferences</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2 bg-blue-800/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-800/5 border border-white/50 overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-blue-800 via-blue-700 to-blue-900 p-8 pb-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/90 to-blue-900/90"></div>
            <div className="absolute top-4 right-4 z-10">
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Profile Image */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full ring-8 ring-white/30 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center">
                      <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-white h-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm font-medium">{uploadProgress}%</span>
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
                  className={`absolute bottom-2 right-2 p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-800 hover:bg-blue-50 group-hover:shadow-xl"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-6 text-center text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <p className="text-blue-100 text-lg mb-3">{userData?.email}</p>
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-white">{userData?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 -mt-8 relative z-20">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-slate-900">Personal Information</h3>
                <button className="text-blue-800 hover:text-blue-900 font-medium text-sm flex items-center space-x-2 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProfileField 
                  icon={<User className="w-5 h-5 text-blue-800" />}
                  label="First Name" 
                  value={userData?.firstName} 
                />
                <ProfileField 
                  icon={<User className="w-5 h-5 text-blue-800" />}
                  label="Last Name" 
                  value={userData?.lastName} 
                />
                <ProfileField 
                  icon={<Mail className="w-5 h-5 text-blue-800" />}
                  label="Email Address" 
                  value={userData?.email} 
                />
                <ProfileField 
                  icon={<Phone className="w-5 h-5 text-blue-800" />}
                  label="Contact Phone" 
                  value={userData?.contactPhone} 
                />
              </div>

              <div className="mt-8">
                <ProfileField 
                  icon={<MapPin className="w-5 h-5 text-blue-800" />}
                  label="Address" 
                  value={userData?.address} 
                  fullWidth
                />
              </div>
            </div>

            {/* Actions Section */}
            <div className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl p-6 border border-slate-200/50">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Account Actions</h4>
              <div className="flex flex-wrap gap-4">
                <button
                  className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-xl font-medium hover:bg-blue-900 transition-all duration-200 shadow-lg shadow-blue-800/25 hover:shadow-xl hover:shadow-blue-800/30 transform hover:-translate-y-0.5"
                  onClick={() => setIsPasswordOpen(true)}
                >
                  <KeyRound className="w-5 h-5 mr-3" />
                  Change Password
                </button>
                
                <button className="inline-flex items-center px-6 py-3 bg-white text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors duration-200 shadow-sm border border-slate-200 hover:border-slate-300">
                  <Edit3 className="w-5 h-5 mr-3" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-blue-800 mr-3" />
                <h3 className="text-xl font-semibold text-slate-900">Security & Privacy</h3>
              </div>
              
              <div className="space-y-6">
                <SettingToggle
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                  enabled={twoFactorEnabled}
                  onChange={setTwoFactorEnabled}
                />
                
                <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Login Sessions</h4>
                    <p className="text-sm text-slate-600 mt-1">Manage your active sessions across devices</p>
                  </div>
                  <button className="text-blue-800 hover:text-blue-900 font-medium text-sm px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors">
                    View Sessions
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Privacy Settings</h4>
                    <p className="text-sm text-slate-600 mt-1">Control who can see your information</p>
                  </div>
                  <button className="text-blue-800 hover:text-blue-900 font-medium text-sm px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
              <div className="flex items-center mb-6">
                <Bell className="w-6 h-6 text-blue-800 mr-3" />
                <h3 className="text-xl font-semibold text-slate-900">Notifications</h3>
              </div>
              
              <div className="space-y-6">
                <SettingToggle
                  label="Email Notifications"
                  description="Receive updates and alerts via email"
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                />
                
                <SettingToggle
                  label="Push Notifications"
                  description="Get notified on your devices"
                  enabled={pushNotifications}
                  onChange={setPushNotifications}
                />
                
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Notification Preferences</h4>
                    <p className="text-sm text-slate-600 mt-1">Customize what notifications you receive</p>
                  </div>
                  <button className="text-blue-800 hover:text-blue-900 font-medium text-sm px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors">
                    Customize
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
              <div className="flex items-center mb-6">
                <Settings className="w-6 h-6 text-blue-800 mr-3" />
                <h3 className="text-xl font-semibold text-slate-900">Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Language
                  </label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Timezone
                  </label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Africa/Nairobi">Nairobi</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <SettingToggle
                  label="Dark Mode"
                  description="Switch to a darker theme"
                  enabled={darkMode}
                  onChange={setDarkMode}
                  icon={darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Data & Storage */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
              <div className="flex items-center mb-6">
                <Download className="w-6 h-6 text-blue-800 mr-3" />
                <h3 className="text-xl font-semibold text-slate-900">Data & Storage</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Download Your Data</h4>
                    <p className="text-sm text-slate-600 mt-1">Get a copy of all your account data</p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors text-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Storage Usage</h4>
                    <p className="text-sm text-slate-600 mt-1">Monitor your account storage usage</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">2.4 GB used</p>
                    <p className="text-sm text-slate-600">of 10 GB</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-600">Clear Cache</h4>
                    <p className="text-sm text-slate-600 mt-1">Remove temporary files and cached data</p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 bg-red-50 rounded-2xl border-2 border-red-200 p-8">
              <h3 className="text-xl font-semibold text-red-800 mb-6">Danger Zone</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">Log Out All Devices</h4>
                    <p className="text-sm text-red-600 mt-1">Sign out from all devices and sessions</p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out All
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">Delete Account</h4>
                    <p className="text-sm text-red-600 mt-1">Permanently delete your account and all data</p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
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

const ProfileField = ({ 
  icon, 
  label, 
  value, 
  fullWidth = false 
}: { 
  icon: React.ReactNode;
  label: string; 
  value?: string; 
  fullWidth?: boolean;
}) => (
  <div className={`group ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <div className="flex items-center mb-3">
      {icon}
      <p className="text-sm font-semibold text-slate-700 ml-2 uppercase tracking-wide">{label}</p>
    </div>
    <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl px-4 py-4 border border-slate-200/50 group-hover:border-blue-200 transition-all duration-200 group-hover:shadow-sm">
      <p className="text-slate-900 font-medium">{value || "Not specified"}</p>
    </div>
  </div>
);

const SettingToggle = ({
  label,
  description,
  enabled,
  onChange,
  icon
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
    <div className="flex items-start flex-1">
      {icon && <div className="mr-3 mt-1">{icon}</div>}
      <div>
        <h4 className="font-medium text-slate-900">{label}</h4>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 ${
        enabled ? 'bg-blue-800' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);