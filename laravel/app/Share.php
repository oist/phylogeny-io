<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use DB;

class Share extends Model
{
    use SoftDeletes;
    protected $table = 'shares';
    protected $dates = ['deleted_at'];
    // public $timestamps = false;

    public function add($data)
    {
        $this->title = $data['chart_title'];
        $this->description = $data['chart_description'];
        $this->width = $data['frame_width'];
        $this->height = $data['frame_height'];
        $this->lifetime = $data['chart_lifetime'];
        $this->data = $data['json_data'];
        $sessionId = \Session::getId();
        $this->session_id = $sessionId;
        $this->hash = sha1(time() . $sessionId);
        $this->views = 0;
        $this->last_viewed_at = null;
        if($this->save()) {
            return $this->hash;
        }
        return false;
    }

    public function updateShare($data)
    {

        $share = $this->where('hash', $data['hash'])->first();
        if($share) {
            $share->title = $data['chart_title'];
            $share->description = $data['chart_description'];
            $share->width = $data['frame_width'];
            $share->height = $data['frame_height'];
            $share->lifetime = $data['chart_lifetime'];
            $share->data = $data['json_data'];
            $share->updated_at = Carbon::now();
            if($share->save()) {
                return $share->hash;
            }
        }
        return false;
    }

    public function restoreShare($id, $lifetime)
    {
        $share = $this->withTrashed()->find($id);
        if($lifetime && in_array($lifetime, array('day', 'week', 'month', 'half-year', 'year', 'infinity'))) {
            $share->lifetime = $lifetime;
        }
        if($share->restore()) {
            return true;
        }
        return false;
    }

    public function deleteSoft($id)
    {
        $share = $this->find($id);
        if($share->delete()) {
            return true;
        }
        return false;
    }

    public function deleteHard($id)
    {
        $share = $this->withTrashed()->find($id);
        if($share->forceDelete()) {
            return true;
        }
        return false;
    }

    /**
     * Redundant function: Moved to Console Commands
     */
    public static function deleteExpired()
    {
        $start_time = microtime(true);
        $lifetime = array('day', 'week', 'month', 'half-year', 'year', 'infinity');
        $total = 0;
        $msg = '';
        foreach ($lifetime as $l) {
            $query = Share::where('lifetime', $l);
            if($query->count() > 0) {
                switch ($l) {
                    case 'day':
                        $deleted = $query->where('created_at', '<', Carbon::now()->subDay())->delete();
                        $total += $deleted;
                        $msg .= 'Day: ' . $deleted . ' records deleted.\n';
                    break;
                    case 'week':
                        $deleted = $query->where('created_at', '<', Carbon::now()->subWeek())->delete();
                        $total += $deleted;
                        $msg .= 'Week: ' . $deleted . ' records deleted.\n';
                    break;
                    case 'month':
                        $deleted = $query->where('created_at', '<', Carbon::now()->subMonth())->delete();
                        $total += $deleted;
                        $msg .= 'Month: ' . $deleted . ' records deleted.\n';
                    break;
                    case 'half-year':
                        $deleted = $query->where('created_at', '<', Carbon::now()->subMonth(6))->delete();
                        $total += $deleted;
                        $msg .= 'Half-Year: ' . $deleted . ' records deleted.\n';
                    break;
                    case 'year':
                        $deleted = $query->where('created_at', '<', Carbon::now()->subYear())->delete();
                        $total += $deleted;
                        $msg .= 'Year: ' . $deleted . ' records deleted.\n';
                    break;
                }
            }
        }

        if($total == 0) {
            $msg = 'Nothing to delete.\n';
        } else {
            $msg = $msg . 'Total: ' . $total . ' records deleted.\n';
        }

        $time_elapsed = microtime(true) - $start_time;
        echo $msg . ' Execution time: ' . round($time_elapsed, 3) . ' seconds.';
        return true;
    }

    /**
     * Redundant function: Moved to Console Commands
     */
    public static function deleteInactivePermanently()
    {
        $start_time = microtime(true);
        $query = Share::where('last_viewed_at', '<', Carbon::now()->subMonths(6))
                    ->orWhere(function ($q) {
                        $q->where('created_at', '<', Carbon::now()->subMonths(6))
                            ->whereNull('last_viewed_at');
                    });
        $count = $query->count();
        if($count > 0) {
            $deleted = $query->forceDelete();
            $msg = 'Permanently deleted ' .  $deleted . ' records.';
        } else {
            $msg = 'Nothing to delete.';
        }
        $time_elapsed = microtime(true) - $start_time;
        echo $msg . ' Execution time: ' . round($time_elapsed, 3) . ' seconds.';
        return true;
    }
}
