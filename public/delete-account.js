$(document).ready(function () {

    $('#btn-signout').click(function(){

        if(!confirm('정말 탈퇴하시겠습니까?')) {
            return;
        }

        var pwd = $('#input-user-password').val();

        $.ajax({
            method: 'delete',
            url : '/account',
            data: {
                pwd : pwd
            }
        }).done(function (data) {
            console.log(data);
            if(data.success) {
                alert('회원탈퇴 성공');
                location.href = '/'
            } else {
                alert(data.msg);
            }
        });   
    })

});