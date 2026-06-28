<?php

namespace Tests\Feature\Repositories;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

beforeEach(function () {
    $this->repository = new UserRepository();
});

describe('UserRepository - getAllUsers', function () {
    test('retorna todos os usuarios cadastrados', function () {
    
        User::factory()->count(3)->create();
        
       
        $users = $this->repository->getAllUsers();
        
        expect($users)->toHaveCount(3);
        expect($users)->toBeInstanceOf(EloquentCollection::class);
        expect($users->first())->toBeInstanceOf(User::class);
    });

    test('retorna colecao vazia quando nao ha usuarios', function () {
       
        $users = $this->repository->getAllUsers();
        
        expect($users)->toBeEmpty();
        expect($users)->toHaveCount(0);
        expect($users)->toBeInstanceOf(EloquentCollection::class);
    });

});

describe('UserRepository - getUserById', function () {
    test('retorna usuario quando ID existe', function () {
        
        $user = User::factory()->create([
            'name' => 'Taz',
            'email' => 'taz@email.com'
        ]);
        
        
        $foundUser = $this->repository->getUserById($user->id);
        
       
        expect($foundUser)->toBeInstanceOf(User::class);
        expect($foundUser->id)->toBe($user->id);
        expect($foundUser->name)->toBe('Taz');
        expect($foundUser->email)->toBe('taz@email.com');
    });

    test('lanca ModelNotFoundException quando ID nao existe', function () {
        

        expect(fn() => $this->repository->getUserById(99999))
            ->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    });

    test('lanca ModelNotFoundException quando ID e invalido', function () {
        
        expect(fn() => $this->repository->getUserById(-1))
            ->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    });

    test('retorna usuario correto quando multiplos usuarios existem', function () {
        
        $user1 = User::factory()->create(['name' => 'Primeiro']);
        $user2 = User::factory()->create(['name' => 'Segundo']);
        $user3 = User::factory()->create(['name' => 'Terceiro']);
        
      
        $foundUser = $this->repository->getUserById($user2->id);
        
       
        expect($foundUser->id)->toBe($user2->id);
        expect($foundUser->name)->toBe('Segundo');
        expect($foundUser->id)->not->toBe($user1->id);
        expect($foundUser->id)->not->toBe($user3->id);
    });
});

describe('UserRepository - getUserByEmail', function () {
    test('retorna usuario quando email existe', function () {
      
        $user = User::factory()->create(['email' => 'teste@exemplo.com']);
        
     
        $foundUser = $this->repository->getUserByEmail('teste@exemplo.com');
        
        
        expect($foundUser)->toBeInstanceOf(User::class);
        expect($foundUser->email)->toBe('teste@exemplo.com');
    });

    test('retorna null quando email nao existe', function () {
        
        $foundUser = $this->repository->getUserByEmail('naoexiste@email.com');
        
        
        expect($foundUser)->toBeNull();
    });

});

describe('UserRepository - getUserByName', function () {
    test('retorna usuario quando nome existe', function () {
        
        User::factory()->create(['name' => 'Taz']);
        
        
        $foundUser = $this->repository->getUserByName('Taz');
        
        
        expect($foundUser)->toBeInstanceOf(User::class);
        expect($foundUser->name)->toBe('Taz');
    });

    test('retorna null quando nome nao existe', function () {
       
        $foundUser = $this->repository->getUserByName('Nome Inexistente');
        
        
        expect($foundUser)->toBeNull();
    });

    test('retorna primeiro usuario quando nomes duplicados existem', function () {
       
        User::factory()->create([
            'name' => 'Carlos Souza',
            'email' => 'carlos1@email.com'
        ]);
        User::factory()->create([
            'name' => 'Carlos Souza',
            'email' => 'carlos2@email.com'
        ]);
        
       
        $foundUser = $this->repository->getUserByName('Carlos Souza');
        
        
        expect($foundUser)->toBeInstanceOf(User::class);
        expect($foundUser->email)->toBe('carlos1@email.com');
    });

});

describe('UserRepository - getAllAdmins', function () {
    test('retorna todos os usuarios com role ADMIN', function () {
        
        User::factory()->count(2)->create(['role' => 'ADMIN']);
        User::factory()->count(3)->create(['role' => 'CLIENT']);
        
        
        $admins = $this->repository->getAllAdmins();
        
        foreach ($admins as $admin) {
            expect($admin->role)->toBe('ADMIN');
        }

        expect($admins)->toHaveCount(2);
        expect($admins)->each->toBeInstanceOf(User::class);
        expect($admins)->not->toContain('CLIENT');
    });

    test('retorna colecao vazia quando nao ha admins', function () {
        
        User::factory()->count(3)->create(['role' => 'CLIENT']);
       
        $admins = $this->repository->getAllAdmins();
        
        expect($admins)->toBeEmpty();
        expect($admins)->toHaveCount(0);
        expect($admins)->toBeInstanceOf(EloquentCollection::class);
    });

    test('retorna apenas admins mesmo com outros roles', function () {
        
        User::factory()->create(['role' => 'ADMIN']);
        User::factory()->create(['role' => 'CLIENT']);
        User::factory()->create(['role' => 'CLIENT']);
        
       
        $admins = $this->repository->getAllAdmins();
        
       
        expect($admins)->toHaveCount(1);
        expect($admins->first()->role)->toBe('ADMIN');
    });
});

describe('UserRepository - getAllClients', function () {
    test('retorna todos os usuarios com role CLIENT', function () {
        
        User::factory()->count(3)->create(['role' => 'CLIENT']);
        User::factory()->count(2)->create(['role' => 'ADMIN']);
        
       
        $clients = $this->repository->getAllClients();
        
        foreach ($clients as $client) {
            expect($client->role)->toBe('CLIENT');
        }
        expect($clients)->toHaveCount(3);
        expect($clients)->each->toBeInstanceOf(User::class);
        expect($clients)->not->toContain('ADMIN');
    });

    test('retorna colecao vazia quando nao ha clientes', function () {
        
        User::factory()->count(3)->create(['role' => 'ADMIN']);
        
       
        $clients = $this->repository->getAllClients();
        
        // Assert
        expect($clients)->toBeEmpty();
        expect($clients)->toHaveCount(0);
    });

    test('retorna apenas clientes mesmo com outros roles', function () {
        
        User::factory()->create(['role' => 'CLIENT']);
        User::factory()->create(['role' => 'ADMIN']);
        User::factory()->create(['role' => 'ADMIN']);
        
        
        $clients = $this->repository->getAllClients();
        
        
        expect($clients)->toHaveCount(1);
        expect($clients->first()->role)->toBe('CLIENT');
    });
});

describe('UserRepository - Testes integrados com dados reais', function () {
    test('getAllUsers retorna usuarios com todos os campos preenchidos', function () {
        // Arrange
        $user = User::factory()->create([
            'name' => 'Teste Completo',
            'email' => 'completo@teste.com',
            'role' => 'ADMIN'
        ]);
        
        // Act
        $users = $this->repository->getAllUsers();
        
        // Assert
        expect($users->first()->name)->toBe('Teste Completo');
        expect($users->first()->email)->toBe('completo@teste.com');
        expect($users->first()->role)->toBe('ADMIN');
        expect($users->first()->password)->not->toBeNull(); // Verifica se foi hasheado
        expect($users->first()->password)->not->toBe('password123'); // Não está em texto puro
    });

    test('getUserById retorna usuario com role correta', function () {
        // Arrange
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $client = User::factory()->create(['role' => 'CLIENT']);
        
        // Act
        $foundAdmin = $this->repository->getUserById($admin->id);
        $foundClient = $this->repository->getUserById($client->id);
        
        // Assert
        expect($foundAdmin->role)->toBe('ADMIN');
        expect($foundClient->role)->toBe('CLIENT');
        expect($foundAdmin->isAdmin())->toBeTrue();
        expect($foundClient->isAdmin())->toBeFalse();
    });
});