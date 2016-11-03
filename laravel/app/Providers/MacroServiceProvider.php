<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Request;

class MacroServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        \Html::macro('menu_active', function($route) {
            $path = explode('/', \Request::path());
            $linkClass = "";
            if( $path[0] == 'admin') {
                if( $path[1] == $route ) {
                    $linkClass .= " active ";
                }
            } else {
                if( $path[0] == $route ) {
                    $linkClass .= " active ";
                }
            }

            return $linkClass;
        });

        \Html::macro('submenu_active', function($route) {
            $linkClass = "";
            if( strpos(\Request::path(), $route) !== false ) {
                $linkClass .= " active ";
            }

            return $linkClass;
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
