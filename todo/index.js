
const Api = (() => {

	const baseUrl = "https://jsonplaceholder.typicode.com";
	const path = "todos";

	const getTodos = async () => {
		const res = await fetch([baseUrl,path].join('/'));
		const data = await res.json();
		return data;
	}

	return {
		getTodos,
	};
})();


const View = (() => {

	const domstr = {
		tasklist: '[data-task-container]',
		deletebutton: '[data-delete-button]',
		inputtask: '[data-new-task-input]',
		inputform: '[data-new-task-form]'
	}

	const render = (ele, tmp) => {
		ele.innerHTML = tmp;
	}

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
	};
})();

const Model = ((api, view) => {

	class State {
		#tasklist = [];

		get tasklist() {
			return this.#tasklist;
		}
		set tasklist(newlist) {
			this.#tasklist = [...newlist];
			const taskContainer = document.querySelector(view.domstr.tasklist);
			const tmp = view.createTmp(this.#tasklist);
			view.render(taskContainer, tmp);

		}
	}

	const getTodos = api.getTodos;

	return {
		getTodos,
		State,
	};
})(Api, View);

const Controller = ((model, view) => {

	const state = new model.State();


	const createTask = (name) => {
		return { id: Date.now().toString(), title: name, completed: false };
	}

	const addTodo = () => {
		const inputform = document.querySelector(view.domstr.inputform);
		const inputtask = document.querySelector(view.domstr.inputtask);
		console.log(inputform);
		inputform.addEventListener('submit', e=> {
			e.preventDefault();
			const taskname = inputtask.value;
			if(inputtask == null || inputtask === "") return;
			inputtask.value = null;
			state.tasklist = [createTask(taskname), ...state.tasklist];
		});
	}

	const deleteTodo = () => {
		const taskContainer = document.querySelector(view.domstr.tasklist);
		taskContainer.addEventListener('click', e => {
			if(e.target.tagName.toLowerCase() === 'span'){
				state.tasklist = state.tasklist.filter(task => +task.id !== +e.target.id);
			}			
		});
	};

	const init = () => {
		model.getTodos().then(tasklist => {
			state.tasklist = tasklist;
		});
	}

	const bootstrap = () => {
		init();
		deleteTodo();
		addTodo();
	};

	return {bootstrap};
})(Model, View);

Controller.bootstrap();






