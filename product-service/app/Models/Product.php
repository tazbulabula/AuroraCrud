<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'description', 'price', 'stock', 'user_id', 'image_path'])]
class Product extends Model
{
    use HasFactory;

    protected $appends = ['image_url'];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path
            ? route('products.image', ['id' => $this->getKey()])
            : null;
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
