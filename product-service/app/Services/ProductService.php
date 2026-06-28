<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductService
{
    public function __construct(private ProductRepository $productRepository)
    {
        
    }
    
    
    public function getAllProducts(int $userId): Collection
    {
        return $this->productRepository->getAllProducts($userId);
    }

    public function getProductById(int $userId, int $productId): ?Product
    {
        return $this->productRepository->getProductById($userId, $productId);
    }


    public function getProductByIdOrFail(int $userId, int $productId): Product
    {
        $product = $this->getProductById($userId, $productId);

        if (!$product) {
            throw new ModelNotFoundException(
                "Product with ID {$productId} not found for user {$userId}"
            );
        }

        return $product;
    }

  
    public function createProduct(array $data, int $userId): Product
    {
        $data['user_id'] = $userId;
        return $this->productRepository->create($data);
    }

  
    public function updateProduct(Product $product, array $data, int $userId): Product
    {
       
        if ($product->user_id !== $userId) {
            throw new ModelNotFoundException(
                "Product with ID {$product->id} does not belong to user {$userId}"
            );
        }

        return $this->productRepository->update($product, $data);
    }

   
    public function deleteProduct(Product $product, int $userId): bool
    {
        
        if ($product->user_id !== $userId) {
            throw new ModelNotFoundException(
                "Product with ID {$product->id} does not belong to user {$userId}"
            );
        }

        return $this->productRepository->delete($product);
    }

   
    public function productBelongsToUser(int $userId, int $productId): bool
    {
        return $this->productRepository->productBelongsToUser($userId, $productId);
    }
}
