import { paymentApi } from "../../feature/api/paymentApi";

interface Props {
  amount: number;
  appointmentId: string;
}

export const StripeCheckoutButton = ({ amount, appointmentId }: Props) => {
  const [createPaymentSession, { isLoading }] = paymentApi.useCreatePaymentSessionMutation();

  const handleClick = async () => {
    try {
      const response = await createPaymentSession({ amount, appointmentId }).unwrap();
      if (response.url) {
        window.location.href = response.url;
      } else {
        alert("Failed to start payment.");
      }
    } catch (error) {
      console.error("Payment session error:", error);
      alert("Error initiating payment.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Pay"}
    </button>
  );
};
