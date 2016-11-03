<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Traits\CaptchaTrait;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Validator;
use Storage;
use File;
use Session;
use Mail;
use Carbon\Carbon;

use App\Share;

class PageController extends Controller
{

    public function home()
    {
        return view('page.home');
    }

    public function about()
    {
        return view('page.about');
    }

    public function reference()
    {
        return view('page.reference');
    }

    public function contact()
    {
        return view('page.contact');
    }

    public function share($hash)
    {
        $share = Share::withTrashed()->where('hash', $hash)->first();
        if ($share) {
            if( !$share->trashed()) {
                return view('page.share')
                      ->with('shareTitle', $share->title . ' | Phylogeny.IO')
                      ->with('shareDescription', $share->description)
                      ->with('shareHash', $share->hash);
            } else {
                return view('errors.share-deleted');
            }
        }
        abort('404');
    }

}
