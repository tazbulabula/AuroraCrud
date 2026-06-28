<?php

test('pode se criar um user do tipo admin', function () {
    $user = \App\Models\User::factory()->create(['role' => 'ADMIN']);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'role' => 'ADMIN',
    ]);

    expect($user->role)->toBe('ADMIN');
});

test('pode se criar um user do tipo client', function () {
    $user = \App\Models\User::factory()->create(['role' => 'CLIENT']);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'role' => 'CLIENT',
    ]);

    expect($user->role)->toBe('CLIENT');
});

test('password vem hashado', function () {
    $user = \App\Models\User::factory()->create(['password' => '123']);

    expect($user->password)->not()->toBe('123');

    expect(Hash::check('123', $user->password))->toBeTrue();
});

test('criar dois users com o mesmo email não é permitido', function () {
    $user1 = \App\Models\User::factory()->create(['email' => 'test@example.com']);

    $this->expectException(\Illuminate\Database\QueryException::class);

    \App\Models\User::factory()->create(['email' => 'test@example.com']);
});