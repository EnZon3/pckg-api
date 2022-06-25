//on document ready
$(document).ready(function(){
    //if user is already logged in, redirect to dashboard
    var username = Cookies.get('username');
    if(username){
        window.location.href = '/dashboard';
    }
    //on click of the submit button
    $('#lSubmit').click(function(){
        //prevent default action
        event.preventDefault();
        //get the value of the input field
        var username = $('#lusername').val();
        var password = $('#lpassword').val();
        console.log(username, password);
        //if the input field is empty
        if(username == '' || password == ''){
            //show the error message
            $('#lError').html('Please fill out all fields.');
        }

        //ajax get call to login endpoint with the username and password in request body
        const data = {
            username: username,
            password: password
        }
        $.ajax({
            url: '/api/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(data){
                //set cookie to username and token
                Cookies.set('username', username, { expires: 7 });
                Cookies.set('token', data, { expires: 7 });
                //redirect to the home page
                window.location.href = '/dashboard';
            },
            error: function(data){
                //show the error message
                $('#lError').html(data.responseJSON.message);
            }
        });

    });

    //on click of the register button
    $('#rSubmit').click(function(){
        //prevent default action
        event.preventDefault();
        //get the value of the input field
        var username = $('#rusername').val();
        var password = $('#rpassword').val();
        var confirm = $('#rconfirm').val();
        console.log(username, password, confirm);
        //if the input field is empty
        if(username == '' || password == '' || confirm == ''){
            //show the error message
            $('#rError').html('Please fill out all fields.');
            return 1;
        }
        //if the passwords don't match
        if(password != confirm){
            //show the error message
            $('#rError').html('Passwords do not match.');
            return 1;
        }

        //check recaptcha
        var response = grecaptcha.getResponse();
        if(response.length == 0){
            //show the error message
            $('#rError').html('Please check the recaptcha.');
            return 1;
        }
        //recaptcha site verification
        let settings = {
            "async": true,
            "crossDomain": true,
            "url": `/api/verifyCaptcha?response=${response}`,
            "method": "POST",
            "headers": {}
          };
        var captRes;
        $.ajax(settings).done(function (resp) {
            console.log(resp);
            if(resp != 'true'){
                //show the error message
                $('#rError').html('Please check the recaptcha.');
                captRes = res;
                return 1;
            }
            //ajax post call to register endpoint with the username and password in request body
            let data = {
                username: username,
                password: password
            }
            $.ajax({
                url: '/api/register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function(){
                    $('#rError').html('Account created.');
                },
                error: function(data){
                    //show the error message
                    $('#rError').html(data);
                    return 1;
                }
            });
        });

        if(captRes != true){
            //show the error message
            return 1;
        }
        //ajax post call to register endpoint with the username and password in request body
        const data = {
            username: username,
            password: password
        }
        $.ajax({
            url: '/api/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(){
                //say account created
                $('#rError').html('Account created.');
            },
            error: function(data){
                //show the error message
                $('#rError').html(data.responseJSON.message);
            }
        });
    });
});