<?php

namespace Tests\Feature\Product;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // URLs dos serviços
    $this->authUrl = env('AUTH_SERVICE_URL', 'http://auth-service:8000');
    $this->productUrl = env('PRODUCT_SERVICE_URL', 'http://product-service:8000');
    
    dump("🌐 Auth URL: {$this->authUrl}");
    dump("🌐 Product URL: {$this->productUrl}");

    // Dados do usuário
    $userData = [
        'email' => 'taz@gmail.com',
        'password' => '1234567890'
    ];

    // 1. Fazer login no Auth Service
    $loginResponse = Http::post("{$this->authUrl}/api/login", $userData);

    if (!$loginResponse->successful()) {
        dump("🔄 Tentando registrar usuário...");
        
        $registerResponse = Http::post("{$this->authUrl}/api/register", [
            'name' => 'Taz',
            'email' => 'taz@gmail.com',
            'password' => '1234567890',
            'role' => 'ADMIN'
        ]);
        
        if (!$registerResponse->successful()) {
            throw new \Exception('Falha ao registrar: ' . $registerResponse->body());
        }
        
        $loginResponse = Http::post("{$this->authUrl}/api/login", $userData);
    }

    if (!$loginResponse->successful()) {
        throw new \Exception('Falha ao fazer login: ' . $loginResponse->body());
    }

    $loginData = $loginResponse->json();
    $this->token = $loginData['access_token'];
    
    $meResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token
    ])->get("{$this->authUrl}/api/me");

    $this->user = $meResponse->successful() 
        ? $meResponse->json() 
        : [
            'id' => 1,
            'name' => 'Taz',
            'email' => 'taz@gmail.com',
            'role' => 'ADMIN'
        ];

    $this->dataProduct = [
        'name' => 'Produto Teste ' . time(),
        'description' => 'Descrição do produto',
        'price' => 100.00,
        'stock' => 5,
    ];
});

// ✅ TESTE: Criar produto (POST /products/create)
test('pode criar produtos com autenticacao', function () {
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/products/create", $this->dataProduct);

    expect($response->status())->toBe(201);
    expect($response->json('name'))->toBe($this->dataProduct['name']);
    expect($response->json('user_id'))->toBe($this->user['id']);
    
    // ✅ Verificar no banco com RefreshDatabase
    $this->assertDatabaseHas('products', [
        'name' => $this->dataProduct['name'],
        'user_id' => $this->user['id']
    ]);
});

// ✅ TESTE: Não criar sem token (POST /products/create)
test('nao cria produto sem token', function () {
    $response = Http::post("{$this->productUrl}/api/products/create", $this->dataProduct);
    
    dump("Status sem token: " . $response->status());
    dump("Body sem token: " . $response->body());
    
    expect($response->status())->toBe(401);
});

// ✅ TESTE: Não criar com token inválido (POST /products/create)
test('nao cria produto com token invalido', function () {
    $response = Http::withHeaders([
        'Authorization' => 'Bearer token_invalido_123',
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/products/create", $this->dataProduct);
    expect($response->status())->toBe(401);
});

// ✅ TESTE: Criar com dados mínimos (POST /products/create)
test('cria produto com dados minimos', function () {
    $data = [
        'name' => 'Produto Minimo ' . time(),
        'price' => 50,
        'stock' => 10
    ];

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/products/create", $data);

    expect($response->status())->toBe(201);
    expect($response->json('name'))->toBe($data['name']);
    expect($response->json('price'))->toBe(50);  // ✅ Comparar com inteiro
    expect($response->json('stock'))->toBe(10);
});

// ✅ TESTE: Validação falha sem nome (POST /products/create)
test('validacao falha quando nome esta faltando', function () {
    $data = [
        'price' => 100.00,
        'stock' => 5
    ];

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/products/create", $data);

    expect($response->status())->toBe(422);
    expect($response->json())->toHaveKey('errors');
    expect($response->json('errors'))->toHaveKey('name');
});

// ✅ TESTE: Validação falha com preço negativo (POST /products/create)
test('validacao falha quando preco e negativo', function () {
    $data = [
        'name' => 'Produto',
        'price' => -10.00,
        'stock' => 5
    ];

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/products/create", $data);

    expect($response->status())->toBe(422);
    expect($response->json('errors'))->toHaveKey('price');
});

// ✅ TESTE: Validação falha com stock negativo (POST /products/create)
test('validacao falha quando stock e negativo', function () {
    $data = [
        'name' => 'Produto',
        'price' => 100.00,
        'stock' => -5
    ];

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/products/create", $data);

    expect($response->status())->toBe(422);
    expect($response->json('errors'))->toHaveKey('stock');
});

// ✅ TESTE: Listar produtos (GET /products)
test('pode listar produtos do usuario', function () {
    // Criar alguns produtos
    for ($i = 0; $i < 3; $i++) {
        Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json'
        ])->post("{$this->productUrl}/api/products/create", [
            'name' => 'Produto Lista ' . $i . time(),
            'price' => 10 + $i,
            'stock' => 5 + $i
        ]);
    }

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->get("{$this->productUrl}/api/products");

    expect($response->status())->toBe(200);
    expect($response->json())->toBeArray();
    expect(count($response->json()))->toBeGreaterThanOrEqual(3);
});

// ✅ TESTE: Atualizar produto (PUT /products/update/{id})
test('pode atualizar produto', function () {
    // Criar produto
    $createResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/products/create", $this->dataProduct);

    $product = $createResponse->json();
    $productId = $product['id'];

    $updateData = [
        'name' => 'Produto Atualizado ' . time(),
        'price' => 200,
        'stock' => 15
    ];

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->put("{$this->productUrl}/api/products/update/{$productId}", $updateData);

    expect($response->status())->toBe(200);
    expect($response->json('name'))->toBe($updateData['name']);
    expect($response->json('price'))->toBe(200);  // ✅ Comparar com inteiro
    expect($response->json('stock'))->toBe(15);
});

// ✅ TESTE: Deletar produto (DELETE /products/{id})
test('pode deletar produto', function () {
    // Criar produto
    $createResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->post("{$this->productUrl}/api/products/create", $this->dataProduct);

    $product = $createResponse->json();
    $productId = $product['id'];

    // Deletar
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->delete("{$this->productUrl}/api/products/{$productId}");

    dump("Delete Status: " . $response->status());
    dump("Delete Body: " . $response->body());

    expect($response->status())->toBe(204);
    
    // Verificar se foi deletado
    $getResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
        'Accept' => 'application/json'
    ])->get("{$this->productUrl}/api/products/{$productId}");

    expect($getResponse->status())->toBe(404);
});