var failMsg = {
    1001: '아이디는 6글자 이상, 12글자 이하로 만들어주세요.',
    1002: '아이디는 영문자 및 숫자만 가능하고, 숫자로 시작할 수 없습니다.',
    1003: '비밀번호와 비밀번호 확인이 동일하지 않습니다.',
    1004: '비밀번호는 6글자 이상, 12글자 이하로 만들어주세요.',
    1005: '비밀번호는 숫자, 영문자 및 특수문자 1개씩 포함 해야합니다.',
    
}

function inspectAccount(userdata) {

    if(userdata.length >= 13 || userdata.length <= 5){
        $('#input-user-account').val('');
        return 1001;
    }
    
    var pattern2 = /^[a-zA-Z]{1}[0-9a-zA-Z]{5,11}$/g;
    if(!pattern2.test(userdata) ){
        $('#input-user-account').val('');
        return 1002;
    } 

    return null;
}

function inspectPassword(userData, userDataCopy) {

    if(userData !== userDataCopy) {
        return 1003;
    }

    if(userData.length >= 13 || userData.length <= 5){
        return 1004;
    } 

    var patternA = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*()])[0-9a-zA-Z!@#$%^&*()]{6,12}$/;
    if(!patternA.test(userData)) {
        return 1005;
    }

    return null;
}
