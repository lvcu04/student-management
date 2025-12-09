<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('predict:student-risk')
    ->dailyAt('01:00')
    ->withoutOverlapping();

Schedule::command('send:weekly-feedback')
    ->weeklyOn(1, '07:00') // 1 = Thứ Hai
    ->withoutOverlapping();