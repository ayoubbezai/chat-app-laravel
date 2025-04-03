import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Pusher from "pusher-js";
import axios from "axios";

const Chat = () => {
    const { receiverId } = useParams();
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);

    useEffect(() => {
        const fetchUserAndMessages = async () => {
            try {
                const userRes = await axios.get("http://127.0.0.1:8000/api/user", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUser(userRes.data);

                if (receiverId) {
                    const messagesRes = await axios.get(`http://127.0.0.1:8000/api/messages/${receiverId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    setMessages(messagesRes.data?.messages);
                }
            } catch (error) {
                console.error("❌ Error fetching data:", error);
            }
        };

        fetchUserAndMessages();
    }, [receiverId]);

    useEffect(() => {
        if (!user || !receiverId) return;

        const pusher = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT,
            forceTLS: false,
            disableStats: true,
            enabledTransports: ["ws", "wss"],
            cluster: "",
            authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
            auth: {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            }
        });

        const channel = pusher.subscribe(`private-chat.${user.id}`);
        channel.bind('pusher:subscription_succeeded', () => {
            console.log("✅ Subscribed to chat channel!");
        });

        const typingChannel = pusher.subscribe(`private-typing.${user.id}`);
        typingChannel.bind('pusher:subscription_succeeded', () => {
            console.log("✅ Subscribed to typing channel!");
        });

        channel.bind("message.sent", (data) => {
            if (data.sender_id === Number(receiverId) || data.receiver_id === Number(receiverId)) {
                setMessages((prev) => [...prev, data]);
            }
        });

        typingChannel.bind('user.typing', (data) => {
            console.log("📩 Received typing message:", data);

            if (data.user_id !== user.id) {
                setTypingUser(data.user_id);
                setIsTyping(data.isTyping);

                if (data.isTyping) {
                    clearTimeout(window.typingTimeout);
                    window.typingTimeout = setTimeout(() => {
                        setIsTyping(false);
                    }, 1000);
                }
            }
        });
        return () => {
            channel.unbind_all();
            typingChannel.unbind_all();
            typingChannel.unsubscribe();
            channel.unsubscribe();
        };
    }, [user, receiverId]);

    const sendMessage = async () => {
        if (!receiverId || !message.trim()) {
            alert("Please select a user and type a message.");
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/send-message",
                { message, receiver_id: receiverId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setMessage("");
        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    };

    const handleTyping = async (e) => {
        setMessage(e.target.value);

        // Only send typing event if we're not already typing
        if (!isTyping) {
            try {
                await axios.post("http://127.0.0.1:8000/api/broadcast-typing", {
                    user_id: user?.id,
                    receiver_id: receiverId,
                    is_typing: true,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
            } catch (error) {
                console.error("❌ Error broadcasting typing status:", error);
            }
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50">
            <div className="p-4 bg-white border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Chat with User {receiverId}</h2>
            </div>

            {/* Typing Indicator */}
            {isTyping && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-blue-600">User is typing...</span>
                    </div>
                </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto">
                {messages.length > 0 ? (
                    messages.map((msg, i) => (
                        <div
                            key={msg.id || i}
                            className={`mb-3 max-w-xs p-3 rounded-lg ${msg.sender_id === user?.id ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-gray-200 text-gray-800"}`}
                        >
                            <div className="font-medium">{msg.sender?.name || "Unknown"}</div>
                            <div>{msg.message}</div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No messages yet. Start the conversation!
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        value={message}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;