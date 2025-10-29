const db = new PouchDB('tareas');

const inputName = document.getElementById('nombre');
const inputFecha = document.getElementById('fecha');
const btnAdd = document.getElementById('btnAdd');
const btnList = document.getElementById('btnList');
const listaTareasDiv = document.getElementById('lista-tareas');



btnAdd.addEventListener('click', (event) => {

    const tarea = {
        _id: new Date().toISOString(),
        nombre: inputName.value,
        fecha: inputFecha.value,
        status:false
    }

    db.put(tarea)
        .then((res) => {
            console.log('Éxito', res);
            inputName.value = '';
            inputFecha.value = '';

        })
        .catch(console.log())

});

function renderTasks() {
    db.allDocs({
        include_docs: true
    }).then(function (result) {
        // console.log('Resultado', result.rows);
        listaTareasDiv.innerHTML = ''; 

        const tareasPendientes = result.rows
            .map(row => row.doc)
            .filter(doc => doc.status === false); 

        if (tareasPendientes.length === 0) {
            listaTareasDiv.innerHTML = '<p style="text-align: center; color: #718096; padding: 15px;">🎉 ¡No hay tareas pendientes! ¡Buen trabajo!</p>';
            return;
        }

        tareasPendientes.forEach(tarea => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'tarea-item'; 
            itemDiv.innerHTML = `
                <div>
                    <span class="tarea-nombre">${tarea.nombre}</span>
                    <span class="tarea-fecha">${tarea.fecha}</span>
                </div>
                <button class="btn-done" data-id="${tarea._id}">Hecho</button> 
            `;
            
            /*
            <input type="checkbox" class="task-checkbox" data-id="${tarea._id}">
            */

            listaTareasDiv.appendChild(itemDiv);
        });

        document.querySelectorAll('.btn-done').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                const tareaADesmarcar = tareasPendientes.find(t => t._id === taskId);
                if (tareaADesmarcar) {
                    toggleStatus(tareaADesmarcar);
                }
            });
        });
    });
}

btnList.addEventListener('click', renderTasks)

function toggleStatus(tarea) {
    const tareaActualizada = {
        ...tarea,
        status: !tarea.status,
    };
    
    db.put(tareaActualizada)
        .then(() => {
            console.log(`✅ Tarea '${tarea.nombre}' actualizada a status: ${tareaActualizada.status}`);
            renderTasks();
        })
        .catch(err => console.error('Error al actualizar la tarea:', err));
}




// Detectar si la app está en modo standalone (instalada)
window.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 Ejecutándose en modo standalone (instalada)');
        document.body.classList.add('standalone-mode');
    }

    // Detectar iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        document.body.classList.add('ios-device');
    }
});
// Registro del Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/CosoPWA/sw.js', { scope: '/CosoPWA/' })
            .then(registration => {
                console.log('✅ Service Worker registrado exitosamente: ', registration);

                // Verificar actualizaciones periódicamente
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Cada hora

            })
            .catch(err => console.error('❌ Error en registro del Service Worker: ', err));
    });

    // Detectar cambios en el Service Worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Controller changed - posible actualización');
        window.location.reload();
    });
}