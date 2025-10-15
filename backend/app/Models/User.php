<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;   // ✅ add Sanctum trait

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name','email','password',
        'two_factor_secret','two_factor_enabled',
        'last_login_at','last_login_ip',
        'mobile_number','is_verified',
    ];

    protected $hidden = ['password','remember_token','two_factor_secret'];
    protected $casts = [
        'email_verified_at' => 'datetime',
        'two_factor_enabled' => 'boolean',
        'last_login_at' => 'datetime',
    ];
}
