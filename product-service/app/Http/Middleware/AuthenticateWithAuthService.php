<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithAuthService
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $authServiceUrl = rtrim(config('services.auth_service.url'), '/');

        try {
            $response = Http::acceptJson()
                ->withToken($token)
                ->timeout(5)
                ->get($authServiceUrl.'/api/me');
        } catch (ConnectionException $exception) {
            Log::error('Auth service token validation failed to connect.', [
                'exception' => $exception,
            ]);

            return response()->json(['message' => 'Authentication service unavailable.'], 503);
        }

        if ($response->status() === 401) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $response->successful()) {
            Log::error('Auth service returned an unexpected token validation status.', [
                'status' => $response->status(),
            ]);

            return response()->json(['message' => 'Authentication service unavailable.'], 502);
        }

        $userData = $response->json();

        if (! is_array($userData) || filter_var($userData['id'] ?? null, FILTER_VALIDATE_INT) === false) {
            Log::error('Auth service returned an invalid user identity during token validation.');

            return response()->json(['message' => 'Authentication service returned an invalid identity.'], 502);
        }

        $user = (new User)->forceFill($userData);

        Auth::shouldUse('api');
        Auth::guard('api')->setUser($user);

        return $next($request);
    }
}
