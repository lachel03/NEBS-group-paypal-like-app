<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // ✅ changed from 'name' to 'full_name'
            'full_name' => $this->faker->name(),

            'email' => $this->faker->unique()->safeEmail(),

            // ✅ added mobile_number field for your new schema
            'mobile_number' => $this->faker->unique()->numerify('09#########'),

            'email_verified_at' => now(),

            // ✅ keep same password handling
            'password' => static::$password ??= Hash::make('password'),

            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
