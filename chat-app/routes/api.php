<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Broadcast;


//     if (Auth::check()) {
//         return Broadcast::auth($request);
//     }
//     return response()->json(['message' => 'Unauthorized'], 403);
// });


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/users', [AuthController::class, 'getAllUsers'])->middleware('auth:sanctum');

use App\Http\Controllers\ChatController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/send-message', [ChatController::class, 'sendMessage']);
    Route::get('/messages/{userId}', [ChatController::class, 'getMessages']);
});


