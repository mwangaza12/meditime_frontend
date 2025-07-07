import React from "react";

type FormInputProps = {
    label: string;
    type: string;
    placeholder: string;
    icon: React.ReactNode;
    name: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    register?: any;
    error?: string;
};

export const TextInput = ({label,type,placeholder,icon,name,value,onChange,register,error,}: FormInputProps) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <span className="text-blue-800 mr-2">{icon}</span>
            <input
                type={type}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
                {...register}
                className="flex-1 outline-none bg-transparent"
            />
        </div>
        {error && <p className="text-sm mt-1 text-red-600">{error}</p>}
    </div>
);