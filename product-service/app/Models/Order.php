<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'buyer_name',
        'buyer_phone',
        'buyer_address',
        'buyer_email',
        'buyer_notes',
        'guest_id',
        'is_guest',
        'tracking_code',
        'quantity',
        'total_price',
        'status',
        'viewed',
    ];

    protected $casts = [
        'viewed' => 'boolean',
        'is_guest' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->tracking_code)) {
                $order->tracking_code = 'AURO-' . strtoupper(Str::random(8));
            }
        });
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}