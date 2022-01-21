$('#btn-email-confirm').click(function (){

    // 서버에 이메일 주소 전달
    var email = $('#input-user-email').val();
    var uid = $('#input-user-account').val();
    $.ajax({
        method: 'POST',
        url: '/findPassword',
        data: {
            uid : uid,
            email: email
        }
    }).done(function (data) {
        console.log(data);
        if(data.success) {
            $('.email-confirm-ok').removeClass('hidden');
            $('#email-confirm-password').html(`<span>${data.pwd}</span>`);
        } else {
            $('#msg-alert').text(data.msg);
        }
    });
   
});

$('.btn-delete-text').click(function () {

    $(this).siblings('.input-user').val('').focus();
});