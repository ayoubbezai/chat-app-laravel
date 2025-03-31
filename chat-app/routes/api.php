<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Events\MessageSent;

use App\Http\Controllers\AuthController;

Route::post('/send-message', function (Request $request) {
    $validated = $request->validate([
        'message' => 'required|string',
    ]);

    // Create a structured message object
    $message = [
        "id" => uniqid(),
        "content" => $validated['message'],
        "sender" => "User",  
        "timestamp" => now()->toDateTimeString(),
    ];

    // Broadcast message to Reverb WebSocket
    broadcast(new MessageSent($message))->toOthers();  

    return response()->json([
        'status' => 'Message sent',
        'message' => $message, // 
    ]);
}


);


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
