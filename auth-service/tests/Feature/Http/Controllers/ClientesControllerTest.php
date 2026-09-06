<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\WithFaker;
use phpDocumentor\Reflection\Types\This;

uses(WithFaker::class);

beforeEach(function () {
    // Garante que não há usuários residuais
    User::query()->delete();


    $this->user = User::factory()->create([
        'name'=>'Taz',
        'email'=>'taz@gmail.com',
        'password'=>'123456',
        'role' => 'ADMIN'
    ]);

    $response = $this->post('/api/login', [
        'email'=>$this->user->email,
        'password'=> '123456'
    ]);

    $this->token = $response->json('access_token');

});

describe('ClientesController - register', function () {
    test('registra cliente com sucesso com dados completos', function () {
        // Arrange
        $data = [
            'name' => 'João Silva',
            'email' => 'joao@email.com',
            'password' => 'senha123456',
            'role' => 'CLIENT'
        ];
        
        // Act
        $response = $this->withHeaders(['Authorization'=>'Bearer '.$this->token])->postJson('/api/clientes/register', $data);
        
        // Assert
        $response->assertStatus(201)
            ->assertJson([
                'name' => 'João Silva',
                'email' => 'joao@email.com',
                'role' => 'CLIENT'
            ])
            ->assertJsonMissing(['password']);
        
        $this->assertDatabaseHas('users', [
            'email' => 'joao@email.com',
            'name' => 'João Silva',
            'role' => 'CLIENT'
        ]);
        
        // Verifica se a senha foi hasheada
        $user = User::where('email', 'joao@email.com')->first();
        expect(password_verify('senha123456', $user->password))->toBeTrue();
    });

    test('registra cliente com role padrao CLIENT quando nao informada', function () {
        
        $data = [
            'name' => 'Maria Santos',
            'email' => 'maria@email.com',
            'password' => 'senha123456'
        ];
        
       
        $response = $this->postJson('/api/clientes/register', $data);
       
        
        $response->assertStatus(201)
            ->assertJson([
                'name' => 'Maria Santos',
                'email' => 'maria@email.com',
                'role' => 'CLIENT'
            ]);
        
        $this->assertDatabaseHas('users', [
            'email' => 'maria@email.com',
            'role' => 'CLIENT'
        ]);
    });

    test('registra ADMIN com sucesso', function () {
       
        $data = [
            'name' => 'Admin User',
            'email' => 'admin@email.com',
            'password' => 'senha123456',
            'role' => 'ADMIN'
        ];
        
       
        $response = $this->postJson('/api/clientes/register', $data);
        
        
        $response->assertStatus(201)
            ->assertJson([
                'name' => 'Admin User',
                'email' => 'admin@email.com',
                'role' => 'ADMIN'
            ]);
        
        $this->assertDatabaseHas('users', [
            'email' => 'admin@email.com',
            'role' => 'ADMIN'
        ]);
    });

    test('retorna erro 422 quando email ja existe', function () {
       
        User::factory()->create(['email' => 'existente@email.com']);
        
        $data = [
            'name' => 'Novo Usuario',
            'email' => 'existente@email.com',
            'password' => 'senha123456'
        ];
        
        
        $response = $this->post('/api/clientes/register', $data);
        
       
        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed'
            ]);
    });

    test('retorna erro 422 quando nome esta faltando', function () {
      
        $data = [
            'email' => 'teste@email.com',
            'password' => 'senha123456'
        ];
        
        
        $response = $this->postJson('/api/clientes/register', $data);
        

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed'
            ]);
    });

    test('retorna erro 422 quando email esta faltando', function () {
        
        $data = [
            'name' => 'Teste',
            'password' => 'senha123456'
        ];
        
       
        $response = $this->postJson('/api/clientes/register', $data);
        
        
        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed'
            ]);
    });

    test('retorna erro 422 quando password esta faltando', function () {
        
        $data = [
            'name' => 'Teste',
            'email' => 'teste@email.com'
        ];
        
        
        $response = $this->postJson('/api/clientes/register', $data);
        
        
        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed',

            ]);
    });

    test('retorna erro 422 quando email e invalido', function () {
       
        $data = [
            'name' => 'Teste',
            'email' => 'email-invalido',
            'password' => 'senha123456'
        ];
        
    
        $response = $this->postJson('/api/clientes/register', $data);
        
        
        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed',

            ]);
    });

    test('retorna erro 422 quando senha e muito curta (menos de 8 caracteres)', function () {
        // Arrange
        $data = [
            'name' => 'Teste',
            'email' => 'teste@email.com',
            'password' => '1234567'
        ];
        
        // Act
        $response = $this->postJson('/api/clientes/register', $data);
        
        // Assert
        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed',

            ]);
    });

    test('retorna erro 422 quando role e invalida', function () {
        // Arrange
        $data = [
            'name' => 'Teste',
            'email' => 'teste@email.com',
            'password' => 'senha123456',
            'role' => 'INVALID_ROLE'
        ];
        
        // Act
        $response = $this->postJson('/api/clientes/register', $data);
        
        // Assert
        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed',

            ]);
    });

    test('retorna erro 400 quando ocorre excecao generica', function () {
        // Arrange - Mock do UserService para lançar exceção
        $mockService = mock(UserService::class);
        $mockService->shouldReceive('create')
            ->andThrow(new \Exception('Erro genérico'));
        
        app()->instance(UserService::class, $mockService);
        
        $data = [
            'name' => 'Teste',
            'email' => 'teste@email.com',
            'password' => 'senha123456'
        ];
        
        // Act
        $response = $this->postJson('/api/clientes/register', $data);
        
        // Assert
        $response->assertStatus(400)
            ->assertJson([
                'error' => 'Erro genérico'
            ]);
    });
});

describe('ClientesController - listClients', function () {
    test('lista todos os clientes com sucesso', function () {
        // Arrange
        User::factory()->count(3)->create(['role' => 'CLIENT']);
        User::factory()->count(2)->create(['role' => 'ADMIN']);
        
        // Act
        $response = $this->getJson('/api/clientes');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonCount(3);
    });

    test('retorna lista vazia quando nao ha clientes', function () {
        // Arrange
        User::factory()->count(2)->create(['role' => 'ADMIN']);
        
        // Act
        $response = $this->getJson('/api/clientes');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonCount(0)
            ->assertJson([]);
    });

    test('retorna apenas clientes (nao retorna admins)', function () {
        // Arrange
        User::factory()->create([
            'name' => 'Cliente 1',
            'email' => 'cliente1@email.com',
            'role' => 'CLIENT'
        ]);
        User::factory()->create([
            'name' => 'Admin 1',
            'email' => 'admin1@email.com',
            'role' => 'ADMIN'
        ]);
        User::factory()->create([
            'name' => 'Cliente 2',
            'email' => 'cliente2@email.com',
            'role' => 'CLIENT'
        ]);
        
        // Act
        $response = $this->getJson('/api/clientes');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['name' => 'Cliente 1'])
            ->assertJsonFragment(['name' => 'Cliente 2'])
            ->assertJsonMissing(['name' => 'Admin 1']);
    });

    test('retorna dados completos do cliente (sem senha)', function () {
        // Arrange
        User::factory()->create([
            'name' => 'Teste',
            'email' => 'teste@email.com',
            'role' => 'CLIENT'
        ]);
        
        // Act
        $response = $this->getJson('/api/clientes');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'name', 'email', 'role', 'created_at', 'updated_at']
            ])
            ->assertJsonMissing(['password']);
    });
});

describe('ClientesController - update', function () {
    test('atualiza cliente com sucesso', function () {
       
        $user = User::factory()->create([
            'name' => 'Nome Antigo',
            'email' => 'antigo@email.com',
            'role' => 'CLIENT'
        ]);
        
        $data = [
            'name' => 'Nome Novo',
            'email' => 'novo@email.com',
            'role' => 'ADMIN'
        ];
        
      
        $response = $this->putJson("/api/clientes/{$user->id}", $data);
        
     
        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => 'Nome Novo',
                'email' => 'novo@email.com',
                'role' => 'ADMIN'
            ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nome Novo',
            'email' => 'novo@email.com',
            'role' => 'ADMIN'
        ]);
    });

    test('atualiza apenas o nome do cliente', function () {
        
        $user = User::factory()->create([
            'name' => 'Nome Antigo',
            'email' => 'email@teste.com',
            'role' => 'CLIENT'
        ]);
        
        $data = ['name' => 'Nome Atualizado'];
        
        
        $response = $this->putJson("/api/clientes/{$user->id}", $data);
       
        
        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => 'Nome Atualizado',
                'email' => 'email@teste.com',
                'role' => 'CLIENT'
            ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nome Atualizado',
            'email' => 'email@teste.com'
        ]);
    });

    test('atualiza apenas o email do cliente', function () {
       
        $user = User::factory()->create([
            'name' => 'Teste',
            'email' => 'antigo@email.com'
        ]);
        
        $data = ['email' => 'novo@email.com'];
        
        
        $response = $this->putJson("/api/clientes/{$user->id}", $data);
        
       
        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => 'Teste',
                'email' => 'novo@email.com'
            ]);
    });

    test('atualiza apenas a role do cliente', function () {
        
        $user = User::factory()->create(['role' => 'CLIENT']);
        
        $data = ['role' => 'ADMIN'];
        
        
        $response = $this->putJson("/api/clientes/{$user->id}", $data);
        
        
        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'role' => 'ADMIN'
            ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => 'ADMIN'
        ]);
    });

    test('atualiza senha do cliente', function () {
       
        $user = User::factory()->create([
            'password' => bcrypt('senhaantiga123')
        ]);
        
        $data = ['password' => 'novasenha123456'];
        
       
        $response = $this->putJson("/api/clientes/{$user->id}", $data);
        
       
        $response->assertStatus(200);
        
        
        $freshUser = User::find($user->id);
        expect(password_verify('novasenha123456', $freshUser->password))->toBeTrue();
        expect(password_verify('senhaantiga123', $freshUser->password))->toBeFalse();
    });

    test('nao permite atualizar para email que ja existe em outro usuario', function () {
        
        $user1 = User::factory()->create(['email' => 'user1@email.com']);
        $user2 = User::factory()->create(['email' => 'user2@email.com']);
        
        $data = ['email' => 'user2@email.com'];
        
     
        $response = $this->putJson("/api/clientes/{$user1->id}", $data);
  
        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed'
            ]);
        
        
        $this->assertDatabaseHas('users', [
            'id' => $user1->id,
            'email' => 'user1@email.com'
        ]);
    });

    test('permite atualizar com o proprio email', function () {
       
        $user = User::factory()->create([
            'name' => 'Teste',
            'email' => 'teste@email.com'
        ]);
        
        $data = [
            'email' => 'teste@email.com',
            'name' => 'Nome Novo'
        ];
        
       
        $response = $this->putJson("/api/clientes/{$user->id}", $data);
        
        
        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => 'Nome Novo',
                'email' => 'teste@email.com'
            ]);
    });

    test('retorna erro 422 quando role e invalida', function () {
        
        $user = User::factory()->create();
        
        $data = ['role' => 'INVALID_ROLE'];
        
        
        $response = $this->putJson("/api/clientes/{$user->id}", $data);
        
       
        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed'
            ]);
    });

    test('retorna erro 404 ao tentar atualizar usuario inexistente', function () {
       
        $data = ['name' => 'Novo Nome'];
        
        
        $response = $this->putJson('/api/clientes/99999', $data);
        
        
        $response->assertStatus(404);
    });

});

describe('ClientesController - delete', function () {
    test('elimina cliente com sucesso', function () {
        
        $user = User::factory()->create();
        
        // Act
        $response = $this->deleteJson("/api/clientes/{$user->id}");
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => 'User deleted successfully'
            ]);
        
        $this->assertDatabaseMissing('users', [
            'id' => $user->id
        ]);
    });

    test('retorna erro 404 ao tentar eliminar usuario inexistente', function () {
        // Act
        $response = $this->deleteJson('/api/clientes/99999');
        
        // Assert
        $response->assertStatus(404);
    });

    test('elimina cliente e verifica que nao retorna dados do usuario', function () {
        
        $user = User::factory()->create();
        $userId = $user->id;
        
        
        $response = $this->deleteJson("/api/clientes/{$userId}");
        
       
        $response->assertStatus(200)
            ->assertJson([
                'success' => 'User deleted successfully'
            ])
            ->assertJsonMissing(['id' => $userId])
            ->assertJsonMissing(['name' => $user->name]);
        
        // Ou se não usar SoftDeletes:
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    });
});

describe('ClientesController - Testes de integracao completos', function () {
    test('fluxo completo: register -> list -> update -> delete', function () {
        
        $registerData = [
            'name' => 'Usuario Teste',
            'email' => 'teste@email.com',
            'password' => 'senha123456',
            'role' => 'CLIENT'
        ];
        
        $registerResponse = $this->postJson('/api/clientes/register', $registerData);
        $registerResponse->assertStatus(201);
        
        $userId = $registerResponse->json('id');
        
        
        $listResponse = $this->getJson('/api/clientes');
        $listResponse->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['email' => 'teste@email.com']);
        
       
        $updateData = [
            'name' => 'Usuario Atualizado',
            'email' => 'atualizado@email.com'
        ];
        
        $updateResponse = $this->putJson("/api/clientes/{$userId}", $updateData);
        $updateResponse->assertStatus(200)
            ->assertJson([
                'id' => $userId,
                'name' => 'Usuario Atualizado',
                'email' => 'atualizado@email.com'
            ]);
        
       
        $deleteResponse = $this->deleteJson("/api/clientes/{$userId}");
        $deleteResponse->assertStatus(200)
            ->assertJson(['success' => 'User deleted successfully']);
        
        
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    });

    test('cria multiplos usuarios e lista corretamente', function () {
        
        $users = User::factory()->count(5)->create(['role' => 'CLIENT']);
        User::factory()->count(3)->create(['role' => 'ADMIN']);
      
        $response = $this->getJson('/api/clientes');
        
        
        $response->assertStatus(200)
            ->assertJsonCount(5);
    });
});

describe('ClientesController - Validacao de roles', function () {
    test('role ADMIN e permitida', function () {
        // Arrange
        $data = [
            'name' => 'Admin User',
            'email' => 'admin@email.com',
            'password' => 'senha123456',
            'role' => 'ADMIN'
        ];
        
        // Act
        $response = $this->postJson('/api/clientes/register', $data);
        
        // Assert
        $response->assertStatus(201)
            ->assertJson(['role' => 'ADMIN']);
    });

    test('role CLIENT e permitida', function () {
        // Arrange
        $data = [
            'name' => 'Client User',
            'email' => 'client@email.com',
            'password' => 'senha123456',
            'role' => 'CLIENT'
        ];
        
        // Act
        $response = $this->postJson('/api/clientes/register', $data);
        
        // Assert
        $response->assertStatus(201)
            ->assertJson(['role' => 'CLIENT']);
    });

    test('role em letras minusculas nao e permitida', function () {
        // Arrange
        $data = [
            'name' => 'Teste',
            'email' => 'teste@email.com',
            'password' => 'senha123456',
            'role' => 'admin'
        ];
        
        // Act
        $response = $this->postJson('/api/clientes/register', $data);
        
        // Assert
        $response->assertStatus(422)
            ->assertJson(['error' => 'Validation failed',
            ]);
    });
});

describe('ClientesController - Testes de resposta JSON', function () {
    test('respostas de erro tem formato consistente', function () {
       
        $data = ['email' => 'invalid'];
        
      
        $response = $this->postJson('/api/clientes/register', $data);
        
      
        $response->assertStatus(422)
            ->assertJsonStructure([
                'error',
                0 => [
                    'email'
                ]
            ]);
    });

    test('resposta de sucesso nao inclui senha', function () {
        
        $data = [
            'name' => 'Teste',
            'email' => 'teste@email.com',
            'password' => 'senha123456'
        ];
        
        
        $response = $this->postJson('/api/clientes/register', $data);
        
        
        $response->assertStatus(201)
            ->assertJsonMissing(['password']);
    });
});