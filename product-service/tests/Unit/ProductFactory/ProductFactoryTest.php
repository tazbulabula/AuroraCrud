<?php

use App\Models\Product;

test('criar produto com factory', function () {
    $product = Product::factory()->create();

    expect($product->name)->not->toBeEmpty();
    expect($product->price)->toBeGreaterThan(0);
});
