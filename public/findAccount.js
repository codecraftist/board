$('#btn-email-confirm').click(function (){

    
    // 서버에 이메일 주소 전달
    var email = $('#input-user-email').val();
    $.ajax({
        method: 'POST',
        url: '/findAccount',
        data: {
            email: email
        }
    }).done(function (data) {
        if(data.success) {
            $('.email-confirm-ok').removeClass('hidden');
            $('#email-confirm-id').html(`<span>${data.uid}</span>`);
        } else {
            $('#msg-alert').text(data.msg);
        }
    });
   
});
