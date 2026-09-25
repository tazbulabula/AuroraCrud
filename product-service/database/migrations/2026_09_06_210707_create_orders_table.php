<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('user_id')->constrained('users'); // Vendedor
            
            // ✅ Dados do comprador (guest)
            $table->string('buyer_name');
            $table->string('buyer_phone');
            $table->string('buyer_address');
            $table->string('buyer_email')->nullable();
            $table->text('buyer_notes')->nullable();
            
            // ✅ Identificação do guest
            $table->string('guest_id')->nullable();
            $table->boolean('is_guest')->default(true);
            
            // ✅ Código de rastreio
            $table->string('tracking_code')->unique();
            
            $table->integer('quantity')->default(1);
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'delivered', 'cancelled'])->default('pending');
            $table->boolean('viewed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
