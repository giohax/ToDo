
/** 
 * This is the Api instance which pulls data from an API or local storage
 */
const Api = (() => {

	const baseUrl = "https://jsonplaceholder.typicode.com";
	const path = "todos";

    const LOCAL_STORAGE_TASK_KEY = 'tasks.tasks'; //Setting the local storage key

    //This method grabs todo list from an API
	const getTodos = async () => {
		const res = await fetch([baseUrl,path].join('/'));
		const data = await res.json();
		return data;
	}

    //This method grabs todo list from local storage
    const getLocalTodos = () => {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_TASK_KEY));
    }

	return {
		getTodos,
        getLocalTodos,
        LOCAL_STORAGE_TASK_KEY,
	};
})();

/**
 * This is the View instance which handles the creation of DOM elements and selecting DOM elements
 */

const View = (() => {

    //This object contains the needed dom elements for manipulation
	const domstr = {
		tasklist: '[data-task-container]',
		deletebutton: '[data-delete-button]',
		inputtask: '[data-new-task-input]',
		inputform: '[data-new-task-form]',
        resetdata: '[data-reset-button]',
        fetchdata: '[data-fetch-button]',
        datetoday: '[data-date-today]'
	};

    //These arrays stores the date strings
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


    //This method renders the current date on the app
    const renderDate = () => {
        let today = new Date();
        dateToday = document.querySelector(domstr.datetoday);
        dateToday.innerText = `${day[today.getDay()]}, ${month[today.getMonth()]} ${today.getDate()}`;
    };

    //This method renders the given HTML template
	const render = (ele, tmp) => {
		ele.innerHTML = tmp;
	};

    //This method creates an HTML template with the given array
	const createTmp = (arr) => {
		let template = '';

		arr.forEach(task => {
			template += `
			<li class="task">
				<div class="task-info">
					<input type="checkbox" id="${task.id}" ${task.completed ? 'checked ': ''} />
					<label for="${task.id}"><span class="custom-checkbox"></span>${task.title}</label>
				</div>
				<div class="task-delete">
					<span class="material-symbols-outlined" id="${task.id}" data-delete-button>
						delete
					</span>
				</div>
			</li>`;
			
		});

		return template;
	}

	return {
		domstr,
		render,
		createTmp,
        renderDate
	};
})();


/**
 * This is the Model instance which handles the state of tasks and saving data to local storage
 */
const Model = ((api, view) => {

	class State {
		#tasklist = [];

		get tasklist() {
			return this.#tasklist;
		}
		set tasklist(newlist) {
			this.#tasklist = [...newlist];
            saveTodo(this.#tasklist);
			const taskContainer = document.querySelector(view.domstr.tasklist);
			const tmp = view.createTmp(this.#tasklist);
			view.render(taskContainer, tmp);
		}
	}

	const getTodos = api.getTodos;
    const getLocalTodos = api.getLocalTodos;

    //This method saves the given list into local storage
    const saveTodo = (list) => {
        localStorage.setItem(api.LOCAL_STORAGE_TASK_KEY, JSON.stringify(list));
    }

	return {
		getTodos,
        getLocalTodos,
		State,
	};
})(Api, View);


/**
 * This is the Controller instance which handles the interactive and methodal elements of the app.
 */
const Controller = ((model, view) => {

	const state = new model.State();

    //This is a button methodality which resets the task list.
    const resetData = () => {
        const resetButton = document.querySelector(view.domstr.resetdata);
        resetButton.addEventListener('click', e => {
            state.tasklist = [];
        });
    }

    //This is a button methodality which grabs the data from the API.
    const fetchData = () => {
        const fetchButton = document.querySelector(view.domstr.fetchdata);
        fetchButton.addEventListener('click', e => {
            model.getTodos().then(tasklist => {
                state.tasklist = tasklist;
            });
        })
    }

    //This method saves the current task list everytime a task is checked off
    const completeTodo = () => {
        const taskContainer = document.querySelector(view.domstr.tasklist);
        taskContainer.addEventListener('click', e => {
       
            if(e.target.parentElement.className === 'task-info'){
                if(e.target.id) {
                    const selectedTask = state.tasklist.find(task => +task.id === +e.target.id);
                    selectedTask.completed = e.target.checked;
                    state.tasklist = state.tasklist;
                }
            }
		});
    }


    //This method creates a new task object
	const createTask = (name) => {
		return { id: Date.now().toString(), title: name, completed: false };
	}


    //This input methodality adds a new task into the task list
	const addTodo = () => {
		const inputform = document.querySelector(view.domstr.inputform);
		const inputtask = document.querySelector(view.domstr.inputtask);
		inputform.addEventListener('submit', e=> {
			e.preventDefault();
			const taskname = inputtask.value;
			if(inputtask == null || inputtask === "") return;
			inputtask.value = null;
			state.tasklist = [createTask(taskname), ...state.tasklist];
		});
	}

    //This button methodality deletes the specified task
	const deleteTodo = () => {
		const taskContainer = document.querySelector(view.domstr.tasklist);
		taskContainer.addEventListener('click', e => {
			if(e.target.className.toLowerCase() === 'material-symbols-outlined'){
				state.tasklist = state.tasklist.filter(task => +task.id !== +e.target.id);
			}			
		});
	};

    //This method grabs data from local storage if it already exists
	const init = () => {

        view.renderDate();

        if(model.getLocalTodos()){
            state.tasklist = model.getLocalTodos();
        }
	}

    //This method runs all the necessary methods at the start of the program
	const bootstrap = () => {
		init();
		deleteTodo();
		addTodo();
        completeTodo();
        resetData();
        fetchData();
	};

	return {bootstrap};
})(Model, View);

Controller.bootstrap();






