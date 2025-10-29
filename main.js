const db = new PouchDB('tareas');

const inputName = document.getElementById('nombre');
const inputFecha = document.getElementById('fecha');
const btnAdd = document.getElementById('btnAdd');
const btnList = document.getElementById('btnList');

btnAdd.addEventListener('click', (event) => {

    const tarea = {
        _id: new Date().toISOString(),
        nombre: inputName.value,
        fecha: inputFecha.value
    }

    db.put(tarea)
        .then((res) => {
            console.log('Éxito', res);
            inputName.value = '';
            inputFecha.value = '';

        })
        .catch(console.log())

});

btnList.addEventListener('click', (event) => {
    db.allDocs({
        include_docs: true
    }).then(function (result) {
        console.log('Resultado',result.rows);
        
    });
})

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