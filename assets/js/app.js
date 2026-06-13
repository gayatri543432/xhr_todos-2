const cl = console.log;

const todoForm = document.getElementById('todoForm');
const titleControl = document.getElementById('title');
const completedControl = document.getElementById('completed');
const userIdControl = document.getElementById('userId');
const addTodoBtn = document.getElementById('addTodoBtn');
const updateTodoBtn = document.getElementById('updateTodoBtn');
const todosContainer = document.getElementById('todosContainer');
const spinner = document.getElementById('spinner');

let BASE_URL = 'https://jsonplaceholder.typicode.com';
let POST_URL = `${BASE_URL}/todos`;

function snackBar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000,
    });
}
function updateSrNo() {
    let allRows = todosContainer.querySelectorAll('tr');

    allRows.forEach((row, index) => {
        row.children[0].innerText = index + 1;
    });
}
let todosArr=[]

function fetchTodos(){
    let xhr=new XMLHttpRequest()
    xhr.open("GET",POST_URL)
    xhr.send(null)
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            let res=JSON.parse(xhr.response)
            todosArr=res
            onCreateTodos(res.reverse())
        }
    }
}
fetchTodos()

function onCreateTodos(arr){
    let res='';
    arr.forEach((t,i)=>{
        res+=` <tr id="${t.id}">
                                    <td>${i+1}</td>
                                    <td>${t.title}</td>
                                    <td>${t.userId}</td>
                                    <td>${t.completed?'<i class="fa-solid fa-check text-primary"></i>Completed':'<i class="fa-solid fa-spinner text-warning"></i>Pending'}</td>
                                    <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i></td>
                                    <td><i onclick="onRemove(this)" class="fa-solid fa-trash-can fa-2x text-danger"></i></td>
                                </tr> `
    })
    todosContainer.innerHTML=res
}

function onSubmitTodo(e){
    spinner.classList.remove('d-none')
    e.preventDefault()
    let new_todo={
        title:titleControl.value ,
        userId:userIdControl.value,
        completed:completedControl.value
    }
    let xhr=new XMLHttpRequest()
    xhr.open('POST',POST_URL);
    xhr.setRequestHeader(
    'Content-Type',
    'application/json; charset=UTF-8')
    xhr.send(JSON.stringify(new_todo))
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            let res=JSON.parse(xhr.response)
            let tr=document.createElement('tr')
            tr.id= res.id
            tr.innerHTML=`  <td>${todosArr.length + 1}</td>
                                    <td>${new_todo.title}</td>
                                    <td>${new_todo.userId}</td>
                                    <td>${new_todo.completed?'<i class="fa-solid fa-check text-primary"></i>Completed':'<i class="fa-solid fa-spinner text-warning"></i>Pending'}</td>
                                    <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i></td>
                                    <td><i onclick="onRemove(this)" class="fa-solid fa-trash-can fa-2x text-danger"></i></td>`
            todosContainer.prepend(tr)
            updateSrNo()
            todoForm.reset()
            snackBar('New Todo Created Successfully..','success')
            spinner.classList.add('d-none')
        }else{
            spinner.classList.add('d-none')
            snackBar('Error..','error')

        }
    }
    xhr.onerror = function () {
            spinner.classList.add('d-none')
        snackBar('Network Error','error');
     };
}

function onEdit(e){
    spinner.classList.remove('d-none')
    let EDIT_ID=e.closest('tr').id
    localStorage.setItem('EDIT_ID',EDIT_ID)
    let EDIT_URL=`${BASE_URL}/todos/${EDIT_ID}`
    let xhr=new XMLHttpRequest()
    xhr.open('GET',EDIT_URL)
    xhr.send(null)
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            let res=JSON.parse(xhr.response)
            titleControl.value=res.title;
            userIdControl.value=res.userId;
            completedControl.value=res.completed

            addTodoBtn.classList.add('d-none')
            updateTodoBtn.classList.remove('d-none')
            spinner.classList.add('d-none')
            
        }else{
            spinner.classList.add('d-none')
            snackBar('Error..','error')
        }
    }
     xhr.onerror = function () {
            spinner.classList.add('d-none')
        snackBar('Network Error','error');
     };
}

function onUpdateTodo(){
    spinner.classList.remove('d-none')

    let UPDATE_ID=localStorage.getItem('EDIT_ID')
    let UPDATE_URL=`${BASE_URL}/todos/${UPDATE_ID}`
    let UPDATE_OBJ={
        title:titleControl.value ,
        userId:userIdControl.value,
        completed:completedControl.value
    }
    let xhr=new XMLHttpRequest()
    xhr.open('PATCH',UPDATE_URL);
    xhr.setRequestHeader(
    'Content-Type',
    'application/json; charset=UTF-8')
    xhr.send(JSON.stringify(UPDATE_OBJ))
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            let res=JSON.parse(xhr.response)
            let tr=document.getElementById(UPDATE_ID).children
            tr[1].innerText=res.title;
            tr[2].innerText=res.userId;
            tr[3].innerHTML=res.completed    ? '<i class="fa-solid fa-check text-primary"></i> Completed'
    : '<i class="fa-solid fa-spinner text-warning"></i> Pending';

            todoForm.reset()
            addTodoBtn.classList.remove('d-none')
            updateTodoBtn.classList.add('d-none')
            spinner.classList.add('d-none')
            snackBar('Updated Successfully..','success')
        }else{
            spinner.classList.add('d-none')
            snackBar('Error..','error')
        }
    }
}

function onRemove(e){
    Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed) {
    spinner.classList.remove('d-none')
    let REMOVE_ID=e.closest('tr').id
    let REMOVE_URL=`${BASE_URL}/posts/${REMOVE_ID}`
    let xhr=new XMLHttpRequest()
    xhr.open('DELETE',REMOVE_URL)
    xhr.send(null)
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            document.getElementById(REMOVE_ID).remove()
           updateSrNo()
            spinner.classList.add('d-none')
            snackBar('Deleted Successfully..','success')
        }else{
            spinner.classList.add('d-none')
            snackBar('Error..','error')
        }
    }
  }
});
}
todoForm.addEventListener('submit', onSubmitTodo);

updateTodoBtn.addEventListener('click', onUpdateTodo);