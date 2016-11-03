<!DOCTYPE html>
<html>
<head>

    @include('includes.meta')

    @include('includes.styles')

    @yield('extra_css')

</head>
<body class="skin-blue {{ $bodyClass }}">
    <!-- Site wrapper -->
    <div class="wrapper">
        <!-- =============================================== -->
        @include('includes.header')

        <!-- =============================================== -->
        <!-- Left side column. contains the sidebar -->
        <aside class="main-sidebar">
            <!-- sidebar: style can be found in sidebar.less -->
            <section class="sidebar">
                <!-- sidebar menu: : style can be found in sidebar.less -->
                <ul class="sidebar-menu">
                    @yield('sidebar')
                </ul>
            </section>
            <!-- /.sidebar -->
        </aside>

        <!-- =============================================== -->
        @yield('content')

        <!-- =============================================== -->
        @include('includes.footer')

    </div><!-- ./wrapper -->

    @include('includes.scripts')

    @yield('scripts')

    @yield('extra_js')
</body>
</html>
