<?php

namespace App\Mail;

use App\Models\User; // Import model User
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeamInvitation extends Mailable
{
    use Queueable, SerializesModels;

    // 1. Deklarasikan property $user di sini
    public User $user;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user)
    {
        // 2. Masukkan data user ke dalam property
        $this->user = $user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tactical Team Deployment - Access Granted',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invitation',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
        );
    }
}