$(document).ready(function () {

    var _page = 1;          // 현재 페이지 정보를 저장
    var _limit = 10;        // 페이지당 게시글 최대 개수
    var _maxPageCnt = 7;    // 하단 페이지 네비게이션 버튼 최대 개수
    var _lastPageNum = 0;   // 마지막 페이지 번호
    var _keyword = '';      // 검색어
    var _searchType = '';   // 검색구분(제목, 내용, 저자)

    function getDateTimeFormat(dateSrc) {
        return new Date(dateSrc).toISOString().split('T')[0];
    } 

    function ResetEditor() {
        $('#input-post-title').val('');
        $('#select-post-category').val('잡담');
        $('#summernote').summernote('code', '');
        $('#cb-post-blind').prop('checked', false);
        $('#cb-post-notice').prop('checked', false);
    }

    $('#btn-search-go').click(function () {

        var stype = $('#select-search-type').val();
        var keyword = $('#input-search-keyword').val();

        _keyword = keyword;
        _searchType = stype;

        RefreshPostList();
    });

    function SetPageButton(totalCnt) {

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

        // 글번호 작성자 조회수 등등

        $.ajax({
            method: 'GET',
            url: '/board/list',
            data: {
                page: _page,
                limit: _limit,
                keyword: _keyword, // 있으면 보내주고 없으면 빈문자열
                searchType: _searchType,
            }
        }).done(function (response) {

            $('#post-list').empty();

            var listGroup = [response.noticeList, response.postList];

            for(var k = 0; k < listGroup.length; k++) {
               var list = listGroup[k];
               
               for (var i = 0; i < list.length; i++) {

                    var post = list[i];  // 전체 배열에서 i번째 포스트 1개의 데이터를 post라는 변수에 저장한다.
                    // 내 정보(nick)와 게시글의 작성자 정보가 일치(동일)하는가?\

                    var postTag = `<tr class="text-center ">`;
                    
                    postTag += `<td  class="text-danger">${post.no}</td>`;
                    if(post.notice) {
                        postTag += `<td class="post-title text-left text-bold" no="${post.no}" notice="true">${post.title}</td>`;
                    } else if(post.blind && post.secret) {
                        postTag += `<td class="post-title text-left" no="${post.no}"><em>${post.title}</em></td>`;
                    } else {
                        postTag += `<td class="post-title text-left" no="${post.no}">${post.title}</td>`;
                    }
                    postTag += `<td>${post.author}</td>`;
                    postTag += `<td>${getDateTimeFormat(post.datetime)}</td>`;
                    postTag += `<td class="text-primary">${post.good}</td>`;
                    postTag += `<td class="text-danger">${post.bad}</td>`;
                    postTag += `<td>${post.viewCnt}</td>`;

                    postTag += `</tr>`;

                    $('#post-list').append(postTag);
                }
            }

            SetPageButton(response.totalCnt);
        });

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

        var content = $('#summernote').summernote('code');

        var blind = $('#cb-post-blind').prop('checked');
        var notice = $('#cb-post-notice').prop('checked');

        if (blind == true && notice == true) {
            return alert('비밀글과 공지글 옵션은 동시에 선택할 수 없습니다.');
        }

        var modify = $('#post-editor').attr('modify');

        if (modify == 'true') {

            var no = $('#post-editor').attr('no');
            var isNotice = $('#post-editor').attr('notice');

            //GET(서버에서 데이터 요청) POST(먼가 새로 추가하거나 어떤 기능이 필요할때) PUT(수정할때, 변경 같은 게 일어날 때) DELETE(먼가 정보를 삭제 하고 싶을때)

            $.ajax({
                method: 'PUT',
                url: '/board/modify',
                data: {
                    no: no,
                    isNotice: isNotice,
                    title: title,
                    category: category,
                    content: content,
                    blind: blind,
                    notice: notice,
                }
            }).done(function (response) {
                if (response.success == true) {
                    alert('수정되었습니다.');
                    $('#post-editor').addClass('hidden');
                    RefreshPostList();
                } else {
                    alert('글 수정에 실패했습니다.');
                }
            });

        } else {

            $.ajax({
                method: 'POST',
                url: '/board/add',
                data: {
                    'title': title,
                    'category': category,
                    'content': content,
                    'blind': blind,
                    'notice': notice,
                }
            }).done(function (response) {
                if (response.success == true) {
                    alert('저장되었습니다.');
                    $('#post-editor').addClass('hidden');
                    RefreshPostList();
                } else {
                    alert('글 작성에 실패했습니다.');
                }
            });
        }
    });

    $('#btn-open-editor').click(function (e) {

        ResetEditor();
        
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
        var isNotice = $(this).attr('notice');

        $.ajax({
            method : 'GET',
            url : '/board/post',
            data : {
                no : no,
                isNotice: isNotice,
            }
        }).done(function (response){

            if(response.success == true) {

                var post = response.post;

                $('#rd-post-no').attr('no', post.no).text(post.no);
                $('#rd-post-no').attr('notice', post.notice);

                $('#rd-post-category').text(post.category);
                $('#rd-post-title').text(post.title);
                $('#rd-post-author').text(post.author);
                $('#rd-post-date').text(getDateTimeFormat(post.datetime));
                $('#rd-post-viewcnt').text(post.viewCnt);
                $('#rd-post-content').html(post.content);
                $('#rd-post-good-cnt').text(post.good || 0);
                $('#rd-post-bad-cnt').text(post.bad || 0);

                if (post.owner) {
                    $('#rd-post-delete').removeClass('hidden');
                    $('#rd-post-modify').removeClass('hidden');
                } else {
                    $('#rd-post-delete').addClass('hidden');
                    $('#rd-post-modify').addClass('hidden');
                }

                $('#post-reader').removeClass('hidden');

                window.scrollTo({ top: 0, left: 0 });
            } else {
                alert(response.msg);
            }
        });
    });

    $('#rd-post-good').click(function () {

        var no = $('#rd-post-no').attr('no');
        var isNotice = $('#rd-post-no').attr('notice');

        $.ajax({
            method : 'PUT',
            url : '/board/stat',
            data : {
                no : no,
                isNotice: isNotice,
                type: 'good',
            }
        }).done(function (response){
            if(response.success == true) {
                $('#rd-post-good-cnt').text(response.good);
                $('#rd-post-bad-cnt').text(response.bad);
            } else {
                alert(response.msg);
            }
        });
    });

    $('#rd-post-bad').click(function () {
 
        var no = $('#rd-post-no').attr('no');
        var isNotice = $('#rd-post-no').attr('notice');

        $.ajax({
            method : 'PUT',
            url : '/board/stat',
            data : {
                no : no,
                isNotice: isNotice,
                type: 'bad',
            }
        }).done(function (response){
            if(response.success == true) {
                $('#rd-post-good-cnt').text(response.good);
                $('#rd-post-bad-cnt').text(response.bad);
            } else {
                alert(response.msg);
            }
        });
    });

    $('#rd-post-delete').click(function () {

        // 1. 
        var no = $('#rd-post-no').attr('no');
        var isNotice = $('#rd-post-no').attr('notice');

        $.ajax({
            method: 'DELETE',
            url: '/board/delete',
            data: {
                no: no,
                isNotice: isNotice
            }
        }).done(function (response) {
            if (response.success == true) {
                alert('삭제 완료되었습니다.');
                $('#post-reader').addClass('hidden');
                RefreshPostList();
            } else {
                alert('삭제되었거나 이동되어 찾을 수 없습니다.');
            }
        });

        // var postList = localStorage.getItem('postList');
        // if (postList == null) {
        //     return alert('삭제되었거나 이동되어 찾을 수 없습니다.');
        // }

        // var postListArr = JSON.parse(postList);

        // for (var i = 0; i < postListArr.length; i++) {
        //     if (no == postListArr[i].no) {

        //         var post = postListArr[i];

        //         if (post.author != me.nick) {
        //             alert('자신의 글만 삭제할 수 있습니다.');
        //             return;
        //         }

        //         postListArr.splice(i, 1);

        //         var postListStr = JSON.stringify(postListArr);      // 전체 포스트 정보인 배열을 문자열을 변환한다.
        //         localStorage.setItem('postList', postListStr);

        //         $('#post-reader').addClass('hidden');

        //         RefreshPostList();

        //         alert('삭제 완료되었습니다.');

        //         return;
        //     }
        // }
    });

    $('#rd-post-modify').click(function () {
        // 1. 
        var no = $('#rd-post-no').attr('no');
        var isNotice = $('#rd-post-no').attr('notice');

        $.ajax({
            method: 'POST',
            url: '/board/modify-confirm', // 서버에 해당 글의 작성자가 맞는지 확인
            data: {
                no: no,
                isNotice: isNotice
            }
        }).done(function (response) {
            if(response.success == true) {

                var post = response.post;

                $('#post-editor').attr('no', no);
                $('#post-editor').attr('notice', post.notice);

                $('#post-editor').attr('modify', true);

                $('#btn-post-save').text('수정');
                $('#btn-post-save').removeClass('btn-success').addClass('btn-warning');

                $('#input-post-title').val(post.title);
                $('#select-post-category').val(post.category);
                $('#summernote').summernote('code', post.content);
                $('#cb-post-blind').prop('checked', post.blind);
                $('#cb-post-notice').prop('checked', post.notice);

                $('#post-editor').removeClass('hidden');
                $('#post-reader').addClass('hidden');
            } else {
                alert('작성자만 수정할 수 있습니다.');
            }
        });

        // var postList = localStorage.getItem('postList');
        // if (postList == null) {
        //     return alert('삭제되었거나 이동되어 찾을 수 없습니다.');
        // }

        // var postListArr = JSON.parse(postList);

        // for (var i = 0; i < postListArr.length; i++) {
        //     if (no == postListArr[i].no) {

        //         var post = postListArr[i];

        //         if (post.author != me.nick) {
        //             alert('자신의 글만 수정할 수 있습니다.');
        //             return;
        //         }

        //         $('#input-post-title').val(post.title);
        //         $('#select-post-category').val(post.category);
        //         $('#input-post-author').val(post.author);
        //         $('#input-post-secret').val('');
        //         $('#summernote').summernote('code', post.content);
        //         $('#cb-post-blind').prop('checked', post.blind);
        //         $('#cb-post-notice').prop('checked', post.notice);

        //         $('#post-editor').removeClass('hidden');
        //         $('#post-reader').addClass('hidden');

        //         return;
        //     }
        // }
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