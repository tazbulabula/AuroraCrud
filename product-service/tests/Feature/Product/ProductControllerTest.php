<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    
    
    $this->authUrl = env('AUTH_SERVICE_URL', 'http://auth-service:8000');
    $this->productUrl = env('PRODUCT_SERVICE_URL', 'http://product-service:8001');
    

    // Para testes locais (fora do Docker)
    /*if (env('APP_ENV') === 'testing') {
        $this->authUrl = 'http://localhost:8001';
        $this->productUrl = 'http://localhost:8002';
    }*/

    // 1. Registrar usuário
    $userData = [
        'name' => 'Taz',
        'email' => 'taz@gmail.com',
        'password' => '1234567890',
        'role' => 'ADMIN'
    ];

    $registerResponse = Http::post("{$this->authUrl}/api/register", $userData);
    
    if (!$registerResponse->successful()) {
        throw new \Exception('Falha ao registrar usuário: ' . $registerResponse->body());
    }
    
    $this->user = $registerResponse->json();

    // 2. Login para obter token
    $loginResponse = Http::post("{$this->authUrl}/api/login", [
        'email' => $userData['email'],
        'password' => $userData['password']
    ]);

    if (!$loginResponse->successful()) {
        throw new \Exception('Falha ao fazer login: ' . $loginResponse->body());
    }

    // 3. Extrair token CORRETAMENTE
    $this->token = $loginResponse->json('access_token');

    // 4. Dados do produto
    $this->dataProduct = [
        'name' => 'Produto Teste',
        'description' => 'Descrição do produto',
        'price' => 100.00,
        'stock' => 5,
    ];

    // Remover dd() - usar dump() se precisar debugar
    // dump($this->token);
});

test('pode criar produtos com autenticacao', function () {
    // Act - Envia o token no header
    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/product/create", $this->dataProduct);

    // Assert
    expect($response->status())->toBe(201); // Created
    expect($response->json('name'))->toBe('Produto Teste');
    expect($response->json('user_id'))->toBe($this->user['id']);
    
    // Verifica no banco (Product Service)
    $this->assertDatabaseHas('products', [
        'name' => 'Produto Teste',
        'user_id' => $this->user['id']
    ]);
});

test('nao cria produto sem token', function () {
    // Act - Sem token
    $response = Http::post("{$this->productUrl}/api/product/create", $this->dataProduct);

    // Assert
    expect($response->status())->toBe(401);
});

test('nao cria produto com token invalido', function () {
    // Act - Token inválido
    $response = Http::withHeaders([
        'Authorization' => 'Bearer token_invalido_123',
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/product/create", $this->dataProduct);

    // Assert
    expect($response->status())->toBe(401);
});

test('cria produto com dados minimos', function () {
    // Arrange
    $data = [
        'name' => 'Produto Minimo',
        'price' => 50.00,
        'stock' => 10
    ];

    // Act
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token
    ])->post("{$this->productUrl}/api/product/create", $data);

    // Assert
    expect($response->status())->toBe(201);
    expect($response->json('name'))->toBe('Produto Minimo');
    expect($response->json('price'))->toBe(50.00);
    expect($response->json('stock'))->toBe(10);
});

test('validacao falha quando nome esta faltando', function () {
    // Arrange
    $data = [
        'price' => 100.00,
        'stock' => 5
    ];

    // Act
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token
    ])->post("{$this->productUrl}/api/product/create", $data);

    // Assert
    expect($response->status())->toBe(422);
    expect($response->json())->toHaveKey('errors');
    expect($response->json('errors'))->toHaveKey('name');
});

test('validacao falha quando preco e negativo', function () {
    // Arrange
    $data = [
        'name' => 'Produto',
        'price' => -10.00,
        'stock' => 5
    ];

    // Act
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token
    ])->post("{$this->productUrl}/api/product/create", $data);

    // Assert
    expect($response->status())->toBe(422);
    expect($response->json('errors'))->toHaveKey('price');
});

test('validacao falha quando stock e negativo', function () {
    // Arrange
    $data = [
        'name' => 'Produto',
        'price' => 100.00,
        'stock' => -5
    ];

    // Act
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token
    ])->post("{$this->productUrl}/api/product/create", $data);

    // Assert
    expect($response->status())->toBe(422);
    expect($response->json('errors'))->toHaveKey('stock');
});