export default class Pos {
    constructor() {
        this.$('#save-data').addEventListener('click',this.saveData);        
        this.getData(Pos.currentPage);
        this.$('.table tbody').addEventListener('click',this.delData.bind(this));
        this.$('.btn-confrim').addEventListener('click',this.confirmDel.bind(this));
        this.$('#edit-data').addEventListener('click',this.confirmEdit.bind(this));
        // 此时的this指的是实例化对象
        this.$('#ulPage').addEventListener('click',this.togglePage.bind(this));
    }
    $(ele){
        let res1 = document.querySelectorAll(ele);
        return res1.length == 1 ? res1[0] : res1;    
    } 
    saveData(){
        let form = document.forms[0].elements;
        // console.log(form);
        let title = form.title.value.trim();
        let pos = form.pos.value.trim();
        let idea = form.idea.value.trim();
        if(!title || !pos || !idea){
            throw new Error('输入框不能为空');
        }
        //joson-server中，post是添加数据的
        axios.post('http://localhost:3000/problem',{
            title,
            pos,
            idea
        }).then(res2=>{
            if(res2.status == 201){
                location.reload();
            }
        })
        

    }
    delData(ele){
        // console.log(1);
       let tar = ele.target;
       if(tar.classList.contains('btn-del')) this.delDtail(tar);
       if(tar.classList.contains('btn-edit')) this.editDetail(tar);
    }
    delDtail(target){
        this.target = target;
        $('#delModal').modal('show');
    
    }
    editDetail(target){
        $('#editModal').modal('show');    
        let tr = '';
        if(target.nodeName == 'SPAN'){
            tr = target.parentNode.parentNode.parentNode;
        }
        if(target.nodeName == 'BUTTON'){
            tr = target.parentNode.parentNode;
        }
        // console.log(tr);
        let ch = tr.children;
        // console.log(ch)
        let id = ch[0].innerHTML;
        let title = ch[1].innerHTML;
        // console.log(title)
        let pos = ch[2].innerHTML;
        let idea = ch[3].innerHTML;

        let form = this.$('#editModal form').elements;
        console.log(form);
        form.title.value = title;
        form.pos.value = pos;
        form.idea.value = idea;
        this.id = id;
    }

    confirmDel(){
        let id = 0;
        if(this.target.nodeName == 'SPAN'){
            let tr = this.target.parentNode.parentNode.parentNode;
            id = tr.firstElementChild.innerHTML;
        }
        if(this.target.nodeName == 'BUTTON'){
            let tr = this.target.parentNode.parentNode;
            id = tr.firstElementChild.innerHTML;
        }
        axios.delete(' http://localhost:3000/problem/'+id).then(res=>{
            if(res.status == 200){
                location.reload();
            }
        })
    }

    confirmEdit(){
        let {title, pos, idea} = this.$('#editModal form').elements;
        let titleVal = title.value.trim();
        let posVal = pos.value.trim();
        let ideaVal = idea.value.trim();
        if(!titleVal || !posVal || !ideaVal){
            throw new Error('任何一行信息都不能为空');
        }
        axios.put('http://localhost:3000/problem/'+ this.id, {
            title:titleVal,
            pos:posVal,
            idea:ideaVal
        }).then(res=>{
            if(res.status == 200){
                location.reload();
            }
        })
    }
    
    static pageSize = 5;
    static currentPage = 1;
    
    dataPage(data){      
       let  ulPage = document.querySelector('#ulPage');
       let total = Math.ceil(data.length / Pos.pageSize);
       let pageHtml = `
            <li>
                <a href="javascript:;" aria-label="Previous" >
                  <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
       `;
        for(let i = 1; i <= total; i++){
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
        ulPage.innerHTML = pageHtml;
    }

    togglePage(e){
        let tar1 = e.target;
        // console.log(tar1.innerHTML)
         var lis = document.querySelectorAll('#ulPage li');
         console.log(tar1.innerText);
         console.log(lis);
        if(tar1.innerText.trim() == '«') {
            if(Pos.currentPage == 1) return;
            Pos.currentPage--;
            this.getData(Pos.currentPage);
        } else if(tar1.innerText.trim() =='»'){
            if(Pos.currentPage == lis.length) return;
            Pos.currentPage++;
            this.getData(Pos.currentPage);
        }else{          
            Pos.currentPage = tar1.innerHTML;
            // console.log(Pos.currentPage);
            this.getData(tar1.innerHTML);
        }
        
        // console.log(tar1.innerHTML);
    }
    getData(currentPage) {
        //get是获取数据的

        axios.get('http://localhost:3000/problem')
            .then(res => {
                var tbody = document.querySelector('tbody');
                let { data, status } = res;
                // console.log(response);
                let html = '';
                if (status == 200) {
                    this.dataPage(data);
                    let spList = data.slice((currentPage - 1)*Pos.pageSize, currentPage*Pos.pageSize);
                    spList.forEach(ele => {
                        html += `
                          <tr>
                            <th>${ele.id}</th> 
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
                        `;
                        tbody.innerHTML = html;
                    })
                }
            })
    }
}
new Pos;

