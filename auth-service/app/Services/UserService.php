<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Exception;
use Illuminate\Validation\ValidationException;

class UserService
{
    /**
     * Create a new class instance.
     */
    public function __construct(private UserRepository $userRepo)
    {
        //
    }

    public function create(array $data): User
    {
        if ($this->userRepo->getUserByEmail($data['email'])) {
            throw ValidationException::withMessages([
                'email' => 'Este email já está em uso.'
            ]);
        }
        
        if ($this->userRepo->getUserByName($data['name'])) {
            throw ValidationException::withMessages([
                'name' => 'Este nome já está sendo usado.'
            ]);
        }
     
        return User::create($data);
    }

    public function getAllClients()
    {
        return $this->userRepo->getAllClients();
    }

    public function update(array $data, User $user): User
    {
        if(empty($data)){
            throw ValidationException::withMessages([
                'data' => 'Nada para atualizar.'
            ]);
        }

        if (isset($data['email'])){
            if($this->userRepo->getUserByEmail($data['email']) && 
            $this->userRepo->getUserByEmail($data['email'])->id !== $user->id) {
            throw ValidationException::withMessages([
                'email' => 'Este email já está em uso.'
            ]);
            }

        }

        if(isset($data['name'])){

            if ($this->userRepo->getUserByName($data['name']) && 
                $this->userRepo->getUserByName($data['name'])->id !== $user->id) {
                throw ValidationException::withMessages([
                    'name' => 'Este nome já está sendo usado.'
                ]);
            }
        }

        $user->update($data);
        return $user;
    }
}
