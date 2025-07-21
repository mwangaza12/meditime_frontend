import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { FaPaperPlane } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { complaintApi } from "../../feature/api/complaintApi";

export default function ComplaintChat() {
  const { complaintId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useSelector((state: RootState) => state.auth);

  const {
  data,
  isLoading,
  isError,
} = complaintApi.useGetComplaintRepliesQuery(Number(complaintId), {
  skip: !complaintId,
});

const replies = data?.replies ?? [];


  const [addReply, { isLoading: isSending }] = complaintApi.useAddComplaintReplyMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

    const handleSend = async () => {
        if (!newMessage.trim() || !complaintId || !user?.userId) return;

        try {
            await addReply({
                complaintId: Number(complaintId),
                message: newMessage,
            }).unwrap();

            setNewMessage("");
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };


  const getSenderLabel = (senderId: number | null) => {
    if (!senderId || senderId === user?.userId) return "patient";
    return "staff"; // basic logic; adapt if needed
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <p className="text-gray-500">Loading chat...</p>
        ) : isError ? (
          <p className="text-red-500">Failed to load messages.</p>
        ) : (
          replies.map((msg: any) => {
            const isPatient = getSenderLabel(msg.senderId) === "patient";
            return (
              <div key={msg.replyId} className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
                <div className="flex items-end gap-3 max-w-[80%] md:max-w-[60%]">
                  {!isPatient && (
                    <div
                      className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold"
                      aria-label="Staff avatar"
                    >
                      ST
                    </div>
                  )}
                  <div
                    className={`relative group rounded-2xl px-4 py-3 shadow-md break-words transition-all duration-200 ${
                      isPatient
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <div className="text-sm">{msg.message}</div>
                    <div
                      className={`text-xs mt-2 ${
                        isPatient ? "text-blue-200" : "text-gray-400"
                      } text-right`}
                      title={format(msg.createdAt, "PPpp")}
                    >
                      {format(new Date(msg.createdAt), "p")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 shadow-md flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          aria-label="Type your message"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
            newMessage.trim()
              ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          aria-label="Send message"
        >
          <FaPaperPlane className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
