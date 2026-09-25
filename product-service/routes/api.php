<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ✅ Rotas PÚBLICAS
Route::get('/products/public', [ProductController::class, 'listPublic']);

// ✅ Rota para criar pedido (público)
Route::post('/orders', [OrderController::class, 'store']);
 // Orders
Route::get('/orders', [OrderController::class, 'listVendorOrders']);
Route::post('/orders/{orderId}/confirm', [OrderController::class, 'confirm']);

// Notificações
Route::get('/notifications', [OrderController::class, 'getNotifications']);
Route::post('/notifications/{notificationId}/read', [OrderController::class, 'markNotificationRead']);

Route::middleware(['auth:api'])->prefix('products')->group(function(){
    Route::get('/', [ProductController::class, 'list']);
    Route::post('/create', [ProductController::class, 'create']);
    Route::put('/update/{id}', [ProductController::class, 'update']);
    Route::get('/{id}', [ProductController::class, 'show']);
    Route::delete('/{id}', [ProductController::class, 'delete']);

});

Route::get('/', function (Request $request) {
    return response()->json(['message' => 'Welcome to the Product Service API']);
});
