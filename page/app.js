        // Configuración de la base de datos
        var db = new PouchDB('categorias');

        // Categorías por defecto
        var categoriasDefault = [
            { _id: '1', nombre: 'Bebidas' },
            { _id: '2', nombre: 'Carnes' }
        ];

        // Guardar las categorías por defecto en la base de datos
        db.bulkDocs(categoriasDefault)
            .then(function () {
                console.log('Categorías por defecto guardadas con éxito');
            })
            .catch(function (err) {
                console.error('Error al guardar categorías por defecto:', err);
            });

        // Función para guardar nueva categoría
        function guardarCategoria() {
            var nombreCategoria = $('#nombreCategoria').val();

            if (nombreCategoria) {
                var nuevaCategoria = {
                    _id: new Date().toISOString(),
                    nombre: nombreCategoria
                };

                db.put(nuevaCategoria)
                    .then(function (response) {
                        console.log('Categoría guardada con éxito:', response);
                        $('#crearCategoriaModal').modal('hide');
                    })
                    .catch(function (err) {
                        console.error('Error al guardar categoría:', err);
                    });
            }
        }

            // Función para mostrar la lista de categorías con botones de editar y eliminar
    function mostrarListaCategorias() {
        db.allDocs({ include_docs: true })
            .then(function (result) {
                var categorias = result.rows.map(function (row) {
                    return row.doc;
                });

                var listaHtml = '<ul>';
                categorias.forEach(function (categoria) {
                    listaHtml += '<li>' + categoria.nombre +
                        '<button class="btn btn-primary btn-sm mx-1" onclick="editarCategoria(\'' + categoria._id + '\')">Editar</button>' +
                        '<button class="btn btn-danger btn-sm" onclick="eliminarCategoria(\'' + categoria._id + '\')">Eliminar</button>' +
                        '</li>';
                });
                listaHtml += '</ul>';

                $('#listaCategorias').html(listaHtml);
                $('#verListaModal').modal('show');
            })
            .catch(function (err) {
                console.error('Error al obtener la lista de categorías:', err);
            });
    }

    // Función para editar una categoría
    function editarCategoria(categoriaId) {
        var nuevoNombre = prompt('Ingrese el nuevo nombre para la categoría:');
        if (nuevoNombre !== null) {
            db.get(categoriaId)
                .then(function (categoria) {
                    categoria.nombre = nuevoNombre;
                    return db.put(categoria);
                })
                .then(function () {
                    console.log('Categoría editada con éxito');
                    mostrarListaCategorias(); // Actualizar la lista después de la edición
                })
                .catch(function (err) {
                    console.error('Error al editar categoría:', err);
                });
        }
    }

    // Función para eliminar una categoría
    function eliminarCategoria(categoriaId) {
        if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
            db.get(categoriaId)
                .then(function (categoria) {
                    return db.remove(categoria);
                })
                .then(function () {
                    console.log('Categoría eliminada con éxito');
                    mostrarListaCategorias(); // Actualizar la lista después de la eliminación
                })
                .catch(function (err) {
                    console.error('Error al eliminar categoría:', err);
                });
        }
    }
////////////////////////////<--------------PARTE DE FORMULARIO PRODUCTO---------------->//////////////////////////////////
// Mostrar imagen en el formulario
function mostrarImagenPreview() {
    var inputImagen = document.getElementById('imagen');
    var imagenPreview = document.getElementById('imagenPreview');

    if (inputImagen.files && inputImagen.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            imagenPreview.src = e.target.result;
            imagenPreview.style.display = 'block';
        };

        reader.readAsDataURL(inputImagen.files[0]);
    }
}
///////////////////<---------Mostrar categoria en select y guardar datos en pouchdb ---------->/////////////////////////
   // Script para cargar las categorías en el select
   document.addEventListener('DOMContentLoaded', function () {
    cargarCategorias();
});

function cargarCategorias() {
    // Utiliza la misma instancia de PouchDB para cargar las categorías
    var dbCategorias = new PouchDB('categorias');

    // Obtén las categorías y actualiza el select
    dbCategorias.allDocs({ include_docs: true })
        .then(function (result) {
            var categorias = result.rows.map(function (row) {
                return row.doc;
            });

            // Llena el select con las categorías
            var selectCategoria = document.getElementById('categoria');
            categorias.forEach(function (categoria) {
                var option = document.createElement('option');
                option.value = categoria.nombre; // Almacena el nombre en lugar del ID
                option.text = categoria.nombre;
                selectCategoria.add(option);
            });
        })
        .catch(function (err) {
            console.error('Error al cargar categorías:', err);
        });
}

// ...
// Modifica la función guardarProducto en app.js
function guardarProducto() {
    var nombreProducto = $('#nombreProducto').val();
    var cantidad = $('#cantidad').val();
    var precio = $('#precio').val();
    var nombreCategoria = $('#categoria').val(); // Obtén el nombre de la categoría

    obtenerImagenBase64().then(function (imagenBase64) {
        if (nombreProducto && cantidad && precio && nombreCategoria && imagenBase64) {
            var nuevoProducto = {
                _id: new Date().toISOString(),
                nombre: nombreProducto,
                cantidad: parseInt(cantidad),
                precio: parseFloat(precio),
                categoria: nombreCategoria, // Almacena el nombre de la categoría en lugar del ID
                imagen: imagenBase64
            };

            // Utiliza una nueva instancia de PouchDB para la nueva base de datos de productos
            var dbProductos = new PouchDB('productos');

            dbProductos.put(nuevoProducto)
                .then(function (response) {
                    console.log('Producto guardado con éxito:', response);
                    limpiarFormulario();

                    // Después de guardar, actualiza y muestra la tabla de productos automáticamente
                    cargarYMostrarProductos();
                    iniciarActualizacionAutomatica();
                })
                .catch(function (err) {
                    console.error('Error al guardar producto:', err);
                });
        }
    });
}


// Agrega una nueva función para limpiar el formulario después de guardar
function limpiarFormulario() {
    $('#nombreProducto').val('');
    $('#cantidad').val('');
    $('#precio').val('');
    $('#categoria').val('');
    $('#imagen').val('');
    $('#imagenPreview').attr('src', '').hide();
}


// Agrega una nueva función para obtener la imagen como Base64
function obtenerImagenBase64() {
    var inputImagen = document.getElementById('imagen');
    if (inputImagen.files && inputImagen.files[0]) {
        var reader = new FileReader();
        return new Promise(function (resolve, reject) {
            reader.onload = function (e) {
                resolve(e.target.result.split(',')[1]); // Devuelve solo el contenido Base64, sin el encabezado.
            };
            reader.onerror = reject;
            reader.readAsDataURL(inputImagen.files[0]);
        });
    }
    return Promise.resolve(null); // Resuelve la promesa con null si no hay imagen
}

// Agrega una nueva función para cargar y mostrar productos automáticamente
function cargarYMostrarProductos() {
    var dbProductos = new PouchDB('productos');

    // Obtén los productos y actualiza la tabla
    dbProductos.allDocs({ include_docs: true })
        .then(function (result) {
            var productos = result.rows.map(function (row) {
                return row.doc;
            });

            // Llena la tabla con los productos
            var tablaProductosBody = document.getElementById('tablaProductosBody');
            tablaProductosBody.innerHTML = ''; // Limpiar la tabla antes de volver a llenar

            productos.forEach(function (producto) {
                var fila = '<tr>' +
                    '<td><img src="data:image/jpeg;base64,' + producto.imagen + '" alt="Imagen del producto" style="max-width: 50px; max-height: 50px;"></td>' +
                    '<td>' + producto.nombre + '</td>' +
                    '<td>' + producto.cantidad + '</td>' +
                    '<td>' + producto.precio + '</td>' +
                    '<td>' + producto.categoria + '</td>' +
                    '<td>' +
                    '<button class="btn btn-primary btn-sm" onclick="editarProducto(\'' + producto._id + '\')">Editar</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="eliminarProducto(\'' + producto._id + '\')">Eliminar</button>' +
                    '</td>' +
                    '</tr>';

                tablaProductosBody.innerHTML += fila;
            });
        })
        .catch(function (err) {
            console.error('Error al cargar productos:', err);
        });
}

// Agrega una nueva función para iniciar la actualización automática
function iniciarActualizacionAutomatica() {
    setInterval(function () {
        cargarYMostrarProductos();
    }, 5000); // Actualiza la tabla cada 5 segundos (ajusta según sea necesario)
}

// Llama a la función para cargar y mostrar productos al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarYMostrarProductos();
    iniciarActualizacionAutomatica();
});

// Función para eliminar un producto
function eliminarProducto(productoId) {
    var dbProductos = new PouchDB('productos');

    dbProductos.get(productoId)
        .then(function (producto) {
            // Eliminar el producto de la base de datos
            return dbProductos.remove(producto);
        })
        .then(function () {
            console.log('Producto eliminado con éxito');
            cargarYMostrarProductos(); // Actualizar la tabla después de la eliminación
        })
        .catch(function (err) {
            console.error('Error al eliminar producto:', err);
        });
}
// Agrega una nueva función para editar un producto
function editarProducto(productoId) {
    var dbProductos = new PouchDB('productos');

    // Obtén el producto por su ID
    dbProductos.get(productoId)
        .then(function (producto) {
            // Rellena el formulario con los datos del producto
            $('#nombreProducto').val(producto.nombre);
            $('#cantidad').val(producto.cantidad);
            $('#precio').val(producto.precio);
            $('#categoria').val(producto.categoria);

            // Muestra la imagen del producto en el formulario
            var imagenPreview = document.getElementById('imagenPreview');
            imagenPreview.src = 'data:image/jpeg;base64,' + producto.imagen;
            imagenPreview.style.display = 'block';

            // Cambia el botón "Guardar" para que llame a la función de actualizarProducto
            var botonGuardar = document.querySelector('.btn.btn-primary');
            botonGuardar.textContent = 'Actualizar';
            botonGuardar.setAttribute('onclick', 'actualizarProducto(\'' + producto._id + '\')');
        })
        .catch(function (err) {
            console.error('Error al editar producto:', err);
        });
}

// Agrega una nueva función para actualizar un producto existente
function actualizarProducto(productoId) {
    var dbProductos = new PouchDB('productos');

    // Obtén el producto por su ID
    dbProductos.get(productoId)
        .then(function (producto) {
            // Actualiza los datos del producto con los valores del formulario
            producto.nombre = $('#nombreProducto').val();
            producto.cantidad = parseInt($('#cantidad').val());
            producto.precio = parseFloat($('#precio').val());
            producto.categoria = $('#categoria').val();

            // Obtén la nueva imagen en Base64
            obtenerImagenBase64().then(function (imagenBase64) {
                if (imagenBase64) {
                    producto.imagen = imagenBase64;
                }

                // Guarda el producto actualizado en la base de datos
                return dbProductos.put(producto);
            })
            .then(function () {
                console.log('Producto actualizado con éxito');
                // Vuelve a cambiar el botón "Guardar" para que llame a la función de guardarProducto
                var botonGuardar = document.querySelector('.btn.btn-primary');
                botonGuardar.textContent = 'Guardar';
                botonGuardar.setAttribute('onclick', 'guardarProducto()');

                // Limpia el formulario después de actualizar
                limpiarFormulario();

                // Actualiza y muestra la tabla de productos
                cargarYMostrarProductos();
            })
            .catch(function (err) {
                console.error('Error al actualizar producto:', err);
            });
        })
        .catch(function (err) {
            console.error('Error al obtener producto para actualizar:', err);
        });
}
///////////////////////<-----------LISTAS----------------->//////////////////////////

// Función para guardar una nueva lista
function guardarLista() {
    var nombreLista = $('#nombreLista').val();

    if (nombreLista) {
        var nuevaLista = {
            _id: new Date().toISOString(),
            nombre: nombreLista
        };

        // Utiliza una nueva instancia de PouchDB para la nueva base de datos de listas
        var dbListas = new PouchDB('listas');

        dbListas.put(nuevaLista)
            .then(function (response) {
                console.log('Lista guardada con éxito:', response);
                limpiarFormularioLista();
                cargarYMostrarListas();
            })
            .catch(function (err) {
                console.error('Error al guardar lista:', err);
            });
    }
}

// Función para cargar y mostrar listas
function cargarYMostrarListas() {
    var dbListas = new PouchDB('listas');

    dbListas.allDocs({ include_docs: true })
        .then(function (result) {
            var listas = result.rows.map(function (row) {
                return row.doc;
            });

            // Llena la lista de listas
            var listaListas = document.getElementById('listaListas');
            listaListas.innerHTML = '';

            listas.forEach(function (lista) {
                var listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.textContent = lista.nombre;

                // Agrega un botón "X" para eliminar la lista
                var botonEliminar = document.createElement('button');
                botonEliminar.className = 'btn btn-danger btn-sm';
                botonEliminar.textContent = 'X';
                botonEliminar.addEventListener('click', function (event) {
                    event.stopPropagation(); // Evita que el clic se propague al elemento padre (el listItem)
                    eliminarLista(lista._id);
                });

                listItem.appendChild(botonEliminar);

                // Asocia la función para redirigir a la página dinámica de la lista
                listItem.addEventListener('click', function () {
                    window.location.href = '../page/listad.html?id=' + lista._id;
                });

                listaListas.appendChild(listItem);
            });
        })
        .catch(function (err) {
            console.error('Error al cargar listas:', err);
        });
}

// Función para limpiar el formulario de lista después de guardar
function limpiarFormularioLista() {
    $('#nombreLista').val('');
}
// Función para eliminar una lista
function eliminarLista(listaId) {
    var dbListas = new PouchDB('listas');

    if (confirm('¿Está seguro de que desea eliminar esta lista?')) {
        dbListas.get(listaId)
            .then(function (lista) {
                // Elimina la lista de la base de datos
                return dbListas.remove(lista);
            })
            .then(function () {
                console.log('Lista eliminada con éxito');
                cargarYMostrarListas(); // Actualiza la lista después de la eliminación
            })
            .catch(function (err) {
                console.error('Error al eliminar lista:', err);
            });
    }
}

//////////////////////<-------------Banner Lista Dinamica---------------------->//////////////////////
