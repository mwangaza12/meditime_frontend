import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { FaPaperPlane } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { complaintApi } from "../../feature/api/complaintApi";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "https://medical-patient-appointment-system.azurewebsites.net/";
let socket: Socket | null = null;

export default function ComplaintChat() {
  const { complaintId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [liveReplies, setLiveReplies] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  const { data, isLoading, isError } = complaintApi.useGetComplaintRepliesQuery(Number(complaintId), {
    skip: !complaintId,
  });

  const replies = data?.replies ?? [];
  const [addReply, { isLoading: isSending }] = complaintApi.useAddComplaintReplyMutation();

  useEffect(() => {
    if (!complaintId) return;

    socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      query: { complaintId },
      secure: true,
      withCredentials: false,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection failed:", err.message);
    });

    socket.on("new-reply", (reply) => {
      setLiveReplies((prev) => {
        const exists =
          prev.some((r) => r.replyId === reply.replyId) ||
          replies.some((r: any) => r.replyId === reply.replyId);
        return exists ? prev : [...prev, reply];
      });
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [complaintId, replies]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies, liveReplies]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !complaintId || !user?.userId) return;

    try {
      const replyPayload = {
        complaintId: Number(complaintId),
        message: newMessage.trim(),
      };

      const savedReply = await addReply(replyPayload).unwrap();
      setLiveReplies((prev) => [...prev, savedReply]);
      socket?.emit("send-reply", savedReply);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const isPatient = (senderId: number | null) => senderId === user?.userId;

  const allMessages = [...replies, ...liveReplies].filter(
    (msg, i, arr) =>
      i === arr.findIndex((r) => r.replyId === msg.replyId)
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading chat...</p>
        ) : isError ? (
          <p className="text-red-500">Failed to load messages.</p>
        ) : (
          allMessages.map((msg: any) => {
            const mine = isPatient(msg.senderId);
            return (
              <div
                key={msg.replyId}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl text-sm relative ${
                  mine
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-300"
                }`}
                title={format(new Date(msg.createdAt), "PPpp")}
              >
                  <div>{msg.message}</div>
                  <div className={`text-[11px] mt-1 text-right ${
                    mine ? "text-blue-200" : "text-gray-400"
                  }`}>
                    {format(new Date(msg.createdAt), "p")}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t p-3 flex items-center gap-3 shadow-md">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className={`p-3 rounded-full ${
            newMessage.trim()
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <FaPaperPlane className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
