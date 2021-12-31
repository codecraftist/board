var express = require('express');
var router = express.Router();

const mdb = require('../database/memory-storage');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

const USER_TYPE = {
  ADMIN: 0,
  USER: 1
};


/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('login-page', {
    login: req.session.login
  });
});

router.post('/login', async function (req, res, next) {

  var uid = req.body.uid;
  var pwd = req.body.pwd;

  try {

    const userInfo = await mdb.getData('user', uid);

    if(!userInfo) {
      return res.json({
        success: false,
        msg: '존재하지 않는 아이디'
      });
    }

    if(userInfo.pwd !== pwd) {

      return res.json({
        success: false,
        msg: '암호가 일치하지 않습니다.'
      });
    }

    req.session.login = true;
    req.session.uid = userInfo.uid;

    return res.json({
      success: true,
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }
});

router.get('/logout', function (req, res, next) {

  req.session.login = false;

  res.redirect('/');
});

router.get('/signup', function (req, res, next) {

  res.render('signup-page', {
    login: req.session.login
  });
});

router.post('/signup', async function (req, res, next) {

  try {

    const userInfo = {
      uid: req.body.uid,
      pwd: req.body.pwd,
      email: req.body.email,
      utype: USER_TYPE.USER
    };

    console.log('userInfo', userInfo);

    const getOpResult = await mdb.getData('user', userInfo.uid);

    if(getOpResult) {
      return res.json({
        success: false,
        msg: '이미 존재하는 아이디'
      });
    }

    const emailCheckOp = await mdb.getData('signup-confirm', userInfo.email);
    if(!emailCheckOp) {
      return res.json({
        success: false,
        msg: '이메일 인증이 완료되지 않은 계정입니다.'
      });
    }

    const opResult = await mdb.setData('user', userInfo.uid, userInfo);
    if(!opResult) {
      return res.json({
        success: false,
        msg: '회원 정보 추가 실패'
      });
    }

    req.session.login = true;
    req.session.uid = userInfo.uid;

    return res.json({
      success: true,
    });
    
  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }
});

// 이메일을 보내서 코드 생성
// 데이터 형식
//  1) email: string
router.post('/email-authentication', async function (req, res, next) {

  try {

    var code = getRandomInt(100000, 1000000) + '';
    console.log('code', code);

    const opResult = await mdb.setData('signup-code', req.body.email, code);
    if(!opResult) {
      return res.json({
        success: false,
        msg: '가입 인증 코드 생성 실패'
      });
    }

    return res.json({
      success: true,
      code: code
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

// 이메일, 코드를 보내서 인증 처리
// 데이터 형식
//  1) email: string
//  2) code: string
router.post('/email-verification',async function (req, res, next) {

  try {

    const opResult = await mdb.getData('signup-code', req.body.email);
    if(!opResult) {
      return res.json({
        success: false,
        msg: '이메일 인증을 시도하지 않은 이메일 주소입니다.'
      });
    }

    if(opResult !== req.body.code) {
      return res.json({
        success: false,
        msg: '인증 코드가 올바르지 않습니다.'
      });
    }

    const saveResult = await mdb.setData('signup-confirm', req.body.email, true);
    if(!saveResult) {
      return res.json({
        success: false,
        msg: '이메일 인증 완료 처리 중 문제가 발생했습니다.'
      });
    }

    return res.json({
      success: true
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.get('/findAccount', function (req, res, next) {

  res.render('findAccount', {
    login: req.session.login
  });
});

router.post('/findAccount', async function (req, res, next) {

  const email = req.body.email;

  try {

    const opResult = await mdb.getAllData('user');
    if(!opResult) {
      return res.json({
        success: false,
        msg: '회원 정보가 존재하지 않습니다.'
      });
    }
    
    for(let uid in opResult) {
      if(opResult[uid].email === email) {
        return res.json({
          success: true,
          uid: uid
        });
      }
    }

    return res.json({
      success: false
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }
});

router.get('/info', function (req, res, next) {
  
  if(!req.session.login) {
    return res.redirect('/');
  }

  res.render('userManagement', {
    login: req.session.login
  });
});

router.get('/findPassword', function (req, res, next) {

  res.render('findPassword', {
    login: req.session.login
  });
});

router.post('/findPassword', async function (req, res, next) {

  const email = req.body.email;
  const uid = req.body.uid;

  try {

    const opResult = await mdb.getData('user', uid);
    if(!opResult) {
      return res.json({
        success: false,
        msg: '회원 정보가 존재하지 않습니다.'
      });
    }

    if(opResult.email !== email) {
      return res.json({
        success: false,
        msg: '이메일 정보가 일치하지 않습니다.'
      });
    }

    return res.json({
      success: true,
      pwd: opResult.pwd
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.put('/change-pwd', async function (req, res, next) {

  if(!req.session.login) {
    return res.json({
      success:false,
      msg: '로그인 후 이용 바랍니다.'
    });
  }

  const prevPwd = req.body.prevPwd;
  const newPwd = req.body.newPwd;

  const uid = req.session.uid;

  try {

    const opResult = await mdb.getData('user', uid);
    if(!opResult) {
      return res.json({
        success: false,
        msg: '회원 정보가 존재하지 않습니다.'
      });
    }

    if(opResult.pwd !== prevPwd) {
      return res.json({
        success: false,
        msg: '비밀번호가 일치하지 않습니다.'
      });
    }

    opResult.pwd = newPwd;  
    
    const opResult2 = await mdb.setData('user', uid, opResult);
    if(!opResult2) {
      return res.json({
        success: false,
        msg: '회원 정보가 존재하지 않습니다.'
      });
    }

    return res.json({
      success: true
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }
});

router.get('/my-info', async function (req, res, next) {

  if(!req.session.login) {
    return res.json({
      success:false,
      msg: '로그인 후 이용 바랍니다.'
    });
  }

  const uid = req.session.uid;
  
  try {

    const opResult = await mdb.getData('user', uid);
    if(!opResult) {
      return res.json({
        success: false,
        msg: '회원 정보가 존재하지 않습니다.'
      });
    }

    opResult.pwd = '';

    return res.json({
      success: true,
      user: opResult
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.get('/delete-account', function (req, res) {

  if(!req.session.login) {
    return res.redirect('/');
  }

  res.render('delete-account', {
    login: req.session.login
  });
  
});

router.delete('/account', async function (req, res, next) {

  if(!req.session.login) {
    return res.json({
      success: false,
      msg: '로그인 후 이용 바랍니다.'
    });
  }

  const uid = req.session.uid;
  const pwd = req.body.pwd;
  
  try {

    const opResult = await mdb.getData('user', uid);
    if(!opResult) {
      return res.json({
        success: false,
        msg: '회원 정보가 존재하지 않습니다.'
      });
    }
    
    if(opResult.pwd != pwd) {
      return res.json({
        success: false,
        msg: '비밀번호가 일치하지 않습니다.'
      });
    } 

    await mdb.removeData('user', uid);

    req.session.destroy(() => {});

    return res.json({
      success: true
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.get('/board', function (req, res, next) {

  if(!req.session.login) {
    return res.redirect('/');
  }

  res.render('board', {
    login: req.session.login
  });

});

module.exports = router;
