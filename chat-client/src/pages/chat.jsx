import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
import axios from "axios";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  console.log("VITE_REVERB_APP_KEY:", import.meta.env.VITE_REVERB_APP_KEY);

  useEffect(() => {
    if (!import.meta.env.VITE_REVERB_APP_KEY) {
      console.error("❌ Missing VITE_REVERB_APP_KEY!");
      return;
    }

    const pusher = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: import.meta.env.VITE_REVERB_PORT,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      cluster: ""
    });

    const channel = pusher.subscribe("chat");

    // 🔍 Debug: Log all events
    channel.bind_global((event, data) => {
      console.log(`🔴 WebSocket Event Received: ${event}`, data);
    });

    // 🔥 Listen for messages
    channel.bind("message.sent", (data) => {
      console.log("✅ New Message from WebSocket:", data);
      if (data && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/send-message", {
        message,
      });
      console.log("✅ Sent message:", response.data); // ✅ Debug log
      setMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  return (
    <div>
      <h2>Chat App</h2>
      <div>
        {messages.map((msg, i) => (
          <p key={msg.id || i}>
            <strong>{msg.sender}:</strong> {msg.content}
          </p>
        ))}
      </div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App;
