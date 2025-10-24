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
        'full_name','email','password',
        'two_factor_secret','two_factor_enabled',
        'last_login_at','last_login_ip','last_login_browser',
        'mobile_number','is_verified',
    ];

    protected $hidden = ['password','remember_token','two_factor_secret'];
    protected $casts = [
        'email_verified_at' => 'datetime',
        'two_factor_enabled' => 'boolean',
        'last_login_at' => 'datetime',
		'created_at'    => 'datetime',
		'updated_at'    => 'datetime',
    ];
	
	protected $appends = [
		'last_login_at_fmt',
		'created_at_fmt',
		'updated_at_fmt',
	];
	
	public function getLastLoginAtFmtAttribute(): ?string
	{
		return $this->last_login_at
			? $this->last_login_at->timezone(config('app.timezone'))->format('M j, Y g:i A')
			: null;
	}

	public function getCreatedAtFmtAttribute(): ?string
	{
		return $this->created_at
			? $this->created_at->timezone(config('app.timezone'))->format('M j, Y g:i A')
			: null;
	}

	public function getUpdatedAtFmtAttribute(): ?string
	{
		return $this->updated_at
			? $this->updated_at->timezone(config('app.timezone'))->format('M j, Y g:i A')
			: null;
	}
}
