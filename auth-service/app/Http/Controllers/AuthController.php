<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request){
       
        $credentials = $request->only('email', 'password');

        if(! $user = User::where('email', $request->email)->first()){
            return response()->json(['error' => 'Email não encontrado.'], 404);
        }

        if(! Hash::check($request->password, $user->password)){
            return response()->json(['error' => 'Password errada.'],401);
        }

        if(! $token = auth('api')->attempt($credentials)){
            return response()->json(['error'=>'Erro ao fazer o login.'], 401);
        }

        return response()->json([
            'access_token'=>$token,
            'refresh_token' => auth('api')->setTTL(10080)->attempt($credentials),
            'token_type' => 'bearer',
            'expire' => auth('api')->factory()->getTTL()*60,
        ]);
    }

    public function me(){
        return response()->json(auth('api')->user());
    }

    public function refreshToken(){
        return response()->json([
            'access_token' => auth('api')->refresh(),
            'token_type'   => 'bearer',
            'expire'   => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['error' => 'Token não fornecido.'], 400);
        }

        try {
            
            auth('api')->setToken($token)->check();

            auth('api')->invalidate($token);

            auth('api')->logout();

            return response()->json(['sucesso' => 'Logout feito com sucesso.'], 200);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Token inválido ou expirado.'], 401);
        }
    }

}
