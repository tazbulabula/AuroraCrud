<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class ProductService
{
    public function __construct(private ProductRepository $productRepository) {}

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

        if (! $product) {
            throw new ModelNotFoundException(
                "Product with ID {$productId} not found for user {$userId}"
            );
        }

        return $product;
    }

    public function createProduct(array $data, int $userId): Product
    {
        $image = $data['image'] ?? null;
        unset($data['image'], $data['remove_image']);

        $data['user_id'] = $userId;

        if ($image instanceof UploadedFile) {
            $data['image_path'] = $this->storeImage($image);
        }

        try {
            return $this->productRepository->create($data);
        } catch (Throwable $exception) {
            if (isset($data['image_path'])) {
                Storage::disk('public')->delete($data['image_path']);
            }

            throw $exception;
        }
    }

    public function updateProduct(Product $product, array $data, int $userId): Product
    {
        if ($product->user_id !== $userId) {
            throw new ModelNotFoundException(
                "Product with ID {$product->id} does not belong to user {$userId}"
            );
        }

        $image = $data['image'] ?? null;
        $removeImage = filter_var($data['remove_image'] ?? false, FILTER_VALIDATE_BOOLEAN);
        unset($data['image'], $data['remove_image']);

        $previousImagePath = $product->image_path;
        $newImagePath = null;

        if ($image instanceof UploadedFile) {
            $newImagePath = $this->storeImage($image);
            $data['image_path'] = $newImagePath;
        } elseif ($removeImage) {
            $data['image_path'] = null;
        }

        try {
            $updatedProduct = $this->productRepository->update($product, $data);
        } catch (Throwable $exception) {
            if ($newImagePath !== null) {
                Storage::disk('public')->delete($newImagePath);
            }

            throw $exception;
        }

        if ($previousImagePath !== null && $updatedProduct->image_path !== $previousImagePath) {
            $this->deleteImage($previousImagePath);
        }

        return $updatedProduct;
    }

    public function deleteProduct(Product $product, int $userId): bool
    {
        if ($product->user_id !== $userId) {
            throw new ModelNotFoundException(
                "Product with ID {$product->id} does not belong to user {$userId}"
            );
        }

        $imagePath = $product->image_path;
        $deleted = $this->productRepository->delete($product);

        if ($deleted && $imagePath !== null) {
            $this->deleteImage($imagePath);
        }

        return $deleted;
    }

    public function productBelongsToUser(int $userId, int $productId): bool
    {
        return $this->productRepository->productBelongsToUser($userId, $productId);
    }

    private function storeImage(UploadedFile $image): string
    {
        $path = $image->store('products', 'public');

        if ($path === false) {
            throw new RuntimeException('Não foi possível guardar a imagem do produto.');
        }

        return $path;
    }

    private function deleteImage(string $path): void
    {
        if (! Storage::disk('public')->delete($path)) {
            throw new RuntimeException('Não foi possível remover a imagem antiga do produto.');
        }
    }
}
