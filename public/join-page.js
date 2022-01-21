// 이메일 인증
var emailAuthCheck = false;
var startTimer = null;
$('#btn-email-confirm').click(function (){

    var time = 0;
    var sec = 180;

    // 서버에 이메일 주소 전달
    var email = $('#input-user-email').val();
    $.ajax({
        method: 'POST',
        url: '/email-authentication',
        data: {
            email: email
        }
    }).done(function (data) {
        console.log(data);
        if(data.success) {
            alert('인증 코드가 전송되었습니다.');
            $('#input-user-emailpwd').val(data.code);
        } else {
            $('#msg-alert').text(data.msg);
        }
    });
    
    if (time == 0) {
        startTimer = setInterval(() => {
            sec--;
            if(sec == 0){
                console.log('끝');
                clearInterval(startTimer);
                $('#min').addClass('hidden').html('인증실패. 다시시도해주세요');
                $('#sec').addClass('hidden');
            }
            
            Display();

        }, 1000);
        
    }

    function Display(){

        var min = parseInt(sec / 60);
        if(min < 10) {
            min = '0' + min;
        }
        var second = sec % 60;
        if(second < 10) {
            second = '0' + second;
        }

        $('#min').html(min + ':');
        $('#sec').html(second);
    }
    
});
    
    //이메일 인증 확인
$('#btn-email-ok').click(function(){

    //TODO 실제 이메일인증 로직
    var email = $('#input-user-email').val();
    var code = $('#input-user-emailpwd').val();

    // 로딩바 애니메이션 시작

    $.ajax({
        method: 'POST',
        url: '/email-verification',
        data: {
            email: email,
            code: code
        },
        
    }).done(function (data) {
        console.log(data);
        if(data.success) {
            emailAuthCheck = true;
            clearInterval(startTimer);
            alert('인증되었습니다.');

            $('#min').addClass('hidden');
            $('#sec').addClass('hidden');
        } else {
            $('#msg-alert').text(data.msg);
        }
    }).fail(function (a, b, c) {
        console.log('오류 발생');
    }).always(function (a, b, c) {
        // 로딩바 애니메이션 종료
    });
});

    //패스워드 2개일치
$('#btn-passwordCopy-ok').click(function (){  
    var pwd = $('#input-user-password').val();
    var pwdCopy = $('#input-user-passwordCopy').val();
    if(pwd !== pwdCopy) {
        return alert('비밀번호 불일치. 다시 확인해주세요')
    } else{
        return alert('비밀번호 일치')
    }
});

// 회원가입 버튼

$('#btn-join').click(function (){
    /*
    이메일 인증이 우선 되어 있는가? => 
    */
   
    if(!emailAuthCheck) {
        return alert('이메일 인증을 우선 완료해주세요.');
    }

    var uid = $('#input-user-account').val();

    var failCode = inspectAccount(uid);
    if(failCode !== null) {
        return alert(failMsg[failCode]);
    }

    var pwd = $('#input-user-password').val();
    var pwdCopy = $('#input-user-passwordCopy').val();

    var pwdFailCode = inspectPassword(pwd, pwdCopy);
    if(pwdFailCode !== null) {
        $('#input-user-password').val('');
        $('#input-user-passwordCopy').val('');
        return alert(failMsg[pwdFailCode]);
    }

    var email = $('#input-user-email').val();

    // 데이터 통신
    $.ajax({
        url : '/signup',
        method: 'post',
        data : {
            uid : uid,
            pwd : pwd,
            email : email
        }
    }).done(function (data) {

        console.log(data);

        if(data.success) {
            alert('회원가입에 성공했습니다.');
            location.href = '/board';
        } else {
            $('#msg-alert').text(data.msg);
        }
    });


});

$('.btn-delete-text').click(function () {

    $(this).siblings('.input-user').val('').focus();
});