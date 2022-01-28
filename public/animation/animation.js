// drag & drop file

var targentFile = null;

function ActiveDropZone(){
    var dropArea= document.querySelector('#drop-area');
    dropArea.classList.add('active');
}

function InactiveDropZone(){
    var dropArea= document.querySelector('#drop-area');
    dropArea.classList.remove('active');
}

function onFileDrop(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    console.log('onFileDrop', ev);
    console.log(ev.dataTransfer.files[0]);

    var uploadList = document.querySelector('#upload-list');
    uploadList.textContent += ev.dataTransfer.files[0].name;

    //파일을 브라우저 내에 보여주는 방법

    var profileUrl = URL.createObjectURL(ev.dataTransfer.files[0]);

    var img = document.querySelector('#img');
        img.src = profileUrl; //이미지 추가

    targentFile = ev.dataTransfer.files[0];
}

function SendImage() {
    if( targentFile == null ) {
        return alert('파일을 먼저 등록해주세요');
    }
    
    // 파일을 서버에 전송하는 방법(jquery)
    var fd = new FormData();
    fd.append('profileImg', ev.dataTransfer.files[0]);

    $.ajax({
        method : 'POST',
        url : '/upload',
        data : fd
    }).done( function (response) {
        if(response == sucess) {
            
            console.log('test ok')
        }
    })
}

function DragOver (ev) { //이 함수가 없으면 파일이 처리가 안되고 브라우저에 열린다. 
    ev.stopPropagation();
    ev.preventDefault();
}


window.addEventListener('load', function(){
    // console.log('test');
    // var dropArea = document.querySelector('#drop-area');

    // dropArea.addEventListener('drop', function(ev) {
    //     console.log('drop');
    //     console.log(ev);
    // });

    // dropArea.addEventListener('dragstart', function(ev) {
    //     console.log('dragstart');
    //     console.log(ev);
    // });

    // dropArea.addEventListener('dragover', function(ev) {
    //     console.log('dragover');
    //     console.log(ev);
    // });

    // var dragItem = document.querySelector('#drag-item')

    // dragItem.addEventListener('dragstart', function(ev) {
    //     console.log('dragstart');
    //     console.log(ev);
    // });

    // dragItem.addEventListener('dragend', function(ev) {
    //     console.log('dragend');
    //     console.log(ev);
    // });
})

