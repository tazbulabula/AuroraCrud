<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductService $product_service)
    {}

    public function list(Request $request)
    {
        $userId = auth('api')->id();

        if($userId!==null){
            return response()->json(['error'=>'User não encontrado.'], 404);
        }

        $products = $this->product_service->getAllProducts($userId);

        return response()->json($products);
    }


    public function create(Request $request)
    {
        $userId = auth('api')->id();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
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
        ]);

        $product->update($validated);

        return response()->json($product);
    }


    public function delete(Product $product)
    {

        $userId = auth('api')->id();

        $product = Product::where('user_id', $userId)->findOrFail($id);

        $product->delete();

        return response()->json(null, 204);
    }
}
