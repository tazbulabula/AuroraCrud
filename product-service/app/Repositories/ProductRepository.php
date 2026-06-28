<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductRepository
{
   
    protected function baseQuery(int $userId): Builder
    {
        return Product::where('user_id', $userId);
    }


    public function getAllProducts(int $userId): Collection
    {
        return $this->baseQuery($userId)->get();
    }


    public function getProductById(int $userId, int $productId): ?Product
    {
        return $this->baseQuery($userId)
            ->where('id', $productId)
            ->first();
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

 
    public function create(array $data): Product
    {
        return Product::create($data);
    }


    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    public function delete(Product $product): bool
    {
        return $product->delete();
    }


    public function productBelongsToUser(int $userId, int $productId): bool
    {
        return $this->baseQuery($userId)
            ->where('id', $productId)
            ->exists();
    }
}
