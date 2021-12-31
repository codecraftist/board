// 페이지가 로드 되면 처리되는 부분
$(document).ready(function () {

    // $('.input-user').focus(function () {

    //     // 1. 그 위쪽에 부모 div에 태그에 녹색 테두리
    //     $(this).parent().addClass('active');
    //     $(this).parent().siblings('.input-border').addClass('active');

    //     // 2. 인풋 태그 왼쪽 아이콘 색깔 검정으로 변경하기
    //     $(this).siblings('.input-icon').addClass('active');

    //     // 3. 평소에는 안보이는 인풋 태그 오른쪽의 x 아이콘 표시
    //     $(this).siblings('.btn-delete-text').find('.delete-icon').addClass('active');
    // });

    // $('.input-user').blur(function () {

    //     // 1. 그 위쪽에 부모 div에 태그에 녹색 테두리
    //     $(this).parent().removeClass('active');
    //     $(this).parent().siblings('.input-border').removeClass('active');

    //     // 2. 인풋 태그 왼쪽 아이콘 색깔 검정으로 변경하기
    //     $(this).siblings('.input-icon').removeClass('active');

    //     // 3. 평소에는 안보이는 인풋 태그 오른쪽의 x 아이콘 표시
    //     $(this).siblings('.btn-delete-text').find('.delete-icon').removeClass('active');

    // });


    $('.btn-delete-text').click(function () {

        $(this).siblings('.input-user').val('').focus();
    });

    $('#btn-auto-login').click(function () {
        
        var btnAutoLoginTag = $(this);
        var iconTag = btnAutoLoginTag.find('.checkbox');

        iconTag.toggleClass('fas');
        iconTag.toggleClass('far');
    });

    // $('#ios-switch').click(function () {
    //     $(this).toggleClass('on');
    // }); 

    $('#switch-group').click(function () {

        var switchTag = $(this).find('.ios-switch');
        var switchState = switchTag.attr('switch-state');
        if(switchState == 'off') {
            switchTag.addClass('on');
            switchTag.attr('switch-state', 'on');
        } else {
            switchTag.removeClass('on');
            switchTag.attr('switch-state', 'off');
        }
    }); 

    var result;

    $('#btn-login').click(function() {

        var uid = $('input[name=uid]').val();
        var pwd = $('input[name=pwd]').val();

        /**
         * 
         * 각종 데이터 검증
         */

        $.ajax({
            url: '/login',
            method: 'post',
            data: {
                uid: uid,
                pwd: pwd
            }
        }).done(function (data) {
            
            if(data.success) {
                location.href = '/board';
            } else {
                $('#msg-alert').text(data.msg);
            }
        });
    });
});