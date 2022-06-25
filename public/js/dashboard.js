//on document ready fetch username from cookies, if empty redirect to login
$(document).ready(function(){
    var username = Cookies.get('username');
    if(!username){
        window.location.href = '/login';
    }

    //append username to #welcomeUser
    $('#welcomeUser').append(username);

    //get all user's packages
    const data = {
        q: `${username}@`
    }
    $.ajax({
        url: '/api/search',
        type: 'get',
        data: data,
        success: function(data){
            //append packages to #packages
            //check if no packages were found
            //res is array, so check if there are any elements
            if(data.length == 0){
                $('#userPckgs').append('<h4 id="lError">No packages found</h4>');
            }
            else { $('#userPckgs').append(data); }
        }
    });
});