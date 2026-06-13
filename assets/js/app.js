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
        timer: 1500,
        showConfirmButton: false
    });
}

function getStatusBadge(status) {
    return status
        ? '<span class="badge badge-success">Completed</span>'
        : '<span class="badge badge-warning">Pending</span>';
}

function resetForm() {
    todoForm.reset();
    addTodoBtn.classList.remove('d-none');
    updateTodoBtn.classList.add('d-none');
    localStorage.removeItem('Edit_ID');
}

function fetchTodos() {

    spinner.classList.remove('d-none');

    let xhr = new XMLHttpRequest();

    xhr.open('GET', POST_URL);
    xhr.send(null);

    xhr.onload = function () {

        spinner.classList.add('d-none');

        if (xhr.status >= 200 && xhr.status <= 299) {

            let res = JSON.parse(xhr.response);
            createTodo([...res].reverse());

        } else {
            snackBar('Failed to fetch todos', 'error');
        }
    };

    xhr.onerror = function () {
        spinner.classList.add('d-none');
        snackBar('Network Error', 'error');
    };
}

fetchTodos();

function createTodo(arr) {

    let result = '';

    arr.forEach((todo, index) => {

        result += `
            <tr id="${todo.id}">
                <td>${index + 1}</td>
                <td>${todo.title}</td>
                <td>${todo.userId}</td>
                <td>${getStatusBadge(todo.completed)}</td>
                <td>
                    <i class="fa-regular fa-pen-to-square text-primary"
                    onclick="OnEdit(this)"></i>
                </td>
                <td>
                    <i class="fa-solid fa-trash text-danger"
                    onclick="onRemove(this)"></i>
                </td>
            </tr>
        `;
    });

    todosContainer.innerHTML = result;
}

function onSubmitTodo(e) {

    e.preventDefault();

    if (
        titleControl.value.trim() === '' ||
        userIdControl.value.trim() === ''
    ) {
        snackBar('All fields are required', 'warning');
        return;
    }

    spinner.classList.remove('d-none');

    let newTodo = {
        title: titleControl.value,
        userId: userIdControl.value,
        completed: completedControl.value === 'true'
    };

    let xhr = new XMLHttpRequest();

    xhr.open('POST', POST_URL);

    xhr.setRequestHeader(
        'Content-Type',
        'application/json; charset=UTF-8'
    );

    xhr.send(JSON.stringify(newTodo));

    xhr.onload = function () {

        spinner.classList.add('d-none');

        if (xhr.status >= 200 && xhr.status <= 299) {

            let res = JSON.parse(xhr.response);

            let tr = document.createElement('tr');

            tr.id = res.id;

            tr.innerHTML = `
                <td>${todosContainer.children.length + 1}</td>
                <td>${newTodo.title}</td>
                <td>${newTodo.userId}</td>
                <td>${getStatusBadge(newTodo.completed)}</td>
                <td>
                    <i class="fa-regular fa-pen-to-square text-primary"
                    onclick="OnEdit(this)"></i>
                </td>
                <td>
                    <i class="fa-solid fa-trash text-danger"
                    onclick="onRemove(this)"></i>
                </td>
            `;

            todosContainer.prepend(tr);

            let allRows = todosContainer.querySelectorAll('tr');

            allRows.forEach((row, index) => {
                row.children[0].textContent = index + 1;
            });

            resetForm();

            snackBar('New Todo Created Successfully', 'success');

        } else {
            snackBar('Failed to create todo', 'error');
        }
    };

    xhr.onerror = function () {
        spinner.classList.add('d-none');
        snackBar('Network Error', 'error');
    };
}

function onRemove(ele) {

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

        if (result.isConfirmed) {

            spinner.classList.remove('d-none');

            let removeId = ele.closest('tr').id;
            let removeUrl = `${POST_URL}/${removeId}`;

            let xhr = new XMLHttpRequest();

            xhr.open('DELETE', removeUrl);
            xhr.send(null);

            xhr.onload = function () {

                spinner.classList.add('d-none');

                if (xhr.status >= 200 && xhr.status <= 299) {

                    document.getElementById(removeId).remove();

                    let allRows = todosContainer.querySelectorAll('tr');

                    allRows.forEach((row, index) => {
                        row.children[0].textContent = index + 1;
                    });

                    snackBar('Todo Deleted Successfully', 'success');

                } else {
                    snackBar('Failed to delete todo', 'error');
                }
            };

            xhr.onerror = function () {
                spinner.classList.add('d-none');
                snackBar('Network Error', 'error');
            };
        }
    });
}

function OnEdit(ele) {

    spinner.classList.remove('d-none');

    let editId = ele.closest('tr').id;

    localStorage.setItem('Edit_ID', editId);

    let editUrl = `${POST_URL}/${editId}`;

    let xhr = new XMLHttpRequest();

    xhr.open('GET', editUrl);
    xhr.send(null);

    xhr.onload = function () {

        spinner.classList.add('d-none');

        if (xhr.status >= 200 && xhr.status <= 299) {

            let res = JSON.parse(xhr.response);

            titleControl.value = res.title;
            userIdControl.value = res.userId;
            completedControl.value = res.completed;

            addTodoBtn.classList.add('d-none');
            updateTodoBtn.classList.remove('d-none');

        } else {
            snackBar('Failed to fetch todo', 'error');
        }
    };

    xhr.onerror = function () {
        spinner.classList.add('d-none');
        snackBar('Network Error', 'error');
    };
}

function onUpdateTodo() {

    if (
        titleControl.value.trim() === '' ||
        userIdControl.value.trim() === ''
    ) {
        snackBar('All fields are required', 'warning');
        return;
    }

    spinner.classList.remove('d-none');

    let updatedId = localStorage.getItem('Edit_ID');

    let updatedUrl = `${POST_URL}/${updatedId}`;

    let updatedObj = {
        title: titleControl.value,
        userId: userIdControl.value,
        completed: completedControl.value === 'true'
    };

    let xhr = new XMLHttpRequest();

    xhr.open('PATCH', updatedUrl);

    xhr.setRequestHeader(
        'Content-Type',
        'application/json; charset=UTF-8'
    );

    xhr.send(JSON.stringify(updatedObj));

    xhr.onload = function () {

        spinner.classList.add('d-none');

        if (xhr.status >= 200 && xhr.status <= 299) {

            let tr = document.getElementById(updatedId).children;

            tr[1].innerText = updatedObj.title;
            tr[2].innerText = updatedObj.userId;
            tr[3].innerHTML = getStatusBadge(updatedObj.completed);

            resetForm();

            snackBar('Todo Updated Successfully', 'success');

        } else {
            snackBar('Failed to update todo', 'error');
        }
    };

    xhr.onerror = function () {
        spinner.classList.add('d-none');
        snackBar('Network Error', 'error');
    };
}

todoForm.addEventListener('submit', onSubmitTodo);
updateTodoBtn.addEventListener('click', onUpdateTodo);