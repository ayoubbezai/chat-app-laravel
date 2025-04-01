import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Pusher from "pusher-js";
import axios from "axios";

const Chat = () => {
    const { receiverId } = useParams(); // Get receiverId from the URL
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

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
                    console.log(messagesRes.data.messages)
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

        // const channel = pusher.subscribe(`chat.${receiverId}`);
        const channel = pusher.subscribe('private-chat.1'); // Hardcode for testing
        channel.bind('pusher:subscription_succeeded', () => {
            console.log("✅ Subscribed to channel!");
        });
        channel.bind('message.sent', (data) => {
            console.log("📩 Received message:", data);
        });


        channel.bind("message.sent", (data) => {
            console.log("✅ New Message Received:", data);
            if (data.sender_id === Number(receiverId) || data.receiver_id === Number(receiverId)) {
                setMessages((prev) => [...prev, data]);
            }
        });

        return () => {
            channel.unbind_all();
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
            console.log("✅ Sent message:", response.data);
            setMessage("");
        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    };

    return (
        <div className="chat-container">
            <h2>Chat with User {receiverId}</h2>

            <div className="messages">
                {messages.length > 0 ? (
                    messages.map((msg, i) => (
                        <p key={msg.id || i} className={msg.sender_id === user?.id ? "sent" : "received"}>
                            <strong>{msg.sender?.name || "Unknown"}:</strong> {msg.message}
                        </p>
                    ))
                ) : (
                    <p>No messages yet.</p>
                )}
            </div>

            <div className="message-input">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
