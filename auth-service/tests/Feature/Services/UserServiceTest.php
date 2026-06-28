<?php

namespace Tests\Feature\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->userRepository = new UserRepository();
    $this->userService = new UserService($this->userRepository);
});

describe('UserService - create', function () {
    test('cria usuario com sucesso quando dados sao validos', function () {
       
        $data = [
            'name' => 'Taz',
            'email' => 'taz@email.com',
            'password' => 'senha123',
            'role' => 'CLIENT'
        ];
        
       
        $user = $this->userService->create($data);
        
       
        expect($user)->toBeInstanceOf(User::class);
        expect($user->name)->toBe('Taz');
        expect($user->email)->toBe('taz@email.com');
        expect($user->role)->toBe('CLIENT');
        expect($user->password)->not->toBe('senha123');
        expect($user->id)->not->toBeNull();
        
        
        $this->assertDatabaseHas('users', [
            'email' => 'taz@email.com',
            'name' => 'Taz',
            'role' => 'CLIENT'
        ]);
    });

    test('cria usuario com role ADMIN quando especificado', function () {
      
        $data = [
            'name' => 'Admin User',
            'email' => 'admin@email.com',
            'password' => 'senha123',
            'role' => 'ADMIN'
        ];
        
        
        $user = $this->userService->create($data);
        
      
        expect($user->role)->toBe('ADMIN');
        expect($user->isAdmin())->toBeTrue();
        $this->assertDatabaseHas('users', ['role' => 'ADMIN']);
    });

    test('lanca ValidationException quando email ja existe', function () {
        
        User::factory()->create(['email' => 'existente@email.com']);
        
        $data = [
            'name' => 'Novo Usuario',
            'email' => 'existente@email.com',
            'password' => 'senha123'
        ];
        
      
        try {
            $this->userService->create($data);
        } catch (ValidationException $e) {
            expect($e->errors())->toHaveKey('email');
            expect($e->errors()['email'][0])->toBe('Este email já está em uso.');
        }
        
      
        $this->assertDatabaseMissing('users', ['name' => 'Novo Usuario']);
    });

    test('lanca ValidationException quando nome ja existe', function () {
       
        User::factory()->create(['name' => 'Nome Existente']);
        
        $data = [
            'name' => 'Nome Existente',
            'email' => 'novo@email.com',
            'password' => 'senha123'
        ];
        
        
        try {
            $this->userService->create($data);
        } catch (ValidationException $e) {
            expect($e->errors())->toHaveKey('name');
            expect($e->errors()['name'][0])->toBe('Este nome já está sendo usado.');
        }
        
        $this->assertDatabaseMissing('users', ['email' => 'novo@email.com']);
    });

    test('valida que a senha foi hasheada corretamente', function () {
     
        $data = [
            'name' => 'Teste Hash',
            'email' => 'hash@email.com',
            'password' => 'minhasenha123'
        ];
        
      
        $user = $this->userService->create($data);
        
    
       expect($user->password)->not->toBe('minhasenha123');
        expect(password_verify('minhasenha123', $user->password))->toBeTrue();
    });
});

describe('UserService - getAllClients', function () {
    test('retorna todos os clientes', function () {
  
        User::factory()->count(3)->create(['role' => 'CLIENT']);
        User::factory()->count(2)->create(['role' => 'ADMIN']);
        
     
        $clientes = $this->userService->getAllClients();
        
      foreach ($clientes as $client) {
            expect($client->role)->toBe('CLIENT');
        }
        expect($clientes)->toHaveCount(3);
        
    });

    test('retorna colecao vazia quando nao ha clientes', function () {
        
        User::factory()->count(3)->create(['role' => 'ADMIN']);
        
       
        $clientes = $this->userService->getAllClients();
        
     
        expect($clientes)->toBeEmpty();
        expect($clientes)->toHaveCount(0);
    });

    test('retorna apenas clientes mesmo com outros roles', function () {
      
        User::factory()->create(['role' => 'CLIENT']);
        User::factory()->create(['role' => 'ADMIN']);
        User::factory()->create(['role' => 'ADMIN']);
        
        
        $clientes = $this->userService->getAllClients();
        
   
        expect($clientes)->toHaveCount(1);
        expect($clientes->first()->role)->toBe('CLIENT');
        
   
        $roles = $clientes->pluck('role')->toArray();
        expect($roles)->toContain('CLIENT');
        expect($roles)->not->toContain('ADMIN');
    });
});

describe('UserService - update', function () {

test('lanca ValidationException quando dados estao vazios (array vazio)', function () {
        // Arrange
        $user = User::factory()->create([
            'name' => 'Nome Original',
            'email' => 'original@email.com'
        ]);
        
        $data = [];
        
        // Act & Assert
        try {
            $this->userService->update($data, $user);
        } catch (ValidationException $e) {
            expect($e->errors())->toHaveKey('data');
            expect($e->errors()['data'][0])->toBe('Nada para atualizar.');
        }
        
        // Verifica que o usuário NÃO foi alterado
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nome Original',
            'email' => 'original@email.com'
        ]);
    });

    test('lanca ValidationException quando dados estao vazios (null)', function () {
        // Arrange
        $user = User::factory()->create();
        $data = null;
        
        // Act & Assert - se o tipo permitir null
        expect(fn() => $this->userService->update([], $user))
            ->toThrow(ValidationException::class, 'Nada para atualizar.');
    });
    test('atualiza usuario com sucesso', function () {
       
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
        
    
        $updatedUser = $this->userService->update($data, $user);
        
     
        expect($updatedUser->name)->toBe('Nome Novo');
        expect($updatedUser->email)->toBe('novo@email.com');
        expect($updatedUser->role)->toBe('ADMIN');
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nome Novo',
            'email' => 'novo@email.com',
            'role' => 'ADMIN'
        ]);
        
        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
            'name' => 'Nome Antigo'
        ]);
    });


    test('lanca ValidationException quando tenta atualizar para email que ja existe', function () {
       
        $user1 = User::factory()->create(['email' => 'usuario1@email.com']);
        $user2 = User::factory()->create(['email' => 'usuario2@email.com']);
        
        $data = ['email' => 'usuario2@email.com'];
        
      
        try {
            $this->userService->update($data, $user1);
        } catch (ValidationException $e) {
            expect($e->errors())->toHaveKey('email');
            expect($e->errors()['email'][0])->toBe('Este email já está em uso.');
        }
        
       
        $this->assertDatabaseHas('users', [
            'id' => $user1->id,
            'email' => 'usuario1@email.com'
        ]);
    });

    test('lanca ValidationException quando tenta atualizar para nome que ja existe', function () {
        
        $user1 = User::factory()->create(['name' => 'Usuario Um']);
        $user2 = User::factory()->create(['name' => 'Usuario Dois']);
        
        $data = [
            'name' => 'Usuario Dois',
            'email' => $user1->email,
        ];
        
        
        try {
            $this->userService->update($data, $user1);
        } catch (ValidationException $e) {
            expect($e->errors())->toHaveKey('name');
            expect($e->errors()['name'][0])->toBe('Este nome já está sendo usado.');
        }
        
        $this->assertDatabaseHas('users', [
            'id' => $user1->id,
            'name' => 'Usuario Um'
        ]);
    });

    test('permite atualizar com o proprio email (nao deve lancar excecao)', function () {
       
        $user = User::factory()->create([
            'name' => 'Teste',
            'email' => 'teste@email.com'
        ]);
        
        $data = [
            'email' => 'teste@email.com',
            'name' => 'Nome Novo'
        ];
        
        
        $updatedUser = $this->userService->update($data, $user);
        
       
        expect($updatedUser->name)->toBe('Nome Novo');
        expect($updatedUser->email)->toBe('teste@email.com');
    });

    test('permite atualizar com o proprio nome (nao deve lancar excecao)', function () {
       
        $user = User::factory()->create([
            'name' => 'Teste',
            'email' => 'teste@email.com'
        ]);
        
        $data = [
            'name' => 'Teste', 
            'email' => 'novo@email.com'
        ];
        
      
        $updatedUser = $this->userService->update($data, $user);
        
        
        expect($updatedUser->email)->toBe('novo@email.com');
        expect($updatedUser->name)->toBe('Teste');
    });

    test('atualiza usuario com dados completos incluindo senha', function () {
     
        $user = User::factory()->create([
            'name' => 'Antigo',
            'email' => 'antigo@email.com',
            'role' => 'CLIENT'
        ]);
        
        $data = [
            'name' => 'Novo Nome',
            'email' => 'novo@email.com',
            'role' => 'ADMIN',
            'password' => 'novaSenha123'
        ];
        
       
        $updatedUser = $this->userService->update($data, $user);
        
     
        expect($updatedUser->name)->toBe('Novo Nome');
        expect($updatedUser->email)->toBe('novo@email.com');
        expect($updatedUser->role)->toBe('ADMIN');
        
       
        $freshUser = User::find($user->id);
        expect($freshUser->password)->not->toBe('novaSenha123');
        expect(password_verify('novaSenha123', $freshUser->password))->toBeTrue();
    });

});


describe('UserService - Testes de validacao e excecoes', function () {
    test('create com dados incompletos lanca excecao (depende do banco)', function () {
      
        $data = [
            'name' => 'Teste'
            
        ];
        
    
        expect(fn() => $this->userService->create($data))
            ->toThrow(\Exception::class);
    });

    /*test('update com dados vazios nao altera usuario', function () {

        $user = User::factory()->create([
            'name' => 'Nome Original',
            'email' => 'original@email.com'
        ]);
        
        $data = [];
        
        $updatedUser = $this->userService->update($data, $user);
        dd($updatedUser);
        
        expect($updatedUser->name)->toBe('Nome Original');
        expect($updatedUser->email)->toBe('original@email.com');
        expect($updatedUser->id)->toBe($user->id);
    });*/
});
