<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    private const SHOWCASE_CATEGORIES = [
        'automoveis' => 'Automóveis',
        'electronicos' => 'Tecnologia',
        'roupas' => 'Moda e estilo',
    ];

    private const SHOWCASE_IMAGE_EXTENSIONS = [
        'avif', 'gif', 'jfif', 'jpeg', 'jpg', 'png', 'webp',
    ];

    public function __construct(private ProductService $product_service) {}

    public function list(Request $request)
    {
        $userId = auth('api')->id();

        if ($userId === null) {  // ← Usar === null
            return response()->json(['error' => 'User não encontrado.'], 404);
        }

        $products = $this->product_service->getAllProducts($userId);

        return response()->json($products);
    }

    public function create(Request $request)
    {
        $userId = auth('api')->id();

        if ($userId === null) {  // ← Verificar se o usuário existe
            return response()->json(['error' => 'User não encontrado.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
        ]);

        $product = $this->product_service->createProduct($validated, $userId);

        return response()->json($product, 201);
    }

    public function show($id)
    {
        $userId = auth('api')->id();

        $product = Product::where('user_id', $userId)->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $userId = auth('api')->id();

        $product = Product::where('user_id', $userId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
            'remove_image' => 'sometimes|boolean',
        ]);

        $product = $this->product_service->updateProduct($product, $validated, $userId);

        return response()->json($product);
    }

    public function delete($id)
    {
        $userId = auth('api')->id();

        if ($userId === null) {  // ← Usar === null
            return response()->json(['error' => 'User não encontrado.'], 404);
        }

        $product = Product::where('user_id', $userId)->findOrFail($id);
        $this->product_service->deleteProduct($product, $userId);

        return response()->json(null, 204);
    }

    public function image($id)
    {
        $product = Product::findOrFail($id);

        abort_if(
            $product->image_path === null || ! Storage::disk('public')->exists($product->image_path),
            404
        );

        return Storage::disk('public')->response($product->image_path);
    }

    public function landing()
    {
        return response()->json([
            'products' => Product::orderBy('created_at', 'desc')->get(),
            'showcase_images' => $this->showcaseImages(),
        ]);
    }

    private function showcaseImages()
    {
        return collect(self::SHOWCASE_CATEGORIES)
            ->flatMap(function (string $label, string $category) {
                return collect(Storage::disk('public')->files("products/{$category}"))
                    ->filter(fn (string $path) => in_array(
                        strtolower(pathinfo($path, PATHINFO_EXTENSION)),
                        self::SHOWCASE_IMAGE_EXTENSIONS,
                        true
                    ))
                    ->sort()
                    ->map(fn (string $path) => [
                        'id' => "{$category}/".basename($path),
                        'category' => $category,
                        'category_label' => $label,
                        'name' => ucwords(str_replace(
                            ['-', '_', '.'],
                            ' ',
                            pathinfo($path, PATHINFO_FILENAME)
                        )),
                        'url' => url("/storage/{$path}"),
                    ]);
            })
            ->values();
    }

    public function showcaseImage(string $category, string $filename)
    {
        abort_unless(array_key_exists($category, self::SHOWCASE_CATEGORIES), 404);
        abort_unless($filename === basename($filename), 404);
        abort_unless(in_array(
            strtolower(pathinfo($filename, PATHINFO_EXTENSION)),
            self::SHOWCASE_IMAGE_EXTENSIONS,
            true
        ), 404);

        $path = "products/{$category}/{$filename}";

        abort_unless(Storage::disk('public')->exists($path), 404);

        return Storage::disk('public')->response($path, null, [
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    public function listPublic(Request $request)
    {
        //  Buscar todos os produtos com dados do usuário
        $products = Product::orderBy('created_at', 'desc')
            ->get();

        return response()->json($products);
    }
}
