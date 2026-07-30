<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TrainingPageController extends Controller
{
    public function index()
    {
        return Inertia::render('Training/TrainingPage');
    }
}
