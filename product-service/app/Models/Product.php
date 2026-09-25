<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


#[Fillable(['name', 'description', 'price', 'stock', 'user_id'])]
class Product extends Model
{
    use HasFactory;

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
