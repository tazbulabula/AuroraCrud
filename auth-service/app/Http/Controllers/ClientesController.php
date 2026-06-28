<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ClientesController extends Controller
{
    public function __construct(private UserService $userService)
    {
    }

    
    public function register(Request $request): JsonResponse
    {
        
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'nullable|string|max:10|in:ADMIN,CLIENT',
            ]);

            if(!isset($validatedData['role'])){
                $validatedData['role']='CLIENT';
            }

            $user = $this->userService->create($validatedData);

            return response()->json($user, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }


    public function listClients(): JsonResponse
    {
        $clients = $this->userService->getAllClients();

        return response()->json($clients);
    }


    public function update(Request $request, User $user): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
                'password' => 'nullable|string|min:8',
                'role' => 'nullable|string|max:10|in:ADMIN,CLIENTE',
            ]);

            $validatedData = array_filter($validatedData, fn($value) => $value !== null);

            $updatedUser = $this->userService->update($validatedData, $user);

            return response()->json($updatedUser);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }


    public function delete(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'success' => 'User deleted successfully',
        ]);
    }
}
