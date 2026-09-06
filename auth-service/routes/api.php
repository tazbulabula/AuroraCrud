<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['guest:api'])->group(function(){
    Route::get('/', function(){
        return response()->json(['message'=> 'Bem-vindo ao AuroraCrud']);
    });
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('register', [ClientesController::class, 'register']);

});

Route::middleware(['auth:api'])->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    Route::post('register', [ClientesController::class, 'register']);

    Route::prefix('clientes')->group(function () {
        Route::post('register', [ClientesController::class, 'register']);
        Route::get('/', [ClientesController::class, 'listClients']);
        Route::get('count', [ClientesController::class, 'countClients']);
        Route::put('{user}', [ClientesController::class, 'update']);
        Route::delete('{user}', [ClientesController::class, 'delete']);
    });
    
});
