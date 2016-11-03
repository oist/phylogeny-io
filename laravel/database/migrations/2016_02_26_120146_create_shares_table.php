<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSharesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shares', function (Blueprint $table) {
            $table->increments('id');
            $table->string('session_id');
            $table->string('title', 255);
            $table->text('description');
            $table->smallInteger('width');
            $table->smallInteger('height');
            $table->string('lifetime', 20);
            $table->longText('data');
            $table->string('hash');
            $table->integer('views');
            $table->timestamp('last_viewed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('shares');
    }
}
