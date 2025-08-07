// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // Obtener todos los elementos del DOM por su ID
    const formularioTarea = document.getElementById('formularioTarea');
    const listaTareas = document.getElementById('listaTareas');
    const tituloTareaInput = document.getElementById('tituloTarea');
    const descripcionTareaInput = document.getElementById('descripcionTarea');
    const botonGuardarTarea = document.getElementById('botonGuardarTarea');
    
    // Elementos del modal de edición
    const modalEditarTarea = document.getElementById('modalEditarTarea');
    const editarTituloTareaInput = document.getElementById('editarTituloTarea');
    const editarDescripcionTareaInput = document.getElementById('editarDescripcionTarea');
    const botonGuardarCambios = document.getElementById('botonGuardarCambios');
    
    // Elementos del modal de vista detallada
    const modalVerTarea = document.getElementById('modalVerTarea');
    const verTituloTarea = document.getElementById('verTituloTarea');
    const verDescripcionTarea = document.getElementById('verDescripcionTarea');
    const verTiempoTarea = document.getElementById('verTiempoTarea');
    const botonesEstado = document.getElementById('botonesEstado');
    const botonGuardarEstado = document.getElementById('botonGuardarEstado');

    // Variable global para almacenar la card que se está editando o viendo
    let tarjetaTareaActual = null;

    // Array para almacenar los datos de las tareas
    let tareas = [];

    // Función para guardar las tareas en localStorage
    function guardarTareasEnLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tareas));
    }

    // Función para cargar las tareas desde localStorage
    function cargarTareasDesdeLocalStorage() {
        const tareasAlmacenadas = JSON.parse(localStorage.getItem('tasks'));
        if (tareasAlmacenadas) {
            tareas = tareasAlmacenadas;
            tareas.forEach((tarea, indice) => crearTarjetaTarea(tarea.title, tarea.description, tarea.creationTime, tarea.status, indice));
        }
    }

    // Función para crear una nueva tarea (card) en el DOM
    function crearTarjetaTarea(titulo, descripcion, tiempoCreacion, estado = 'no-empezada', indice) {
        const columnaTarjeta = document.createElement('div');
        columnaTarjeta.className = 'col-sm-12 col-md-6 col-lg-4 mb-3';
        columnaTarjeta.setAttribute('data-task-index', indice);

        // Se usa la nueva clase 'estado-'
        columnaTarjeta.innerHTML = `
            <div class="card border-0 rounded-3 shadow estado-${estado}" data-status="${estado}">
                <div class="card-body bg-white rounded-3 position-relative">
                    <span class="badge bg-dark position-absolute top-0 start-0 m-2">#${indice + 1}</span>
                    <small class="text-muted position-absolute bottom-0 end-0 m-2">${tiempoCreacion}</small>
                    
                    <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 boton-borrar">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    
                    <h5 class="card-title mt-4">${titulo}</h5>
                    <p class="card-text">${descripcion}</p>
                    
                    <div class="d-flex gap-2 mt-3">
                        <button type="button" class="btn btn-dark btn-sm rounded-circle d-flex align-items-center justify-content-center boton-ver" data-bs-toggle="modal" data-bs-target="#modalVerTarea" style="width: 32px; height: 32px;">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                        <button type="button" class="btn btn-warning btn-sm rounded-circle d-flex align-items-center justify-content-center boton-editar" data-bs-toggle="modal" data-bs-target="#modalEditarTarea" style="width: 32px; height: 32px;">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        listaTareas.prepend(columnaTarjeta);
    }
    
    // Función para actualizar los números de las tarjetas
    function actualizarNumerosTarjetas() {
        const tarjetas = document.querySelectorAll('#listaTareas .col-sm-12');
        tarjetas.forEach((tarjeta, indice) => {
            tarjeta.setAttribute('data-task-index', indice);
            const cuerpoTarjeta = tarjeta.querySelector('.card-body');
            const insignia = cuerpoTarjeta.querySelector('.badge');
            if (insignia) {
                insignia.textContent = `#${indice + 1}`;
            }
        });
    }

    // Escuchar el evento 'click' del botón de guardar tarea nueva
    botonGuardarTarea.addEventListener('click', () => {
        const titulo = tituloTareaInput.value;
        const descripcion = descripcionTareaInput.value;
        
        if (titulo.trim() === '' || descripcion.trim() === '') {
            alert('Por favor, completa todos los campos.');
            return;
        }
        
        const ahora = new Date();
        const tiempoCreacion = `${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')}`;
        
        const nuevaTarea = {
            title: titulo,
            description: descripcion,
            creationTime: tiempoCreacion,
            status: 'no-empezada'
        };

        tareas.unshift(nuevaTarea); // Usar unshift para agregar al principio
        guardarTareasEnLocalStorage();
        
        // Limpiar el DOM y volver a renderizar para actualizar los índices
        listaTareas.innerHTML = '';
        tareas.forEach((tarea, indice) => crearTarjetaTarea(tarea.title, tarea.description, tarea.creationTime, tarea.status, indice));
        
        formularioTarea.reset();
        
        const modalTarea = bootstrap.Modal.getInstance(document.getElementById('modalTarea'));
        modalTarea.hide();
    });

    // Manejar el clic en los botones de las tarjetas (delegación de eventos)
    listaTareas.addEventListener('click', (event) => {
        const objetivo = event.target;

        // Lógica para editar
        if (objetivo.closest('.boton-editar')) {
            const cuerpoTarjeta = objetivo.closest('.card-body');
            tarjetaTareaActual = cuerpoTarjeta.parentElement; // Guarda la referencia de la card principal
            
            const titulo = cuerpoTarjeta.querySelector('.card-title').textContent;
            const descripcion = cuerpoTarjeta.querySelector('.card-text').textContent;
            editarTituloTareaInput.value = titulo;
            editarDescripcionTareaInput.value = descripcion;
        }

        // Lógica para ver detalles
        if (objetivo.closest('.boton-ver')) {
            const cuerpoTarjeta = objetivo.closest('.card-body');
            tarjetaTareaActual = cuerpoTarjeta.parentElement; // Guarda la referencia de la card principal
            
            const titulo = cuerpoTarjeta.querySelector('.card-title').textContent;
            const descripcion = cuerpoTarjeta.querySelector('.card-text').textContent;
            const tiempo = cuerpoTarjeta.querySelector('.text-muted').textContent;
            
            verTituloTarea.textContent = titulo;
            verDescripcionTarea.textContent = descripcion;
            verTiempoTarea.textContent = tiempo;

            // Obtener el estado actual de la card y actualizar los botones del modal
            const estadoTarjeta = tarjetaTareaActual.getAttribute('data-status') || 'no-empezada';
            actualizarBotonesEstado(estadoTarjeta);
        }

        // LÓGICA DE BORRADO: Modal de confirmación con SweetAlert2
        if (objetivo.closest('.boton-borrar')) {
            const columnaTarjeta = objetivo.closest('.col-sm-12');
            const indiceTarea = parseInt(columnaTarjeta.getAttribute('data-task-index'));
            
            // Muestra el modal de confirmación de SweetAlert2
            Swal.fire({
                title: '¿Estás seguro?',
                text: '¡Esta acción no se puede revertir!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, borrar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Si el usuario confirma, procede con el borrado
                    if (!isNaN(indiceTarea)) {
                        tareas.splice(indiceTarea, 1);
                        guardarTareasEnLocalStorage();
                        columnaTarjeta.remove();
                        actualizarNumerosTarjetas();
                    }

                    // Muestra un mensaje de éxito
                    Swal.fire(
                        '¡Borrado!',
                        'La tarea ha sido eliminada.',
                        'success'
                    );
                }
            });
        }
    });

    // Manejar el clic en los botones de estado dentro del modal
    botonesEstado.addEventListener('click', (event) => {
        const objetivo = event.target;
        const estado = objetivo.getAttribute('data-status');

        if (estado) {
            actualizarBotonesEstado(estado);
        }
    });

    // Lógica para el cambio de estado de los botones del modal
    function actualizarBotonesEstado(estado) {
        botonesEstado.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active', 'btn-danger', 'btn-warning', 'btn-success');
            
            if (btn.getAttribute('data-status') === 'no-empezada') {
                btn.classList.add('btn-outline-danger');
            } else if (btn.getAttribute('data-status') === 'en-progreso') {
                btn.classList.add('btn-outline-warning');
            } else if (btn.getAttribute('data-status') === 'realizada') {
                btn.classList.add('btn-outline-success');
            }
        });
        
        const botonSeleccionado = botonesEstado.querySelector(`[data-status="${estado}"]`);
        if (botonSeleccionado) {
            botonSeleccionado.classList.remove(`btn-outline-${botonSeleccionado.getAttribute('data-status').replace('no-empezada', 'danger').replace('en-progreso', 'warning').replace('realizada', 'success')}`);
            botonSeleccionado.classList.add('active', `btn-${estado.replace('no-empezada', 'danger').replace('en-progreso', 'warning').replace('realizada', 'success')}`);
        }
    }

    // Manejar el clic en el botón "Guardar" del modal de estado
    botonGuardarEstado.addEventListener('click', () => {
        if (tarjetaTareaActual) {
            const botonSeleccionado = botonesEstado.querySelector('.active');
            const nuevoEstado = botonSeleccionado ? botonSeleccionado.getAttribute('data-status') : 'no-empezada';

            const indiceTarea = parseInt(tarjetaTareaActual.parentElement.getAttribute('data-task-index'));
            if (!isNaN(indiceTarea) && tareas[indiceTarea]) {
                tareas[indiceTarea].status = nuevoEstado;
                guardarTareasEnLocalStorage();
            }
            
            // Se actualiza la clase de la tarjeta con el nuevo estado
            tarjetaTareaActual.classList.remove('estado-no-empezada', 'estado-en-progreso', 'estado-realizada');
            tarjetaTareaActual.classList.add(`estado-${nuevoEstado}`);
            tarjetaTareaActual.setAttribute('data-status', nuevoEstado);

            const modal = bootstrap.Modal.getInstance(modalVerTarea);
            modal.hide();
        }
    });

    // Manejar el clic en el botón "Guardar Cambios" del modal de edición
    botonGuardarCambios.addEventListener('click', () => {
        if (tarjetaTareaActual) {
            const nuevoTitulo = editarTituloTareaInput.value;
            const nuevaDescripcion = editarDescripcionTareaInput.value;
            
            const indiceTarea = parseInt(tarjetaTareaActual.parentElement.getAttribute('data-task-index'));
            if (!isNaN(indiceTarea) && tareas[indiceTarea]) {
                tareas[indiceTarea].title = nuevoTitulo;
                tareas[indiceTarea].description = nuevaDescripcion;
                guardarTareasEnLocalStorage();
            }

            tarjetaTareaActual.querySelector('.card-title').textContent = nuevoTitulo;
            tarjetaTareaActual.querySelector('.card-text').textContent = nuevaDescripcion;

            tarjetaTareaActual = null;
            const modal = bootstrap.Modal.getInstance(modalEditarTarea);
            modal.hide();
        }
    });

    // Cargar las tareas al iniciar la página
    cargarTareasDesdeLocalStorage();
});