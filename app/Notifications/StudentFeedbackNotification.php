<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentFeedbackNotification extends Notification
{
    use Queueable;

    protected $message;
    protected $type;

    public function __construct($message,$type = 'info')
    {
        $this->message = $message;
        $this->type = $type;
    }
    
    public function via(object $notifiable): array
    {
        return ['database'];
    }

 
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Lời nhắn từ Cố vấn học tập AI',
            'message' => $this->message,
            'type' => $this->type,
            'created_at' => now(),
        ];
    }
}
