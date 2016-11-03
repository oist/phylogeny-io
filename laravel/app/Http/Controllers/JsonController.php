<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use File;
use URL;
use Validator;
use Session;
use App\Share;

class JsonController extends Controller
{
    public function save(Request $request)
    {
        if( $request->ajax() ) {
            $path = public_path() . '/temp/';
            if(!File::exists($path)) {
                $result = File::makeDirectory( $path , 0775);
                if(!$result) {
                    return response()->json(['status' => '2', 'message' => 'Unable to create temporary folder for storing files. Check server permissions.']);
                }
            }
            $jsonData = $request->get('data');
            $jsonData = str_replace('_children', 'children', $jsonData);
            $file = 'phylogenetic_'.time().'_'.rand().".json";
            $fileUrl = $path . $file;

            $bytesWritten = File::put($fileUrl, $jsonData);
            if ($bytesWritten === false) {
                return response()->json(['status' => 1, 'file' => $file]);
            }

            return response()->json(['status' => 1, 'file' => $file]);
        }

        abort('404');
    }

    public function download($file)
    {
        $path = public_path() . '/temp/';
        $pathToFile = $path . $file;

        $headers = array(
            "Cache-Control: public",
            "Content-Description: File Transfer",
            "Content-Disposition: attachment; filename={".$file."}",
            "Content-Type: application/json",
            "Content-Transfer-Encoding: binary"
        );

        return response()->download($pathToFile);
        // return response()->download($pathToFile, $file, $headers);
    }

    public function delete(Request $request)
    {
        if( $request->ajax() ) {

            $file = $request->get('file');
            if($file) {
                $path = public_path() . '/temp/';
                $pathToFile = $path . $file;
                if ( File::exists($pathToFile) ) {
                    File::delete($pathToFile);
                    if ( File::exists($pathToFile) ) {
                        return response()->json(['status' => 2, 'message' => 'File not deleted. An unknown server error occured.']);
                    } else {
                        return response()->json(['status' => 1, 'message' => 'Temporary json file deleted.']);
                    }
                } else {
                    return response()->json(['status' => -1, 'message' => "File doesn'\t exist or already deleted."]);
                }
            } else {
                return response()->json(['status' => -1, 'message' => 'An error occured. No data is recevied.']);
            }
        }

        abort('404');
    }

    public function saveShare(Request $request)
    {
        if($request->ajax()) {

            $validator = Validator::make($request->all(), [
                'chart_title' => 'required|max:255',
                'chart_lifetime' => 'required',
                'json_data' => 'required'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 2, 'errors' => $validator->errors()]);
            }
            // Check if limit is reached
            $sharedBefore = Session::get('phylo.shares');
            if(count($sharedBefore) >= 10) {
                $response = ['status' => 4, 'message' => 'Sorry, but you reached your limit for maximum number of shared charts per session. <br/> Please try again later.'];
                return response()->json($response);
            }
            $jsonData = $request->get('json_data');
            $jsonData = str_replace('_children', 'children', $jsonData);
            $update = $request->get('update');
            $share = new Share();
            if($update == '0') { // insert new
                $shareHash = $share->add($request->all());
            } else { // update previous
                $shareHash = $share->updateShare($request->all());
            }
            if($shareHash) {
                if($update == '0') {
                    Session::push('phylo.shares', $shareHash);
                }
                $width = $request->get('frame_width');
                $height = $request->get('frame_height');
                $urlShare = URL::to('/share/' . $shareHash);
                $iframe = '<iframe width="'.$width.'" height="'.$height.'" src="'.$urlShare.'"></iframe>';
                $response = ['status' => 1, 'url' => $urlShare, 'iframe' => $iframe, 'hash' => $shareHash];
            } else {
                $response = ['status' => 3, 'message' => 'Unfortunately this chart cannot be saved or shared for some unknown reason.<br/>Please post the details on <a href="/feedback" target="_blank">feedback</a> page and we will try to solve it.'];
            }
            return response()->json($response);
        }

        abort('404');
    }

    public function getShare(Request $request, $hash) {
        if($request->ajax()) {
            $share = Share::withTrashed()->where('hash', $hash)->first();
            return response()->json(['status' => 1, 'share' => $share]);
        }
        abort('404');
    }
}
