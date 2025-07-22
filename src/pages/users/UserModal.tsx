import { Modal } from "../../components/modal/Modal";
import type { User } from "./UserList";

interface UserModalProps {
    show: boolean;
    onClose: () => void;
    user: User | null;
}

export const UserModal = ({ show, onClose, user }: UserModalProps) => {
    if (!user) return null;

    return (
        <Modal title="User Details" show={show} onClose={onClose}>
        <div className="space-y-3 text-slate-700">
            <div className="flex items-center space-x-4">
            {user.profileImageUrl ? (
                <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
                />
            ) : (
                <div className="w-16 h-16 rounded-full bg-gray-600 text-white flex items-center justify-center text-xl font-bold">
                {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`}
                </div>
            )}
            <div>
                <p className="font-semibold text-lg">{user.firstName} {user.lastName}</p>
                <p className="text-sm">{user.email}</p>
            </div>
            </div>
            <p><strong>Phone:</strong> {user.contactPhone || "N/A"}</p>
            <p><strong>Address:</strong> {user.address || "N/A"}</p>
            <p><strong>Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
            <p><strong>Role:</strong> {user.role}</p>
        </div>
        </Modal>
    );
};
