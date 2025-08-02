import { XCircle } from "lucide-react";

export const PaymentCancelled = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center space-y-4">
                <XCircle className="text-red-500 w-16 h-16 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-800">Payment Cancelled</h1>
                <p className="text-gray-600">
                    Your payment was not completed. If this was a mistake, you can try again.
                </p>
                <a
                    href="/user-dashboard/appointments"
                    className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl transition duration-200"
                >
                    Try Again
                </a>
            </div>
        </div>
    );
};
