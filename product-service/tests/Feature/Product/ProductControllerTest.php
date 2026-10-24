<?php

namespace Tests\Feature\Product;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    config(['services.auth_service.url' => 'http://auth-service:8000']);
    $authenticatedUser = $this->user;
    Http::fake(function (HttpRequest $request) use ($authenticatedUser) {
        if ($request->hasHeader('Authorization', 'Bearer remote-user-token')) {
            return Http::response([
                'id' => 151,
                'name' => 'Vendedor remoto',
                'email' => 'vendedor@example.com',
                'role' => 'ADMIN',
            ]);
        }

        if (str_contains($request->url(), '/invalid/')) {
            return Http::response(['message' => 'Unauthenticated.'], 401);
        }

        if (str_contains($request->url(), 'unavailable-auth-service')) {
            throw new ConnectionException('Connection refused.');
        }

        return Http::response([
            'id' => $authenticatedUser->id,
            'name' => $authenticatedUser->name,
            'email' => $authenticatedUser->email,
            'role' => 'CLIENT',
        ]);
    });
    $this->dataProduct = [
        'name' => 'Produto Teste',
        'description' => 'Descrição do produto',
        'price' => 100,
        'stock' => 5,
    ];
});

test('pode criar produtos com autenticacao', function () {
    $response = $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->postJson('/api/products/create', $this->dataProduct);

    $response->assertCreated()
        ->assertJsonPath('name', $this->dataProduct['name'])
        ->assertJsonPath('user_id', $this->user->id)
        ->assertJsonPath('price', '100.00');

    $this->assertDatabaseHas('products', [
        'name' => $this->dataProduct['name'],
        'user_id' => $this->user->id,
    ]);

    Http::assertSent(fn (HttpRequest $request) => $request->hasHeader('Authorization'));
});

test('aceita o ID do vendedor validado pelo auth-service sem utilizador local', function () {
    $this->withToken('remote-user-token')
        ->postJson('/api/products/create', $this->dataProduct)
        ->assertCreated()
        ->assertJsonPath('user_id', 151);

    Http::assertSent(fn (HttpRequest $request) => $request->url() === 'http://auth-service:8000/api/me'
        && $request->hasHeader('Authorization'));

    $this->assertDatabaseHas('products', [
        'name' => $this->dataProduct['name'],
        'user_id' => 151,
    ]);
});

test('nao cria produto sem token', function () {
    $this->postJson('/api/products/create', $this->dataProduct)
        ->assertUnauthorized();

    Http::assertNothingSent();
});

test('nao cria produto com token invalido', function () {
    config(['services.auth_service.url' => 'http://auth-service:8000/invalid']);

    $this->withHeader('Authorization', 'Bearer token-invalido')
        ->postJson('/api/products/create', $this->dataProduct)
        ->assertUnauthorized();
});

test('responde com indisponibilidade se o auth-service nao puder validar o token', function () {
    config(['services.auth_service.url' => 'http://unavailable-auth-service:8000']);

    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->getJson('/api/products')
        ->assertServiceUnavailable();
});

test('cria produto com dados minimos', function () {
    $data = [
        'name' => 'Produto Minimo',
        'price' => 50,
        'stock' => 10,
    ];

    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->postJson('/api/products/create', $data)
        ->assertCreated()
        ->assertJsonPath('name', $data['name'])
        ->assertJsonPath('price', '50.00')
        ->assertJsonPath('stock', 10);
});

test('pode enviar e consultar imagem de produto', function () {
    Storage::fake('public');
    $image = UploadedFile::fake()->createWithContent(
        'produto.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/6z8AAAAASUVORK5CYII=')
    );

    $response = $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->post('/api/products/create', [
            ...$this->dataProduct,
            'image' => $image,
        ]);

    $response->assertCreated();

    $product = Product::query()->firstOrFail();
    expect($product->image_path)->toStartWith('products/');
    Storage::disk('public')->assertExists($product->image_path);

    $response->assertJsonPath('image_url', route('products.image', ['id' => $product->id]));
    $this->get("/api/products/{$product->id}/image")
        ->assertOk()
        ->assertHeader('content-type', 'image/png');
});

test('carrega o catalogo publico e serve as imagens da vitrina por categoria', function () {
    Storage::fake('public');
    Storage::disk('public')->put('products/roupas/look-1.jpg', 'image bytes');
    Storage::disk('public')->put('products/roupas/not-a-photo.txt', 'not an image');

    $response = $this->getJson('/api/products/landing')
        ->assertOk()
        ->assertJsonCount(0, 'products')
        ->assertJsonCount(1, 'showcase_images')
        ->assertJsonPath('showcase_images.0.category', 'roupas')
        ->assertJsonPath('showcase_images.0.category_label', 'Moda e estilo')
        ->assertJsonPath('showcase_images.0.url', url('/storage/products/roupas/look-1.jpg'));

    $this->get(route('products.showcase.image', [
        'category' => 'roupas',
        'filename' => 'look-1.jpg',
    ]))
        ->assertOk()
        ->assertHeader('content-type', 'image/jpeg')
        ->assertHeader('cache-control', 'max-age=86400, public');
});

test('nao serve imagens da vitrina fora das categorias permitidas', function () {
    $this->get('/api/products/showcase/images/../../.env')
        ->assertNotFound();
});

test('rejeita ficheiros que nao sejam imagens permitidas', function () {
    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->post('/api/products/create', [
            ...$this->dataProduct,
            'image' => UploadedFile::fake()->createWithContent('produto.txt', 'not an image'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('image');
});

test('pode substituir ou remover a imagem do produto', function () {
    Storage::fake('public');
    $oldImagePath = 'products/antiga.png';
    Storage::disk('public')->put($oldImagePath, 'old image');
    $product = Product::factory()->create([
        'user_id' => $this->user->id,
        'image_path' => $oldImagePath,
    ]);

    $image = UploadedFile::fake()->createWithContent(
        'nova.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/6z8AAAAASUVORK5CYII=')
    );

    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->post("/api/products/update/{$product->id}", [
            '_method' => 'PUT',
            'image' => $image,
        ])
        ->assertOk();

    $product->refresh();
    expect($product->image_path)->not->toBe($oldImagePath);
    Storage::disk('public')->assertMissing($oldImagePath);
    Storage::disk('public')->assertExists($product->image_path);

    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->post("/api/products/update/{$product->id}", [
            '_method' => 'PUT',
            'remove_image' => true,
        ])->assertOk()
        ->assertJsonPath('image_url', null);

    Storage::disk('public')->assertMissing($product->image_path);
});

test('validacao falha quando nome esta faltando', function () {
    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->postJson('/api/products/create', [
            'price' => 100,
            'stock' => 5,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name');
});

test('validacao falha quando preco e negativo', function () {
    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->postJson('/api/products/create', [
            'name' => 'Produto',
            'price' => -10,
            'stock' => 5,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('price');
});

test('validacao falha quando stock e negativo', function () {
    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->postJson('/api/products/create', [
            'name' => 'Produto',
            'price' => 100,
            'stock' => -5,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('stock');
});

test('lista apenas produtos do usuario autenticado', function () {
    $otherUser = User::factory()->create();
    Product::factory()->count(3)->create(['user_id' => $this->user->id]);
    Product::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->getJson('/api/products');

    $response->assertOk()
        ->assertJsonCount(3);

    expect(collect($response->json())->pluck('user_id')->unique()->all())
        ->toBe([$this->user->id]);
});

test('pode atualizar produto do usuario autenticado', function () {
    $product = Product::factory()->create(['user_id' => $this->user->id]);
    $updateData = [
        'name' => 'Produto Atualizado',
        'price' => 200,
        'stock' => 15,
    ];

    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->putJson("/api/products/update/{$product->id}", $updateData)
        ->assertOk()
        ->assertJsonPath('name', $updateData['name'])
        ->assertJsonPath('price', '200.00')
        ->assertJsonPath('stock', 15);
});

test('nao permite acessar produto de outro usuario', function () {
    $otherUser = User::factory()->create();
    $product = Product::factory()->create(['user_id' => $otherUser->id]);

    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->getJson("/api/products/{$product->id}")
        ->assertNotFound();
});

test('pode deletar produto do usuario autenticado', function () {
    Storage::fake('public');
    $imagePath = 'products/remover.png';
    Storage::disk('public')->put($imagePath, 'image');
    $product = Product::factory()->create([
        'user_id' => $this->user->id,
        'image_path' => $imagePath,
    ]);

    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->deleteJson("/api/products/{$product->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
    Storage::disk('public')->assertMissing($imagePath);
});

test('nao permite deletar produto de outro usuario', function () {
    $otherUser = User::factory()->create();
    $product = Product::factory()->create(['user_id' => $otherUser->id]);

    $this->withHeader('Authorization', 'Bearer valid-test-token')
        ->deleteJson("/api/products/{$product->id}")
        ->assertNotFound();

    $this->assertDatabaseHas('products', ['id' => $product->id]);
});
