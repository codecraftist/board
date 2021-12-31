$(document).ready(function () {

    var _page = 1;          // 현재 페이지 정보를 저장
    var _limit = 30;        // 페이지당 게시글 최대 개수
    var _maxPageCnt = 7;    // 하단 페이지 네비게이션 버튼 최대 개수
    var _lastPageNum = 0;   // 마지막 페이지 번호
    var _keyword = '';      // 검색어
    var _searchType = '';   // 검색구분(제목, 내용, 저자)

    function CopyWriting() {

        var postList = localStorage.getItem('postList');
        var posts = JSON.parse(postList);

        for (var i = 1; i < 100; i++) {
            var stritem = JSON.stringify(posts[0]);
            var write = JSON.parse(stritem);
            write.no = write.no + i;
            posts.unshift(write);
        }

        var postListStr = JSON.stringify(posts);      // 전체 포스트 정보인 배열을 문자열을 변환한다.
        localStorage.setItem('postList', postListStr);
    }

    var me = {  // object: 여러개의 데이터를 한 묶음 저장할 수 있는 형식. (key-value)
        nick: '베트맨',
        age: 30
    };

    $('#btn-reset').click(function () {
        if (confirm('정말 모든 글을 삭제하시겠습니까?')) {
            localStorage.removeItem('postList');
        }
    });

    function ResetEditor() {
        $('#input-post-title').val('');
        $('#select-post-category').val('잡담');
        $('#input-post-author').val('');
        $('#input-post-secret').val('');
        $('#summernote').summernote('code', '');
        $('#cb-post-blind').prop('checked', false);
        $('#cb-post-notice').prop('checked', false);
    }

    function GetCurrentDateTime() {

        var now = new Date();

        var month = now.getMonth() + 1;
        var date = now.getDate();

        if (month < 10) {
            month = '0' + month;
        }

        if (date < 10) {
            date = '0' + date;
        }

        return month + '-' + date;
    }

    $('#btn-search-go').click(function () {

        var stype = $('#select-search-type').val();
        var keyword = $('#input-search-keyword').val();

        _keyword = keyword;
        _searchType = stype;

        RefreshPostList();
    });

    function SetPageButton(normalList) {
        /**
         * <li class="page-item">
                        <a class="page-link" href="#" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    <li class="page-item"><a class="page-link" href="#">1</a></li>
                    <li class="page-item"><a class="page-link" href="#">2</a></li>
                    <li class="page-item"><a class="page-link" href="#">3</a></li>
                    <li class="page-item">
                        <a class="page-link" href="#" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
        */

        var totalCnt = nomalList.length;   // 총 개시글 개수
        _lastPageNum = Math.ceil(totalCnt / _limit); // 마지막 페이지 번호

        // _page : 현재 페이지 정보

        // 왼쪽 버튼 처리
        var leftMax = parseInt(_maxPageCnt / 2);
        var leftCurPage = _page;
        while (leftCurPage > 1 && leftMax > 0) {
            leftCurPage--;
            leftMax--;
        }

        var rightMax = parseInt(_maxPageCnt / 2) + leftMax;
        var rightCurPage = _page;
        while (rightMax > 0 && rightCurPage < _lastPageNum) {
            rightMax--;
            rightCurPage++
        }

        $('#pagination').empty();

        var prevNavi = `<li class="page-item">
                            <a class="page-link" href="#" aria-label="Previous" page="prev">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>`;

        $('#pagination').append(prevNavi);

        for (var p = leftCurPage; p <= rightCurPage; p++) {

            var tag = '';
            if (p == _page) {
                tag = '<li class="page-item active"><a class="page-link" href="#" page="' + p + '">' + p + '</a></li>';
            }
            else {
                tag = '<li class="page-item"><a class="page-link" href="#" page="' + p + '">' + p + '</a></li>';
            }

            $('#pagination').append(tag);
        }

        var afterNavi = `<li class="page-item">
                            <a class="page-link" href="#" aria-label="Next" page="next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>`;

        $('#pagination').append(afterNavi);

    }

    $('#pagination').on('click', '.page-link', function () {

        var nextPage = $(this).attr('page');

        if (nextPage == 'prev') {
            if (_page > _maxPageCnt) {
                _page = _page - _maxPageCnt;
            } else {
                _page = 1;
            }
        }
        else if (nextPage == 'next') {
            if (_page <= _lastPageNum - _maxPageCnt) {
                _page = _page + _maxPageCnt;
            } else {
                _page = _lastPageNum;
            }
        } else {
            _page = parseInt(nextPage);
        }

        RefreshPostList();
    });

    function RefreshPostList() {
        $('#post-list').empty();
        var postList = localStorage.getItem('postList');
        if (postList == null) {
            return;
        }

        var prePostList = JSON.parse(postList);

        // prePostList.sort(function (a, b) {
        //     if(a.notice && !b.notice) {
        //         return -1;
        //     } else if(!a.notice && b.notice) {
        //         return 1;
        //     } else {
        //         return b.no - a.no;
        //     }
        // });

        var noticeList = [];
        var normalList = [];

        for (var i = 0; i < prePostList.length; i++) {
            if (prePostList[i].notice) {
                noticeList.push(prePostList[i]);
            } else {
                normalList.push(prePostList[i]);
            }
        }

        if (typeof _keyword == 'string' && _keyword.length > 2) {

            // // 만약 searchType 변수의 값이 "title"이라면 
            // for(var i = 0; i < prePostList.length; i++) {
            //     if(!prePostList[i][searchType].includes(keyword)) {
            //         prePostList[i].pass = true;
            //     }
            // }

            var i = 0;
            while (i < normalList.length) {
                if (!normalList[i][_searchType].includes(_keyword)) {
                    normalList.splice(i, 1);
                } else {
                    i++;
                }
            }

            _page = 1;
        }

        // normalList에 화면에 보여져야하는 글만 남게된다.

        for (var i = 0; i < noticeList.length; i++) {

            var post = noticeList[i];  // 전체 배열에서 i번째 포스트 1개의 데이터를 post라는 변수에 저장한다.
            // 내 정보(nick)와 게시글의 작성자 정보가 일치(동일)하는가?\

            var postTag;

            var tagHead = `<tr class="text-center ">
                                <td  class="text-danger">${post.no}</td>`;
            var tagTail = `<td>${post.datetime}</td>
                                <td>${post.viewCnt}</td>
                            </tr>`;

            if (post.blind == true) {

                if (me.nick == post.author) { // true(참), false(거짓)

                    postTag = `<td class="post-title text-left" no="${post.no}">${post.title}</td><td>${post.author}</td>`;

                } else {

                    postTag = `<td class="post-title text-left" no="${post.no}"><i>비밀글입니다.</i></td><td>***</td>`;
                }

            } else {

                postTag = `<td class="post-title text-left ${post.notice ? 'text-bold' : ''}" no="${post.no}">${post.title}</td><td>${post.author}</td>`;
            }

            $('#post-list').append(tagHead + postTag + tagTail);
        }

        var skip = (_page - 1) * _limit;

        for (var i = skip; (i < normalList.length) && (i < skip + _limit); i++) {

            var post = normalList[i];  // 전체 배열에서 i번째 포스트 1개의 데이터를 post라는 변수에 저장한다.
            // 내 정보(nick)와 게시글의 작성자 정보가 일치(동일)하는가?\

            var postTag;

            var tagHead = `<tr class="text-center ">
                                <td  class="text-danger">${post.no}</td>`;
            var tagTail = `<td>${post.datetime}</td>
                                <td>${post.viewCnt}</td>
                            </tr>`;

            if (post.blind == true) {

                if (me.nick == post.author) { // true(참), false(거짓)

                    postTag = `<td class="post-title text-left" no="${post.no}">${post.title}</td><td>${post.author}</td>`;

                } else {

                    postTag = `<td class="post-title text-left" no="${post.no}"><i>비밀글입니다.</i></td><td>***</td>`;
                }
            } else {

                postTag = `<td class="post-title text-left ${post.notice ? 'text-bold' : ''}" no="${post.no}">${post.title}</td><td>${post.author}</td>`;
            }

            $('#post-list').append(tagHead + postTag + tagTail);
        }

        // ㅍㅔ이지 버튼

        SetPageButton(normalList);
    }

    $('#summernote').summernote({
        placeholder: '안녕하세요? 재미있는 글을 작성해주세요.',
        tabsize: 2,
        height: 300,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ]
    });

    $('#btn-post-save').click(function () {

        var title = $('#input-post-title').val();
        var category = $('#select-post-category').val();

        var author = $('#input-post-author').val();
        var secret = $('#input-post-secret').val();

        var content = $('#summernote').summernote('code');

        var blind = $('#cb-post-blind').prop('checked');
        var notice = $('#cb-post-notice').prop('checked');

        if (blind == true && notice == true) {
            return alert('비밀글과 공지글 옵션은 동시에 선택할 수 없습니다.');
        }

        var modify = $('#post-editor').attr('modify');

        if (modify == 'true') {

            var no = $('#post-editor').attr('no');

            var postList = localStorage.getItem('postList');
            if (postList == null || postList.length == 0) {
                return alert('해당 글이 존재하지 않습니다. 새로고침 후에 다시 시도해주세요.');
            }

            var postListArr = JSON.parse(postList);

            var find = false;
            for (var i = 0; i < postListArr.length; i++) {

                if (no == postListArr[i].no) { // find
                    find = true;
                    postListArr[i].title = title;
                    postListArr[i].category = category;
                    postListArr[i].content = content;
                    postListArr[i].blind = blind;
                    postListArr[i].notice = notice;

                    if (secret == postListArr[i].secret) {

                        var postListStr = JSON.stringify(postListArr);      // 전체 포스트 정보인 배열을 문자열을 변환한다.
                        localStorage.setItem('postList', postListStr);

                        return alert('수정되었습니다.');

                    } else {

                        return alert('비밀번호가 일치하지 않습니다.');
                    }
                }
            }

            alert('글이 이미 삭제되었거나 수정할 수 없습니다.');

        } else {

            var fullData = {
                'title': title,
                'category': category,
                'author': author,
                'secret': secret,
                'content': content,
                'blind': blind,
                'notice': notice,
                'datetime': GetCurrentDateTime(),
                'viewCnt': 0,
                'good': 0,
                'bad': 0,
            };

            var postList = localStorage.getItem('postList');
            if (postList == null) {
                fullData.no = 1000;                                 // 첫번째 글 작성일 때 실행되는 부분
                var newPostList = [];                               // 새로운 빈 배열을 하나 생성한다.
                newPostList.unshift(fullData);                      // 배열에 포스트 정보를 삽입한다.
                var postListStr = JSON.stringify(newPostList);      // 배열 정보를 문자열 형태로 변환한다.
                localStorage.setItem('postList', postListStr);      // 변환된 문자열을 로컬스토리지(내부)에 저장한다.
            } else {                                                // 2번째 이후부터 저장할 때 실행되는 부분
                var prePostList = JSON.parse(postList);             // 기존 저장된 문자열 정보를 본래 형식(배열)로 변환한다.
                fullData.no = prePostList[0].no + 1;                // 저장되어 있던 가장 마지막 글의 번호보다 1개 더 큰 번호 할당
                prePostList.unshift(fullData);                      // 기존 저장된 배열에 가장 앞에 새로 작성한 포스트 정보를 저장한다.
                var postListStr = JSON.stringify(prePostList);      // 전체 포스트 정보인 배열을 문자열을 변환한다.
                localStorage.setItem('postList', postListStr);      // 변환된 문자열을 다시 로컬 스토리지에 저장한다.
            }

            alert('저장되었습니다.');

            $('#post-editor').addClass('hidden');

        }

        RefreshPostList();
    });

    $('#btn-open-editor').click(function (e) {

        ResetEditor();
        // 에디터를 화면에 노출시켜야합니다.
        // div.post의 hidden 클래스를 제거한다.
        $('#input-post-author').val(me.nick);

        $('#btn-post-save').text('저장');
        $('#btn-post-save').removeClass('btn-warning').addClass('btn-success');

        $('#post-editor').attr('no', '');
        $('#post-editor').attr('modify', false);

        $('#post-editor').removeClass('hidden');

        $('#post-reader').addClass('hidden');
    });

    $('#btn-post-cancel').click(function () {

        $('#post-editor').addClass('hidden');
    });

    $('#post-list').on('click', '.post-title', function () {

        $('#post-editor').addClass('hidden');

        var no = $(this).attr('no');

        var postList = localStorage.getItem('postList');
        if (postList == null) {
            return alert('삭제되었거나 이동되어 찾을 수 없습니다.');
        }

        var postListArr = JSON.parse(postList);

        for (var i = 0; i < postListArr.length; i++) {
            // 해당 게시글 찾았을 때 
            if (no == postListArr[i].no) {

                // && : AND (그리고) 
                if (me.nick != postListArr[i].author && postListArr[i].blind == true) {
                    return alert('이 글은 작성자만 볼 수 있습니다.');
                }

                var post = postListArr[i];

                post.viewCnt = post.viewCnt + 1;

                $('#rd-post-category').text(post.category);
                $('#rd-post-no').attr('no', post.no).text(post.no);
                $('#rd-post-title').text(post.title);
                $('#rd-post-author').text(post.author);
                $('#rd-post-date').text(post.datetime);
                $('#rd-post-viewcnt').text(post.viewCnt);
                $('#rd-post-content').html(post.content);
                $('#rd-post-good-cnt').text(post.good || 0);
                $('#rd-post-bad-cnt').text(post.bad || 0);

                if (post.author != me.nick) {
                    $('#rd-post-delete').addClass('hidden');
                    $('#rd-post-modify').addClass('hidden');
                } else {
                    $('#rd-post-delete').removeClass('hidden');
                    $('#rd-post-modify').removeClass('hidden');
                }

                $('#post-reader').removeClass('hidden');

                window.scrollTo({ top: 0, left: 0 });

                var postListStr = JSON.stringify(postListArr);      // 전체 포스트 정보인 배열을 문자열을 변환한다.
                localStorage.setItem('postList', postListStr);      // 변환된 문자열을 다시 로컬 스토리지에 저장한다

                RefreshPostList();
                // 변경된 글의 정보를 다시 내부 저장소에 저장한다.
            }
        }
    });

    $('#rd-post-good').click(function () {

        // 1. 
        var no = $('#rd-post-no').attr('no');

        var postList = localStorage.getItem('postList');
        if (postList == null) {
            return alert('삭제되었거나 이동되어 찾을 수 없습니다.');
        }

        var postListArr = JSON.parse(postList);

        for (var i = 0; i < postListArr.length; i++) {
            if (no == postListArr[i].no) {

                var post = postListArr[i];

                post.good = (post.good || 0) + 1; // post.good++ , post.good += 1;

                $('#rd-post-good-cnt').text(post.good);

                var postListStr = JSON.stringify(postListArr);      // 전체 포스트 정보인 배열을 문자열을 변환한다.
                localStorage.setItem('postList', postListStr);
            }
        }
    });

    $('#rd-post-bad').click(function () {

        // 1. 
        var no = $('#rd-post-no').attr('no');

        var postList = localStorage.getItem('postList');
        if (postList == null) {
            return alert('삭제되었거나 이동되어 찾을 수 없습니다.');
        }

        var postListArr = JSON.parse(postList);

        for (var i = 0; i < postListArr.length; i++) {
            if (no == postListArr[i].no) {

                var post = postListArr[i];

                post.bad = (post.bad || 0) + 1; // post.good++ , post.good += 1;

                $('#rd-post-bad-cnt').text(post.bad);

                var postListStr = JSON.stringify(postListArr);      // 전체 포스트 정보인 배열을 문자열을 변환한다.
                localStorage.setItem('postList', postListStr);
            }
        }
    });

    $('#rd-post-delete').click(function () {

        // 1. 
        var no = $('#rd-post-no').attr('no');

        var postList = localStorage.getItem('postList');
        if (postList == null) {
            return alert('삭제되었거나 이동되어 찾을 수 없습니다.');
        }

        var postListArr = JSON.parse(postList);

        for (var i = 0; i < postListArr.length; i++) {
            if (no == postListArr[i].no) {

                var post = postListArr[i];

                if (post.author != me.nick) {
                    alert('자신의 글만 삭제할 수 있습니다.');
                    return;
                }

                postListArr.splice(i, 1);

                var postListStr = JSON.stringify(postListArr);      // 전체 포스트 정보인 배열을 문자열을 변환한다.
                localStorage.setItem('postList', postListStr);

                $('#post-reader').addClass('hidden');

                RefreshPostList();

                alert('삭제 완료되었습니다.');

                return;
            }
        }
    });

    $('#rd-post-modify').click(function () {
        // 1. 
        var no = $('#rd-post-no').attr('no');

        $('#post-editor').attr('no', no);
        $('#post-editor').attr('modify', true);

        $('#btn-post-save').text('수정');
        $('#btn-post-save').removeClass('btn-success').addClass('btn-warning');

        var postList = localStorage.getItem('postList');
        if (postList == null) {
            return alert('삭제되었거나 이동되어 찾을 수 없습니다.');
        }

        var postListArr = JSON.parse(postList);

        for (var i = 0; i < postListArr.length; i++) {
            if (no == postListArr[i].no) {

                var post = postListArr[i];

                if (post.author != me.nick) {
                    alert('자신의 글만 수정할 수 있습니다.');
                    return;
                }

                $('#input-post-title').val(post.title);
                $('#select-post-category').val(post.category);
                $('#input-post-author').val(post.author);
                $('#input-post-secret').val('');
                $('#summernote').summernote('code', post.content);
                $('#cb-post-blind').prop('checked', post.blind);
                $('#cb-post-notice').prop('checked', post.notice);

                $('#post-editor').removeClass('hidden');
                $('#post-reader').addClass('hidden');

                return;
            }
        }
    });

    $('#cb-post-blind').change(function () {
        var newChecked = $(this).prop('checked');
        if (newChecked == true) { // 블라인드 체크 박스가 상태 변경이 일어 났는데 만약 그게 선택된 상태라면
            $('#cb-post-notice').prop('checked', false);
        }
    });

    $('#cb-post-notice').change(function () {
        var newChecked = $(this).prop('checked');
        if (newChecked == true) { // 블라인드 체크 박스가 상태 변경이 일어 났는데 만약 그게 선택된 상태라면
            $('#cb-post-blind').prop('checked', false);
        }
    });


    RefreshPostList();
});