<?php

namespace Tests\Feature\Services;

use App\Models\Product;
use App\Models\User;
use App\Repositories\ProductRepository;
use App\Services\ProductService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->productRepository = new ProductRepository();
    $this->productService = new ProductService($this->productRepository);
});

describe('ProductService - getAllProducts', function () {
    test('retorna todos os produtos do usuario', function () {
        
        Product::factory()->count(3)->create(['user_id' => 11]);
        
        
        $products = $this->productService->getAllProducts(11);
        
        
        expect($products)->toHaveCount(3);
        expect($products)->each->toBeInstanceOf(Product::class);
    });

    test('retorna colecao vazia quando usuario nao tem produtos', function () {
      
        $products = $this->productService->getAllProducts(11);
        
       
        expect($products)->toBeEmpty();
    });
});

describe('ProductService - getProductById', function () {
    test('retorna produto quando existe e pertence ao usuario', function () {
      
        $product = Product::factory()->create(['user_id' => 11]);
        
        
        $foundProduct = $this->productService->getProductById(
            11,
            $product->id
        );
        
       
        expect($foundProduct)->toBeInstanceOf(Product::class);
        expect($foundProduct->id)->toBe($product->id);
    });

    test('retorna null quando produto nao existe', function () {
       
        $product = $this->productService->getProductById(
            11,
            99999
        );
      
        expect($product)->toBeNull();
    });

    test('retorna null quando produto pertence a outro usuario', function () {
       
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $otherUser->id]);
        
        
        $foundProduct = $this->productService->getProductById(
            11,
            $product->id
        );
        
        
        expect($foundProduct)->toBeNull();
    });
});

describe('ProductService - getProductByIdOrFail', function () {
    test('retorna produto quando existe e pertence ao usuario', function () {
        
        $product = Product::factory()->create(['user_id' => 11]);
        
        
        $foundProduct = $this->productService->getProductByIdOrFail(
            11,
            $product->id
        );
       
        expect($foundProduct)->toBeInstanceOf(Product::class);
        expect($foundProduct->id)->toBe($product->id);
    });

    test('lanca ModelNotFoundException quando produto nao existe', function () {
        
        expect(fn() => $this->productService->getProductByIdOrFail(
            11,
            99999
        ))->toThrow(ModelNotFoundException::class);
    });

    test('lanca ModelNotFoundException quando produto pertence a outro usuario', function () {
        
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $otherUser->id]);
        
        
        expect(fn() => $this->productService->getProductByIdOrFail(
            11,
            $product->id
        ))->toThrow(ModelNotFoundException::class);
    });
});

describe('ProductService - createProduct', function () {
    test('cria produto com sucesso', function () {
      
        $data = [
            'name' => 'Novo Produto',
            'description' => 'Descrição',
            'price' => 99.90,
            'stock' => 10
        ];
        
       
        $product = $this->productService->createProduct($data, 1);
        
     
        expect($product)->toBeInstanceOf(Product::class);
        expect($product->name)->toBe('Novo Produto');
        expect($product->user_id)->toBe(1);
        
        $this->assertDatabaseHas('products', [
            'name' => 'Novo Produto',
            'user_id' => 1
        ]);
    });

    test('cria produto com dados minimos', function () {
       
        $data = [
            'name' => 'Produto Minimo',
            'price' => 50.00,
            'stock' => 5
        ];
        
        
        $product = $this->productService->createProduct($data, 11);
        
       
        expect($product->name)->toBe('Produto Minimo');
        expect($product->user_id)->toBe(11);
    });
});

describe('ProductService - updateProduct', function () {
    test('atualiza produto com sucesso', function () {
      
        $product = Product::factory()->create([
            'user_id' => 11,
            'name' => 'Nome Antigo',
            'price' => 50.00
        ]);
        
        $data = [
            'name' => 'Nome Novo',
            'price' => 75.50
        ];
        
     
        $updatedProduct = $this->productService->updateProduct(
            $product,
            $data,
            11
        );
        
      
        expect($updatedProduct->name)->toBe('Nome Novo');
        expect($updatedProduct->price)->toBe(75.50);
        
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Nome Novo',
            'price' => 75.50
        ]);
    });

    test('lanca ModelNotFoundException quando tenta atualizar produto de outro usuario', function () {
        
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $otherUser->id]);
        
        $data = ['name' => 'Nome Novo'];
        
      
        expect(fn() => $this->productService->updateProduct(
            $product,
            $data,
            11
        ))->toThrow(ModelNotFoundException::class);
        
      
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => $product->name
        ]);
    });

    test('atualiza apenas alguns campos', function () {
       
        $product = Product::factory()->create([
            'user_id' => 11,
            'name' => 'Nome Original',
            'description' => 'Descrição Original',
            'price' => 100.00,
            'stock' => 10
        ]);
        
        $data = [
            'name' => 'Nome Atualizado',
            'price' => 150.00
        ];
        
    
        $updatedProduct = $this->productService->updateProduct(
            $product,
            $data,
            11
        );
        
        
        expect($updatedProduct->name)->toBe('Nome Atualizado');
        expect($updatedProduct->price)->toBe(150.00);
        expect($updatedProduct->description)->toBe('Descrição Original'); 
        expect($updatedProduct->stock)->toBe(10); 
    });
});

describe('ProductService - deleteProduct', function () {
    test('deleta produto com sucesso', function () {
     
        $product = Product::factory()->create(['user_id' => 1]);
        
       
        $result = $this->productService->deleteProduct(
            $product,
            1
        );
        
     
        expect($result)->toBeTrue();
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    });

    test('lanca ModelNotFoundException quando tenta deletar produto de outro usuario', function () {
        
        $product = Product::factory()->create(['user_id' => 2]);
        
       
        expect(fn() => $this->productService->deleteProduct(
            $product,
            11
        ))->toThrow(ModelNotFoundException::class);
        
        
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    });
});

describe('ProductService - productBelongsToUser', function () {
    test('retorna true quando produto pertence ao usuario', function () {
        
        $product = Product::factory()->create(['user_id' => 1]);
        
        
        $belongsTo = $this->productService->productBelongsToUser(
            1,
            $product->id
        );
        
    
        expect($belongsTo)->toBeTrue();
    });

    test('retorna false quando produto nao pertence ao usuario', function () {
        
        
        $product = Product::factory()->create(['user_id' => 1]);
        
        
        $belongsTo = $this->productService->productBelongsToUser(
            11,
            $product->id
        );
        
      
        expect($belongsTo)->toBeFalse();
    });
});

describe('ProductService - Testes de integracao', function () {
    test('fluxo completo: create -> get -> update -> delete', function () {
       
        $data = [
            'name' => 'Produto Teste',
            'description' => 'Descrição',
            'price' => 100.00,
            'stock' => 5
        ];
        
        $product = $this->productService->createProduct($data, 1);
        expect($product->id)->not->toBeNull();
        
      
        $foundProduct = $this->productService->getProductByIdOrFail(
            1,
            $product->id
        );
        expect($foundProduct->name)->toBe('Produto Teste');
        
      
        $updatedProduct = $this->productService->updateProduct(
            $product,
            ['name' => 'Produto Atualizado', 'price' => 150.00],
            1
        );
        expect($updatedProduct->name)->toBe('Produto Atualizado');
        
     
        $result = $this->productService->deleteProduct(
            $product,
            1
        );
        expect($result)->toBeTrue();
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    });

    test('usuario so ve seus proprios produtos', function () {
        
        Product::factory()->count(3)->create(['user_id' => 1]);
        Product::factory()->count(5)->create(['user_id' => 2]);
        
        
        $productsUser1 = $this->productService->getAllProducts(1);
        $productsUser2 = $this->productService->getAllProducts(2);
        
       
        expect($productsUser1)->toHaveCount(3);
        expect($productsUser2)->toHaveCount(5);
        expect($productsUser1->first()->user_id)->toBe(1);
        expect($productsUser2->first()->user_id)->toBe(2);
    });
});

describe('ProductService - Testes de excecoes', function () {
    test('getProductByIdOrFail com ID invalido lança excecao', function () {
        expect(fn() => $this->productService->getProductByIdOrFail(
            1,
            99999
        ))->toThrow(ModelNotFoundException::class);
    });

    test('updateProduct com produto de outro usuario lança excecao', function () {
       
        $product = Product::factory()->create(['user_id' => 2]);
        
        expect(fn() => $this->productService->updateProduct(
            $product,
            ['name' => 'Novo Nome'],
            1
        ))->toThrow(ModelNotFoundException::class);
    });

    test('deleteProduct com produto de outro usuario lança excecao', function () {
        
        $product = Product::factory()->create(['user_id' => 2]);
        
        expect(fn() => $this->productService->deleteProduct(
            $product,
            1
        ))->toThrow(ModelNotFoundException::class);
    });
});