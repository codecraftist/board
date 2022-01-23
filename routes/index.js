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
    login: req.session.login,
    uid: req.session.uid
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

  req.session.destroy((err) => {
    res.redirect('/');
  });
});

router.get('/signup', function (req, res, next) {

  res.render('signup-page', {
    login: req.session.login,
    uid: req.session.uid
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
    login: req.session.login,
    uid: req.session.uid
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
      success: false,
      msg : 'test 아이디찾기 중 이메일이 틀렸을때'
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
    login: req.session.login,
    uid: req.session.uid
  });
});

router.get('/findPassword', function (req, res, next) {

  res.render('findPassword', {
    login: req.session.login,
    uid: req.session.uid
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
    login: req.session.login,
    uid: req.session.uid
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
    login: req.session.login,
    uid: req.session.uid
  });

});

router.get('/board/list', async function (req, res, next) {

  try {

    const owner = req.session.uid;

    const _page = parseInt(req.query.page || 1);
    const _limit = parseInt(req.query.limit || 20);

    if (isNaN(_page) || isNaN(_limit)) {
      return res.json({
        success: false,
        msg: '요청 정보가 올바르지 않습니다.'
      })
    }

    const _keyword = req.query.keyword || '';
    const _searchType = req.query.searchType || '';

    const preNoticeList = await mdb.getAllArrData('notice');

    for(let i = 0; i < preNoticeList.length; i++)
    {
      preNoticeList[i].good = preNoticeList[i].good.length;
      preNoticeList[i].bad = preNoticeList[i].bad.length;
    }

    const prePostList = await mdb.getAllArrData('board');

    const normalList = [];

    let skip = (_page - 1) * _limit;
    let cnt = 0;

    const onSearch = typeof _keyword == 'string' && _keyword.length > 2;
    
    let i = 0;
    while (i < prePostList.length) {

      if(onSearch && !prePostList[i][_searchType].includes(_keyword)) {
        i++;
        continue;
      }

      if (skip > 0) {
        skip--;
      } else if (cnt < _limit) {
        prePostList[i].good = prePostList[i].good.length;
        prePostList[i].bad = prePostList[i].bad.length;
        if(prePostList[i].blind && prePostList[i].author != owner) {
          prePostList[i].title = '비밀글입니다.';
          prePostList[i].author = '***';
          prePostList[i].secret = true;
        }
        normalList.push(prePostList[i]);
        cnt++;
      } else {
        break;
      }
      i++;
    }
    
    res.json({
      success: true,
      page: _page,
      limit: _limit,
      totalCnt: prePostList.length,
      postList: normalList,
      noticeList: preNoticeList,
    });

  } catch (err) {

    console.log(err);

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }
});

router.post('/board/add', async function (req, res, next) {

  try {

    let no = 1000;

    const getNoOp = await mdb.getData('no', 'board');
    if(getNoOp) {
      no = getNoOp + 1;
    }

    await mdb.setData('no', 'board', no);
    
    const post = {
      no: no,
      author: req.session.uid,
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      blind: req.body.blind == 'true' ? true : false,
      notice: req.body.notice == 'true' ? true : false,
      viewCnt: 0,
      good: [],
      bad: [],
      datetime: Date.now()
    }

    if(post.blind && post.notice) {
      return res.json({
        success: false,
        msg: '비밀글 옵션과 공지 옵션은 동시에 적용할 수 없습니다.'
      });
    }

    if(post.notice) {
      const addOp = await mdb.setArrData('notice', post, true);
      if(!addOp) {
        return res.json({
          success: false,
          msg: '게시글 생성에 실패하였습니다.'
        });
      }
    } else {
      const addOp = await mdb.setArrData('board', post, true);
      if(!addOp) {
        return res.json({
          success: false,
          msg: '게시글 생성에 실패하였습니다.'
        });
      }
    }
    
    res.json({
      success: true,
      post: post
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.put('/board/modify', async function (req, res, next) {

  try {
    
    const no = parseInt(req.body.no) || -1;
    const table = req.body.isNotice == 'true' ? 'notice' : 'board';
    const owner = req.session.uid;

    const newblind = req.body.blind == 'true' ? true : false;
    const newnotice = req.body.notice == 'true' ? true : false;

    let allList = await mdb.getAllArrData(table);

    for(let i = 0; i < allList.length; i++) {
      if(allList[i].no == no) {

        allList[i].title = req.body.title.trim();
        allList[i].category = req.body.category.trim();
        allList[i].content = req.body.content.trim();
        allList[i].blind = newblind;

        if(allList[i].notice != newnotice) {

          await mdb.removeArrData(table, i);

          allList[i].notice = newnotice;

          if(newnotice) {
            await mdb.setArrData('notice', allList[i], true);
          } else {
            await mdb.setArrData('board', allList[i], true);
          }

        } else {
          
          await mdb.updateArrData(table, allList[i], i);
        }

        return res.json({
          success: true,
        });
      }
    }
    
    res.json({
      success: false
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.get('/board/post', async function (req, res, next) {

  try {
    
    const no = parseInt(req.query.no) || -1;
    const table = req.query.isNotice == 'true' ? 'notice' : 'board';
    const owner = req.session.uid;

    let allList = await mdb.getAllArrData(table);

    for(let i = 0; i < allList.length; i++) {
      if(allList[i].no == no) {

        if(allList[i].blind && allList[i].author != owner) {
          return res.json({
            success: false,
            msg: '비밀글은 작성자만 볼 수 있습니다.'
          });
        }

        allList[i].viewCnt++;
        await mdb.updateArrData(table, allList[i], i);

        allList[i].owner = allList[i].author == owner ? true : false;

        allList[i].good = allList[i].good.length;
        allList[i].bad = allList[i].bad.length;

        return res.json({
          success: true,
          post: allList[i]
        });
      }
    }
    
    res.json({
      success: false
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.post('/board/modify-confirm', async function (req, res, next) {

  try {
    
    const no = parseInt(req.body.no) || -1;
    const table = req.body.isNotice == 'true' ? 'notice' : 'board';
    const owner = req.session.uid;

    let allList = await mdb.getAllArrData(table);

    for(let i = 0; i < allList.length; i++) {
      if(allList[i].no == no) {
        return res.json({
          success: allList[i].author == owner ? true : false,
          post: allList[i]
        });
      }
    }
    
    res.json({
      success: false
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.delete('/board/delete', async function (req, res, next) {

  try {
    
    const no = parseInt(req.body.no) || -1;
    const table = req.body.isNotice == 'true' ? 'notice' : 'board';
    const owner = req.session.uid;

    let allList = await mdb.getAllArrData(table);

    for(let i = 0; i < allList.length; i++) {
      if(allList[i].no == no && owner == allList[i].author) {
        await mdb.removeArrData(table, i);
        return res.json({
          success: true
        });
      }
    }
    
    res.json({
      success: false
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.put('/board/stat', async function (req, res, next) {

  try {
    
    const no = parseInt(req.body.no) || -1;
    const table = req.body.isNotice == 'true' ? 'notice' : 'board';
    const owner = req.session.uid;
    const type = req.body.type;

    let allList = await mdb.getAllArrData(table);

    for(let i = 0; i < allList.length; i++) {
      if(allList[i].no == no) {

        const goodList = allList[i]['good'];
        const badList = allList[i]['bad'];

        if(type == 'good') {
          if(goodList.includes(owner)) {
            return res.json({
              success: false,
              msg: '이미 찬성하셨습니다.'
            });
          } else {
            goodList.push(owner);
            const idx = badList.indexOf(owner);
            if(idx > -1) {
              badList.splice(idx, 1);
            }
          }
        }
        else if(type == 'bad') {
          if(badList.includes(owner)) {
            return res.json({
              success: false,
              msg: '이미 반대하셨습니다.'
            });
          } else {
            badList.push(owner);
            const idx = goodList.indexOf(owner);
            if(idx > -1) {
              goodList.splice(idx, 1);
            }
          }
        }

        await mdb.updateArrData(table, allList[i], i);

        return res.json({
          success: true,
          good: goodList.length,
          bad: badList.length
        });

      }
    }
    
    res.json({
      success: false,
      msg: '찬성/반대 투표에 실패하였습니다.'
    });

  } catch(err) {

    return res.json({
      success: false,
      msg: '서버 내부 오류 발생'
    });
  }

});

router.get('/animation', function (req, res, next) {
  
  if(!req.session.login) {
    return res.redirect('/');
  }

  res.render('animation', {
    login: req.session.login,
    uid: req.session.uid
  });
});

module.exports = router;
