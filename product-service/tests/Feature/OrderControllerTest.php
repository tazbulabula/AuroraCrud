<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guest orders can reference a vendor owned by the auth service', function () {
    $product = Product::factory()->create([
        'user_id' => 151,
        'stock' => 10,
    ]);

    $response = $this->postJson('/api/orders', [
        'product_id' => $product->id,
        'buyer_name' => 'Comprador Guest',
        'buyer_phone' => '+244921351606',
        'buyer_address' => 'Luanda, Angola',
        'buyer_email' => 'guest@example.com',
        'quantity' => 2,
        'guest_id' => 'guest_test_123',
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Pedido realizado com sucesso!');

    $orderId = $response->json('order.id');

    $this->assertDatabaseHas('orders', [
        'id' => $orderId,
        'product_id' => $product->id,
        'user_id' => 151,
        'is_guest' => true,
        'guest_id' => 'guest_test_123',
    ]);

    $this->assertDatabaseHas('notifications', [
        'user_id' => 151,
        'order_id' => $orderId,
        'type' => 'new_order',
    ]);
});
