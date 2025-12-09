<?php

namespace App\Observers;

use App\Models\User;
use App\Jobs\AnalyzeStudentRisk;
class UserObserver
{
    
    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user)
    {
        if($user->isDirty(['gpa', 'training_score', 'absences'])) {
            // Khi có thay đổi về GPA hoặc training_score, đẩy job phân tích rủi ro vào queue
            AnalyzeStudentRisk::dispatch($user);
        }
    }

   
}
