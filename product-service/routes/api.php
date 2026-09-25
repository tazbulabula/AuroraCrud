<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROTAS PÚBLICAS (Guest - sem autenticação)
|--------------------------------------------------------------------------
*/

// Produtos públicos
Route::get('/products/public', [ProductController::class, 'listPublic']);

// Criar pedido (guest)
Route::post('/orders', [OrderController::class, 'store']);

// ✅ Rastrear pedido (guest) - CORRIGIDO
Route::get('/orders/track/{trackingCode}', [OrderController::class, 'trackOrder']);

/*
|--------------------------------------------------------------------------
| ROTAS PROTEGIDAS (Requerem autenticação)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api'])->group(function () {

    // ===== PRODUTOS =====
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'list']);
        Route::post('/create', [ProductController::class, 'create']);
        Route::put('/update/{id}', [ProductController::class, 'update']);
        Route::get('/{id}', [ProductController::class, 'show']);
        Route::delete('/{id}', [ProductController::class, 'delete']);
    });

    // ===== PEDIDOS =====
    Route::get('/orders', [OrderController::class, 'listVendorOrders']);
    Route::post('/orders/{orderId}/confirm', [OrderController::class, 'confirm']);
    Route::post('/orders/{orderId}/deliver', [OrderController::class, 'deliver']);

    // ===== NOTIFICAÇÕES =====
    Route::get('/notifications', [OrderController::class, 'getNotifications']);
    Route::post('/notifications/{notificationId}/read', [OrderController::class, 'markNotificationRead']);
});

/*
|--------------------------------------------------------------------------
| ROTA DE BOAS-VINDAS
|--------------------------------------------------------------------------
*/
Route::get('/', function (Request $request) {
    return response()->json(['message' => 'Welcome to the Product Service API']);
});