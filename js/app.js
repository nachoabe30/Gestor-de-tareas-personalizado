// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // Obtener todos los elementos del DOM por su ID
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    
    // Elementos del modal de edición
    const editTaskModal = document.getElementById('editTaskModal');
    const editTaskTitleInput = document.getElementById('editTaskTitle');
    const editTaskDescriptionInput = document.getElementById('editTaskDescription');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    
    // Elementos del modal de vista detallada
    const viewTaskModal = document.getElementById('viewTaskModal');
    const viewTaskTitle = document.getElementById('viewTaskTitle');
    const viewTaskDescription = document.getElementById('viewTaskDescription');
    const viewTaskTime = document.getElementById('viewTaskTime');
    const statusButtonsContainer = document.getElementById('status-buttons');
    const saveStatusBtn = document.getElementById('saveStatusBtn');

    // Variable global para almacenar la card que se está editando o viendo
    let currentTaskCard = null;
    
    // Contador para el número de tareas
    let taskCounter = 0;
    
    // Función para crear una nueva tarea (card)
    function createTaskCard(title, description, creationTime) {
        taskCounter++;
        
        const cardCol = document.createElement('div');
        cardCol.className = 'col-sm-12 col-md-6 col-lg-4 mb-3';

        cardCol.innerHTML = `
            <div class="card border-0 rounded-3 shadow status-not-started" data-status="not-started">
                <div class="card-body bg-white rounded-3 position-relative">
                    <span class="badge bg-dark position-absolute top-0 start-0 m-2">#${taskCounter}</span>
                    <small class="text-muted position-absolute bottom-0 end-0 m-2">${creationTime}</small>
                    
                    <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 delete-btn">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    
                    <h5 class="card-title mt-4">${title}</h5>
                    <p class="card-text">${description}</p>
                    
                    <div class="d-flex gap-2 mt-3">
                        <button type="button" class="btn btn-dark btn-sm rounded-circle d-flex align-items-center justify-content-center view-btn" data-bs-toggle="modal" data-bs-target="#viewTaskModal" style="width: 32px; height: 32px;">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                        <button type="button" class="btn btn-warning btn-sm rounded-circle d-flex align-items-center justify-content-center edit-btn" data-bs-toggle="modal" data-bs-target="#editTaskModal" style="width: 32px; height: 32px;">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        taskList.prepend(cardCol);
    }
    
    // Escuchar el evento 'click' del botón de guardar tarea nueva
    saveTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value;
        const description = taskDescriptionInput.value;
        
        if (title.trim() === '' || description.trim() === '') {
            alert('Por favor, completa todos los campos.');
            return;
        }
        
        const now = new Date();
        const creationTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        createTaskCard(title, description, creationTime);
        
        taskForm.reset();
        
        const taskModal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        taskModal.hide();
    });

    // Manejar el clic en los botones de las tarjetas (delegación de eventos)
    taskList.addEventListener('click', (event) => {
        const target = event.target;

        // Lógica para editar
        if (target.closest('.edit-btn')) {
            const cardBody = target.closest('.card-body');
            currentTaskCard = cardBody.parentElement; // Guarda la referencia de la card principal
            
            const title = cardBody.querySelector('.card-title').textContent;
            const description = cardBody.querySelector('.card-text').textContent;
            editTaskTitleInput.value = title;
            editTaskDescriptionInput.value = description;
        }

        // Lógica para ver detalles
        if (target.closest('.view-btn')) {
            const cardBody = target.closest('.card-body');
            currentTaskCard = cardBody.parentElement; // Guarda la referencia de la card principal
            
            const title = cardBody.querySelector('.card-title').textContent;
            const description = cardBody.querySelector('.card-text').textContent;
            const time = cardBody.querySelector('.text-muted').textContent;
            
            viewTaskTitle.textContent = title;
            viewTaskDescription.textContent = description;
            viewTaskTime.textContent = time;

            // Obtener el estado actual de la card y actualizar los botones del modal
            const cardStatus = currentTaskCard.getAttribute('data-status') || 'not-started';
            updateStatusButtons(cardStatus);
        }
    });

    // Manejar el clic en los botones de estado dentro del modal
    statusButtonsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const status = target.getAttribute('data-status');

        if (status) {
            updateStatusButtons(status);
        }
    });

    // Lógica para el cambio de estado de los botones del modal
    function updateStatusButtons(status) {
        // Remover clases activas de todos los botones
        statusButtonsContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active', 'btn-outline-danger', 'btn-danger', 'btn-outline-warning', 'btn-warning', 'btn-outline-success', 'btn-success');
            
            // Reaplicar la clase de outline a todos los botones
            if (btn.getAttribute('data-status') === 'not-started') {
                btn.classList.add('btn-outline-danger');
            } else if (btn.getAttribute('data-status') === 'in-progress') {
                btn.classList.add('btn-outline-warning');
            } else if (btn.getAttribute('data-status') === 'completed') {
                btn.classList.add('btn-outline-success');
            }
        });
        
        // Añadir la clase 'active' al botón seleccionado y remover la clase de outline
        const selectedButton = statusButtonsContainer.querySelector(`[data-status="${status}"]`);
        if (selectedButton) {
            selectedButton.classList.remove(`btn-outline-${selectedButton.getAttribute('data-status')}`);
            selectedButton.classList.add('active', `btn-${selectedButton.getAttribute('data-status')}`);
        }
    }

    // Manejar el clic en el botón "Guardar" del modal de estado
    saveStatusBtn.addEventListener('click', () => {
        if (currentTaskCard) {
            const selectedButton = statusButtonsContainer.querySelector('.active');
            const newStatus = selectedButton ? selectedButton.getAttribute('data-status') : 'not-started';

            currentTaskCard.classList.remove('status-not-started', 'status-in-progress', 'status-completed');
            currentTaskCard.classList.add(`status-${newStatus}`);
            currentTaskCard.setAttribute('data-status', newStatus);

            const modal = bootstrap.Modal.getInstance(viewTaskModal);
            modal.hide();
        }
    });

    // Manejar el clic en el botón "Guardar Cambios" del modal de edición
    saveChangesBtn.addEventListener('click', () => {
        if (currentTaskCard) {
            const newTitle = editTaskTitleInput.value;
            const newDescription = editTaskDescriptionInput.value;
            
            // La variable currentTaskCard ya es la tarjeta principal
            currentTaskCard.querySelector('.card-title').textContent = newTitle;
            currentTaskCard.querySelector('.card-text').textContent = newDescription;

            currentTaskCard = null;
            const modal = bootstrap.Modal.getInstance(editTaskModal);
            modal.hide();
        }
    });
});