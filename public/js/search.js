//on document ready get search query passed in from url
$(document).ready(function(){
    var q = window.location.search.split('=')[1];
    //replace + with spaces
    q = q.replace(/\+/g, ' ');

    console.log(q);
    //if no search query was passed in, redirect to home
    if(!q){
        window.location.href = '/';
    }
    //ajax get call to search endpoint with the search query in request body
    const data = {
        q: q
    }
    $.ajax({
        url: '/api/search',
        type: 'get',
        data: data,
        success: function(data){
            //check if no packages were found
            //res is array, so check if there are any elements
            if(data.length == 0){
                $('#searchResults').append('<h4 id="lError">No packages found</h4>');
            }
            else {
                //append search query to searchHeader
                $("#resultsHeader").append(q);
                //loop through each result and append to #searchResults
                for(var i = 0; i < data.length; i++){
                    $('#searchResults').append(`<h3>${data[i]}</h3> <br>`);

                }
            }
        }
    });

});