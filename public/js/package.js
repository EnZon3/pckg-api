//on document .ready get search query passed in from url
$(document).ready(function(){
    var q = window.location.search.split('=')[1];
    //replace + with spaces
    q = q.replace(/\+/g, ' ');

    console.log(q);
    //if no search query was passed in, redirect to home
    if(!q){
        window.location.href = '/';
    }
    //ajax call to get package info from query
    const data = {
        title: q
    }
    $.ajax({
        url: '/api/getPackageInfo',
        type: 'get',
        data: data,
        success: function(data){
            //check if no packages were found
            //res is array, so check if there are any elements
            if(data.length == 0){
                window.location.href = '/';
            }
            else {
                //parse data
                //data = JSON.parse(data);
                $('#pckg_name').append(data.name);
                $('#pckg_desc').append(data.desc);
                $('#pckg_ver').append(data.ver);
                $('#pckg_author').append(data.author);
                $('#pckg_install').append(q);
            }
        }
    });
    //ajax call to get package readme from query
    $.ajax({
        url: '/api/getPackageReadme',
        type: 'get',
        data: data,
        success: function(data){
            //check if data is empty, if so display 'No readme found'
            if(data == ''){
                $('#pckg_readme').append('<p id="lError">No readme found</p>');
            }
            //convert md to html
            else {
                var converter = new showdown.Converter();
                var html = converter.makeHtml(data);
                $('#pckg_readme').append(html);
            }
        }
    });
});