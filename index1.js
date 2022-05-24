/* 构造函数形式实现效果
    1.添加数据
        获取模态框内填写的内容,添加到表格里
    2.删除数据
        把删除按钮所在的父元素删除掉
    3.修改数据
        弹出模态框,将现有的数据显示在模态框里.修改后再添加到表格里
    4.获取数据
        将数据用axios.get获取到
    5.分页
        将当前页和页面条数列出来,根据当前页和条数在数据中截取相应数据,然后动态生成html
*/
//获取数据
let tbody = document.querySelector('tbody');
let currentPage = 1;
let pageSize = 4;
function GetData(currentPage) {
    axios.get('http://localhost:3000/problem')
        .then(res => {
            let html = '';
            const { data, status } = res;
            if (status == 200) {
                dataPage(data);
                let spList = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                spList.forEach(ele => {
                    html += `
                  <tr>
                    <td>${ele.id}</td>
                    <td>${ele.title}</td>
                    <td>${ele.pos}</td>
                    <td>${ele.idea}</td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm btn-del">
                            <span class="glyphicon glyphicon-trash btn-del" aria-hidden="true"></span>
                        </button>
                        <button type="button" class="btn btn-success btn-sm btn-edit">
                            <span class="glyphicon glyphicon-pencil btn-edit" aria-hidden="true"></span>
                        </button>
                    </td>
                  </tr>
                `
                    tbody.innerHTML = html;
                });
            }

        })
}
GetData(currentPage);
//GetData(2);
//分页效果
 function dataPage(data) {
    let ul = $('#ulPage');
    let page = Math.ceil(data.length / pageSize);
    // if(page < 1) page = 1;
    let pageHtml = `
        <li>
            <a href="javascript:;" aria-label="Previous" >
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
        `;
    for (let i = 1; i <= page; i++) {
        pageHtml += `
            <li><a href="javascript:;">${i}</a></li>
        `;
    }
    pageHtml += `
        <li>
          <a href="javascript:;" aria-label="Next">
             <span aria-hidden="true">&raquo;</span>
          </a>
        </li>    
    `;
    ul[0].innerHTML = pageHtml;
    //让分页栏居中 JS实现代码,但是用JS代码更方便些,ul里面的刚生成就获取宽度可以获取,
    //但是不在同一函数有可能获取不到,因为函数的异步执行;
    let dw = document.body.offsetWidth;
    let uw = ul.outerWidth();
    ul.css('left',(dw-uw)/2);

}


//切换页面
$('#ulPage')[0].addEventListener('click', togglePage);
function togglePage(e) {
    let tar = e.target;
    let lis = document.querySelectorAll('#ulPage li');

    // console.log(tar.innerText);
    if (tar.innerText.trim() == '«') {
        if (currentPage == 1) return;
        currentPage--;
        new GetData(currentPage);
    } else if (tar.innerText.trim() == '»') {
        if (currentPage == lis.length - 1) return;
        currentPage++;
        new GetData(currentPage);
    } else {
        currentPage = tar.innerText;
        // console.log(currentPage)
        new GetData(currentPage);

    }
}


//添加数据
let saveData = document.querySelector('#save-data');
saveData.addEventListener('click', AddData)
function AddData() {
    let form = document.forms[0].elements;
    let title = form.title.value.trim();
    let pos = form.pos.value.trim();
    let idea = form.idea.value.trim();
    axios.post('http://localhost:3000/problem', {
        title,
        pos,
        idea
    }).then(res2 => {
        if (res2.status == 201) {
            location.reload();
        }
    })
}

//删除数据 把删除按钮所在的父元素删除掉 用事件委托 必须是在数据库里删除数据
let btnConfrim = document.querySelector('.btn-confrim');
tbody.addEventListener('click', DelData);

function DelData(e) {
    let tar = e.target;
    if (tar.classList.contains('btn-del')) new DelDetail();
    if (tar.classList.contains('btn-edit')) new EditDetail(tar);
    btnConfrim.addEventListener('click', ConfrimDel.bind(tar));
}

function DelDetail() {
    $('#delModal').modal('show');
}

function ConfrimDel() {
    let id = 0;
    console.log(this);
    if (this.nodeName == 'SPAN') {
        let tr = this.parentNode.parentNode.parentNode;
        id = tr.firstElementChild.innerHTML;
    }
    if (this.nodeName == 'BUTTON') {
        let tr = this.parentNode.parentNode;
        id = tr.firstElementChild.innerHTML;
    }
    axios.delete('http://localhost:3000/problem/' + id)
        .then(res3 => {
            if (res3.status == 200) {
                location.reload();
            }
        })
}

//修改数据  弹出模态框,将现有的数据显示在模态框里.修改后再添加到表格里
function EditDetail(target) {
    $('#editModal').modal('show');
    let tr = '';
    if (target.nodeName == 'SPAN') {
        tr = target.parentNode.parentNode.parentNode;
    }
    if (target.nodeName == 'BUTTON') {
        tr = target.parentNode.parentNode;
    }
    let ch = tr.children;
    let id = ch[0].innerHTML;
    let title = ch[1].innerHTML;
    let pos = ch[2].innerHTML;
    let idea = ch[3].innerHTML;
    let form = $('#editModal form')[0].elements;
    form.title.value = title;
    form.pos.value = pos;
    form.idea.value = idea;
    form.id = id;
}
// 修改后再添加到表格里
$('#edit-data')[0].addEventListener('click', EditData);
function EditData() {
    let { id, title, pos, idea } = $('#editModal form')[0].elements;
    let titleVal = title.value.trim();
    let posVal = pos.value.trim();
    let ideaVal = idea.value.trim();
    if (!titleVal || !posVal || !ideaVal) {
        throw new Error('每一个输入框都不能为空');
    }
    axios.put('http://localhost:3000/problem/' + id, {
        title: titleVal,
        pos: posVal,
        idea: ideaVal
    })
        .then(res3 => {
            if (res3.status == 200) {
                location.reload();
            }
        })
}

