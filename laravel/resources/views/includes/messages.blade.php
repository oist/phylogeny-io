@if(Session::has('success'))
    <div class="alert alert-success alert-dismissible">
        {{ Session::get('success') }}
    </div>
@endif
@if(Session::has('info'))
    <div class="alert alert-info alert-dismissible">
        {{ Session::get('info') }}
    </div>
@endif
@if(Session::has('danger'))
    <div class="alert alert-danger alert-dismissible">
        {{ Session::get('danger') }}
    </div>
@endif
@if(Session::has('warning'))
    <div class="alert alert-warning alert-dismissible">
        {{ Session::get('warning') }}
    </div>
@endif
@if (count($errors) > 0)
    <div class="alert alert-danger alert-dismissible">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
