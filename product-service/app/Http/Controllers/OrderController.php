<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * ✅ Criar pedido (público - guest)
     */
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
                'guest_id' => 'nullable|string|max:255',
            ]);

            $product = Product::find($validated['product_id']);

            if (!$product) {
                return response()->json(['error' => 'Produto não encontrado'], 404);
            }

            if ($product->stock < $validated['quantity']) {
                return response()->json([
                    'error' => 'Stock insuficiente. Disponível: ' . $product->stock
                ], 400);
            }

            $totalPrice = $product->price * $validated['quantity'];

            $order = Order::create([
                'product_id' => $product->id,
                'user_id' => $product->user_id,
                'buyer_name' => $validated['buyer_name'],
                'buyer_phone' => $validated['buyer_phone'],
                'buyer_address' => $validated['buyer_address'],
                'buyer_email' => $validated['buyer_email'] ?? null,
                'buyer_notes' => $validated['buyer_notes'] ?? null,
                'quantity' => $validated['quantity'],
                'total_price' => $totalPrice,
                'status' => 'pending',
                'guest_id' => $validated['guest_id'] ?? null,
                'is_guest' => true,
            ]);

            Notification::create([
                'user_id' => $product->user_id,
                'order_id' => $order->id,
                'type' => 'new_order',
                'message' => "📦 Novo pedido de {$validated['buyer_name']} para '{$product->name}' - Qtd: {$validated['quantity']}",
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

    /**
     * ✅ Rastrear pedido (público)
     */
    public function trackOrder($trackingCode)
    {
        $order = Order::where('tracking_code', $trackingCode)
            ->with(['product', 'user:id,name,email'])
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        return response()->json($order);
    }

    /**
     * ✅ Listar pedidos do vendedor
     */
    public function listVendorOrders(Request $request)
    {
        $userId = auth('api')->id();

        if (!$userId) {
            return response()->json(['error' => 'Utilizador não autenticado'], 401);
        }

        $orders = Order::with(['product', 'notifications'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * ✅ Confirmar pedido
     */
    public function confirm(Request $request, $orderId)
    {
        $userId = auth('api')->id();

        if (!$userId) {
            return response()->json(['error' => 'Utilizador não autenticado'], 401);
        }

        $order = Order::where('id', $orderId)
            ->where('user_id', $userId)
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        $order->update(['status' => 'confirmed']);

        return response()->json([
            'message' => 'Pedido confirmado com sucesso!',
            'order' => $order,
        ]);
    }

    /**
     * ✅ Marcar como entregue
     */
    public function deliver(Request $request, $orderId)
    {
        $userId = auth('api')->id();

        if (!$userId) {
            return response()->json(['error' => 'Utilizador não autenticado'], 401);
        }

        $order = Order::where('id', $orderId)
            ->where('user_id', $userId)
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        $order->update(['status' => 'delivered']);

        return response()->json([
            'message' => 'Pedido marcado como entregue!',
            'order' => $order,
        ]);
    }

    /**
     * ✅ Buscar notificações do vendedor
     */
    public function getNotifications(Request $request)
    {
        $userId = auth('api')->id();

        if (!$userId) {
            return response()->json(['error' => 'Utilizador não autenticado'], 401);
        }

        $notifications = Notification::where('user_id', $userId)
            ->with('order.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    /**
     * ✅ Marcar notificação como lida
     */
    public function markNotificationRead(Request $request, $notificationId)
    {
        $userId = auth('api')->id();

        if (!$userId) {
            return response()->json(['error' => 'Utilizador não autenticado'], 401);
        }

        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notificação não encontrada'], 404);
        }

        $notification->update(['read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notificação marcada como lida'
        ]);
    }
}