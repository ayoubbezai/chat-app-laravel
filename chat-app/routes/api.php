<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Events\MessageSent;

Route::post('/send-message', function (Request $request) {
    $validated = $request->validate([
        'message' => 'required|string',
    ]);

    // Create a structured message object
    $message = [
        "id" => uniqid(),  // ✅ Unique ID for frontend
        "content" => $validated['message'],
        "sender" => "User",  // ✅ Add sender info (modify as needed)
        "timestamp" => now()->toDateTimeString(),
    ];

    // Broadcast message to Reverb WebSocket
    broadcast(new MessageSent($message))->toOthers();  // ✅ Prevents rebroadcasting to sender

    return response()->json([
        'status' => 'Message sent',
        'message' => $message, // ✅ Return message for frontend confirmation
    ]);
});
