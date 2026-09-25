<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    // ✅ Criar pedido (público - sem autenticação)
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'buyer_name' => 'required|string|max:255',
                'buyer_phone' => 'required|string|max:20',
                'buyer_address' => 'required|string|max:500',
                'buyer_email' => 'nullable|email|max:255',
                'buyer_notes' => 'nullable|string',
                'quantity' => 'required|integer|min:1',
                'guest_id' => 'nullable|string|max:255', // Identificador único do visitante
            ]);

            $product = Product::find($validated['product_id']);

            // Verificar estoque
            if ($product->stock < $validated['quantity']) {
                return response()->json([
                    'error' => 'Estoque insuficiente. Disponível: ' . $product->stock
                ], 400);
            }

            $totalPrice = $product->price * $validated['quantity'];

            // Criar pedido
            $order = Order::create([
                'product_id' => $product->id,
                'user_id' => $product->user_id, // Vendedor
                'buyer_name' => $validated['buyer_name'],
                'buyer_phone' => $validated['buyer_phone'],
                'buyer_address' => $validated['buyer_address'],
                'buyer_email' => $validated['buyer_email'] ?? null,
                'buyer_notes' => $validated['buyer_notes'] ?? null,
                'quantity' => $validated['quantity'],
                'total_price' => $totalPrice,
                'status' => 'pending',
                'guest_id' => $validated['guest_id'] ?? null,
                'is_guest' => true, // ✅ Marcar como pedido de visitante
            ]);

            // ✅ Criar notificação para o vendedor
            Notification::create([
                'user_id' => $product->user_id,
                'order_id' => $order->id,
                'type' => 'new_order',
                'message' => "📦 Novo pedido de {$validated['buyer_name']} para o produto '{$product->name}' - Qtd: {$validated['quantity']}",
                'read' => false,
            ]);

            return response()->json([
                'message' => 'Pedido realizado com sucesso!',
                'order' => [
                    'id' => $order->id,
                    'tracking_code' => $order->tracking_code,
                    'status' => $order->status,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro ao criar pedido: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erro ao criar pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ Buscar pedido por código de rastreio (guest)
    public function trackOrder(Request $request, $trackingCode)
    {
        $order = Order::where('tracking_code', $trackingCode)
            ->with(['product', 'user:id,name,email'])
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        return response()->json($order);
    }

    // ✅ Listar pedidos do vendedor (autenticado)
    public function listVendorOrders(Request $request)
    {
        $userId = auth('api')->id();

        if (!$userId) {
            return response()->json(['error' => 'Usuário não autenticado'], 401);
        }

        $orders = Order::with(['product', 'notifications'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    // ✅ Confirmar pedido (vendedor)
    public function confirm(Request $request, $orderId)
    {
        $userId = auth('api')->id();

        if (!$userId) {
            return response()->json(['error' => 'Usuário não autenticado'], 401);
        }

        $order = Order::where('id', $orderId)
            ->where('user_id', $userId)
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        $order->update(['status' => 'confirmed']);

        // ✅ Notificar o vendedor que o pedido foi confirmado
        Notification::create([
            'user_id' => $userId,
            'order_id' => $order->id,
            'type' => 'order_confirmed',
            'message' => "✅ Pedido #{$order->tracking_code} confirmado!",
            'read' => false,
        ]);

        return response()->json([
            'message' => 'Pedido confirmado com sucesso!',
            'order' => $order,
        ]);
    }

    // ✅ Marcar como entregue
    public function deliver(Request $request, $orderId)
    {
        $userId = auth('api')->id();

        if (!$userId) {
            return response()->json(['error' => 'Usuário não autenticado'], 401);
        }

        $order = Order::where('id', $orderId)
            ->where('user_id', $userId)
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        $order->update(['status' => 'delivered']);

        Notification::create([
            'user_id' => $userId,
            'order_id' => $order->id,
            'type' => 'order_delivered',
            'message' => "📦 Pedido #{$order->tracking_code} entregue!",
            'read' => false,
        ]);

        return response()->json([
            'message' => 'Pedido marcado como entregue!',
            'order' => $order,
        ]);
    }
}