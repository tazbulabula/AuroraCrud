<?php

use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
