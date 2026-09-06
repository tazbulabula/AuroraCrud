<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Executar migrations
$kernel->call('migrate', ['--force' => true]);
echo "✅ Migrations executadas!\n";

// Executar seed (opcional)
$kernel->call('db:seed', ['--force' => true]);
echo "✅ Seed executado!\n";

echo "🚀 Deploy concluído!\n";