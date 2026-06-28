<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\JWTGuard;

beforeEach(function(){
    $this->user = User::factory()->create([
        'name'=>'Taz',
        'email' => 'taz@gmail.com',
        'password' => '123456',
        'role' => 'ADMIN'
    ]);

    $this->url = "http://localhost:8000/";

});

test('user pode fazer login com as credenciais corretas', function () {
    $response = $this->post("/api/login", [
        'email'=>$this->user->email,
        'password'=>'123456'
    ]);

    $response->assertStatus(200);

    $response->assertJsonStructure([
        'access_token',
        'token_type',
        'refresh_token',
        'expire',
    ]);

    $response->assertJsonFragment([
        'token_type' => 'bearer',
    ]);

});

test('fazer login com password errada falha', function(){
    $response = $this->post("/api/login", [
        'email'=>$this->user->email,
        'password'=>'password-errada'
    ]);
    
    $data = $response->json();

    $response->assertStatus(401);

    expect($data['error'])->toBe('Password errada.');
});


test('fazer login com email errado falha', function(){
    $response = $this->post("/api/login", [
        'email'=>'email-errado',
        'password'=>'123456'
    ]);
    
    $data = $response->json();

    $response->assertStatus(404);

    expect($data['error'])->toBe('Email não encontrado.');
});


test('falha ao gerar token mesmo com credenciais válidas', function () {

    $mockGuard = Mockery::mock(JWTGuard::class);
    $mockGuard->shouldReceive('attempt')->andReturn(false);
    $mockGuard->shouldReceive('check')->andReturn(false);

    Auth::shouldReceive('guard')->with(null)->andReturn($mockGuard);
    Auth::shouldReceive('guard')->with('api')->andReturn($mockGuard);

    $response = $this->postJson('/api/login', [
        'email' => $this->user->email,
        'password' => '123456',
    ]);

    $response->assertStatus(401)->assertJsonFragment([
        'error' => 'Erro ao fazer o login.',
    ]);
});


test('fazer logout com token ainda valido funciona', function(){
    $responseLogin = $this->post("/api/login", [
        'email'=>$this->user->email,
        'password'=>'123456'
    ]);

    $responseLogin->assertStatus(200);

    $token = $responseLogin->json('access_token');

    $responseLogout = $this->withHeaders(['Authorization'=> 'Bearer '.$token])->postJson("/api/logout");

    $responseLogout->assertStatus(200);

    $responseLogout->assertJsonFragment([
        'sucesso' => 'Logout feito com sucesso.',
    ]);
});

test('fazer logout sem o token ou token errado falha', function(){
    $responseLogin = $this->post("/api/login", [
        'email'=>$this->user->email,
        'password'=>'123456'
    ]);

    $responseLogin->assertStatus(200);

    $responseLogout = $this->withHeaders(['Authorization'=> 'Bearer '.'Token errado'])->postJson("/api/logout");

    $responseLogout->assertStatus(401);

    $responseLogout->assertJsonFragment([
        'error' => 'Token inválido ou expirado.',
    ]);
});

test('fazer logout sem o token falha', function(){
    $responseLogin = $this->post("/api/login", [
        'email'=>$this->user->email,
        'password'=>'123456'
    ]);

    $responseLogin->assertStatus(200);

    $responseLogout = $this->postJson("/api/logout");

    $responseLogout->assertStatus(400);

    $responseLogout->assertJsonFragment([
        'error' => 'Token não fornecido.',
    ]);
});

test('depois de fazer logout nao se acessa nenhuma rota autenticada', function(){
    
    $responseLogin = $this->post('/api/login', [
        'email' => $this->user->email,
        'password' => '123456'
    ]);

    $responseLogin->assertStatus(200);
    $token = $responseLogin->json('access_token');
    
    
    $responseMeAntes = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token
    ])->get('/api/me');
    
    $responseMeAntes->assertStatus(200); 

 
    $responseLogout = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token
    ])->postJson('/api/logout');

    $responseLogout->assertStatus(200);


    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token
    ])->get('/api/me');
    
    
    $response->assertStatus(401);
});

test('fazer o login permite buscar os dados do usuário', function(){
    $this->post("/api/login", [
        'email'=>$this->user->email,
        'password'=>'123456'
    ]);

    $response = $this->get("/api/me");

    $response->assertStatus(200);

    $dados = $response->json();

    expect($dados['name'])->toBe('Taz');
    expect($dados['email'])->toBe('taz@gmail.com');
    expect($dados['role'])->toBe('ADMIN');

});

/*test('acessar rotas autehenticadas com token invalido falha', function(){
    $this->post("/api/login", [
        'email'=>$this->user->email,
        'password'=>'123456'
    ]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer token_invalido',
    ])->get('/api/me');
    dd($response->json());
    $response->assertStatus(401);

});*/

test('user consegue renovar token com refresh', function () {
    $user = User::factory()->create([
        'password' => bcrypt('123456'),
    ]);


    $loginResponse = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => '123456',
    ]);

    $loginResponse->assertStatus(200)->assertJsonStructure([
        'access_token',
        'token_type',
        'refresh_token',
        'expire',
    ]);

    $oldToken = $loginResponse->json('access_token');


    $refreshResponse = $this->withHeaders([
        'Authorization' => 'Bearer ' . $oldToken,
    ])->postJson('/api/refresh-token');

    $refreshResponse->assertStatus(200)->assertJsonStructure([
        'access_token',
        'token_type',
        'expire',
    ]);

    $newToken = $refreshResponse->json('access_token');


    $meResponse = $this->withHeaders([
        'Authorization' => 'Bearer ' . $newToken,
    ])->get('/api/me');

    $meResponse->assertStatus(200)->assertJsonFragment([
        'email' => $user->email,
    ]);
});