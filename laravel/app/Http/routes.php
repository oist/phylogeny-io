<?php

/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| Here is where you will register all of the routes in an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/


/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| This route group applies the "web" middleware group to every route
| it contains. The "web" middleware group is defined in your HTTP
| kernel and includes session state, CSRF protection, and more.
|
*/

Route::group(['middleware' => ['web']], function () {

    Route::get('/', ['as' => 'home', 'uses' => 'PageController@home']);
    Route::get('/about', ['as' => 'about', 'uses' => 'PageController@about']);
    Route::get('/share/{hash}', ['as' => 'share', 'uses' => 'PageController@share']);
    Route::post('/json/save', ['as' => 'jsonSave', 'uses' => 'JsonController@save']);
    Route::get('/json/download/{file}', ['as' => 'jsonDownload', 'uses' => 'JsonController@download']);
    Route::post('/json/delete', ['as' => 'jsonDelete', 'uses' => 'JsonController@delete']);
    Route::post('/json/save-share', ['as' => 'jsonShareSave', 'uses' => 'JsonController@saveShare']);
    Route::get('/json/get-share/{hash}', ['as' => 'jsonShareGet', 'uses' => 'JsonController@getShare']);

});
