<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Collection;

class UserRepository
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getAllUsers(): Collection
    {
        return User::all();
    }

    public function getUserById(int $id): User
    {
        return User::findOrFail($id);
    }

    public function getUserByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function getUserByName(string $name): ?User
    {
        return User::where('name', $name)->first();
    }

    public function getAllAdmins(): Collection
    {
        return User::where('role', 'ADMIN')->get();
    }

    public function getAllClients(): Collection
    {
        return User::where('role', 'CLIENT')->get();
    }
}
