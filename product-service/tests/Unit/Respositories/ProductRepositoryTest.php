<?php

namespace Tests\Feature\Repositories;

use App\Models\Product;
use App\Models\User;
use App\Repositories\ProductRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->repository = new ProductRepository();
    
});

describe('ProductRepository - getAllProducts', function () {
    test('retorna todos os produtos do usuario', function () {
        
        Product::factory()->count(3)->create(['user_id' => 1]);
        Product::factory()->count(2)->create(['user_id' => 2]);
        

        $products = $this->repository->getAllProducts(1);
        
      
        expect($products)->toHaveCount(3);
        expect($products)->each->toBeInstanceOf(Product::class);
        expect($products->first()->user_id)->toBe(1);
    });

    test('retorna colecao vazia quando usuario nao tem produtos', function () {
        
        $products = $this->repository->getAllProducts(1);
        
        
        expect($products)->toBeEmpty();
        expect($products)->toHaveCount(0);
    });
});

describe('ProductRepository - getProductById', function () {
    test('retorna produto quando existe e pertence ao usuario', function () {
        
        $product = Product::factory()->create([
            'user_id' => 1,
            'name' => 'Produto Teste'
        ]);
        
        
        $foundProduct = $this->repository->getProductById(
            1,
            $product->id
        );
        
       
        expect($foundProduct)->toBeInstanceOf(Product::class);
        expect($foundProduct->id)->toBe($product->id);
        expect($foundProduct->name)->toBe('Produto Teste');
        expect($foundProduct->user_id)->toBe(1);
    });

    test('retorna null quando produto nao existe', function () {
        
        $product = $this->repository->getProductById(
            1,
            99999
        );
        
     
        expect($product)->toBeNull();
    });

    test('retorna null quando produto existe mas pertence a outro usuario', function () {
        
        $product = Product::factory()->create(['user_id' => 2]);
        
       
        $foundProduct = $this->repository->getProductById(
            1,
            $product->id
        );
        
        
        expect($foundProduct)->toBeNull();
    });
});

describe('ProductRepository - getProductByIdOrFail', function () {
    test('retorna produto quando existe e pertence ao usuario', function () {
    
        $product = Product::factory()->create(['user_id' => 1]);
        
        
        $foundProduct = $this->repository->getProductByIdOrFail(
            1,
            $product->id
        );
        
       
        expect($foundProduct)->toBeInstanceOf(Product::class);
        expect($foundProduct->id)->toBe($product->id);
    });

    test('lanca ModelNotFoundException quando produto nao existe', function () {
        
        expect(fn() => $this->repository->getProductByIdOrFail(
            1,
            99999
        ))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    });

    test('lanca ModelNotFoundException quando produto pertence a outro usuario', function () {
        
        $product = Product::factory()->create(['user_id' => 2]);
        
        
        expect(fn() => $this->repository->getProductByIdOrFail(
            1,
            $product->id
        ))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    });
});

describe('ProductRepository - create', function () {
    test('cria produto com sucesso', function () {
        
        $data = [
            'name' => 'Novo Produto',
            'description' => 'Descrição do produto',
            'price' => 99.90,
            'stock' => 10,
            'user_id' => 1
        ];
        
       
        $product = $this->repository->create($data);
        
        
        expect($product)->toBeInstanceOf(Product::class);
        expect($product->name)->toBe('Novo Produto');
        expect($product->price)->toBe(99.90);
        expect($product->user_id)->toBe(1);
        
        $this->assertDatabaseHas('products', [
            'name' => 'Novo Produto',
            'user_id' => 1
        ]);
    });
});

describe('ProductRepository - update', function () {
    test('atualiza produto com sucesso', function () {
        
        $product = Product::factory()->create([
            'user_id' => 1,
            'name' => 'Nome Antigo',
            'price' => 50.00
        ]);
        
        $data = [
            'name' => 'Nome Novo',
            'price' => 75.50
        ];
        
       
        $updatedProduct = $this->repository->update($product, $data);
        
       
        expect($updatedProduct->name)->toBe('Nome Novo');
        expect($updatedProduct->price)->toBe(75.50);
        
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Nome Novo',
            'price' => 75.50
        ]);
    });
});

describe('ProductRepository - delete', function () {
    test('deleta produto com sucesso', function () {
        
        $product = Product::factory()->create(['user_id' => 1]);
        
        
        $result = $this->repository->delete($product);
        
       
        expect($result)->toBeTrue();
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    });
});

describe('ProductRepository - productBelongsToUser', function () {
    test('retorna true quando produto pertence ao usuario', function () {
        
        $product = Product::factory()->create(['user_id' => 1]);
        
        
        $belongsTo = $this->repository->productBelongsToUser(
            1,
            $product->id
        );
        
       
        expect($belongsTo)->toBeTrue();
    });

    test('retorna false quando produto nao pertence ao usuario', function () {
       
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['user_id' => 2]);
        
    
        $belongsTo = $this->repository->productBelongsToUser(
            1,
            $product->id
        );
        
        
        expect($belongsTo)->toBeFalse();
    });

    test('retorna false quando produto nao existe', function () {
        
        $belongsTo = $this->repository->productBelongsToUser(
            1,
            99999
        );
        
       
        expect($belongsTo)->toBeFalse();
    });
});

describe('ProductRepository - Testes integrados', function () {
    test('fluxo completo: create -> get -> update -> delete', function () {
        
        $data = [
            'name' => 'Produto Teste',
            'description' => 'Descrição',
            'price' => 100.00,
            'stock' => 5,
            'user_id' => 1
        ];
        
        $product = $this->repository->create($data);
        expect($product->id)->not->toBeNull();
        
    
        $foundProduct = $this->repository->getProductById(
            1,
            $product->id
        );
        expect($foundProduct->name)->toBe('Produto Teste');
        
       
        $updatedProduct = $this->repository->update($product, [
            'name' => 'Produto Atualizado',
            'price' => 150.00
        ]);
        expect($updatedProduct->name)->toBe('Produto Atualizado');
        
       
        $result = $this->repository->delete($product);
        expect($result)->toBeTrue();
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    });
});