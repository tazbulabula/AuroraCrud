<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       
        DB::table('users')->updateOrInsert([
            'name' => 'Taz',
            'email' => 'taz@gmail.com',
            'password' => Hash::make('1234567890'),
            'role' => 'ADMIN',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
