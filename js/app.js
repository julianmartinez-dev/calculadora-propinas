let cliente = {
  mesa: '',
  hora: '',
  pedido: [],
};

const categorias = new Map([
  [1, 'Comida'],
  [2, 'Bebidas'],
  [3, 'Postres'],
]);

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
  const mesa = document.querySelector('#mesa').value;
  const hora = document.querySelector('#hora').value;

  //Revisa si hay campos vacios
  const camposVacios = [mesa, hora].some((e) => e === '');

  if (camposVacios) {
    //Verificar si ya hay una alerta
    const existeAlerta = document.querySelector('.invalid-feedback');

    if (!existeAlerta) {
      const alerta = document.createElement('DIV');
      alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
      alerta.textContent = 'Todos los campos son obligatorios';
      document.querySelector('.modal-body form').appendChild(alerta);

      setTimeout(() => {
        alerta.remove();
      }, 3000);
    }

    return;
  }

  //Asignar datos del formulario al cliente
  cliente = {...cliente, mesa, hora}

  //Ocultar el modal
  const modalFormulario = document.querySelector('#formulario');
  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBootstrap.hide();

  //Mostrar las secciones
  mostrarSecciones()

  //Obtener platillos de la api de json-server
  obtenerPlatillos();

}

function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => {
        seccion.classList.remove('d-none')
    });
}

function obtenerPlatillos(){
    const url = "http://localhost:4000/platillos"

    fetch(url)
        .then( respuesta => respuesta.json())
        .then( datos => mostrarPlatillos(datos))
        .catch(error => console.log(error))
}

function mostrarPlatillos(platillos){
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach(platillo => {

        const row = document.createElement('div');
        row.classList.add('row','py-3','border-top');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4')
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3','fw-bold');
        precio.textContent = '$'+platillo.precio;

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias.get(platillo.categoria)

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.id = `producto-${platillo.id}`
        inputCantidad.classList.add('form-control');
        inputCantidad.value = 0;
        inputCantidad.onchange = function(){
            const cantidad = parseInt(inputCantidad.value)
            agregarPlatillo({...platillo,cantidad});
        };

        const agregar = document.createElement('div');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio)
        row.appendChild(categoria);
        row.appendChild(agregar)
        contenido.appendChild(row)
    });
}

function agregarPlatillo(producto){
    //Extraer el producto actual
    let { pedido } = cliente;
    
    //Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0 ){
        //Comprueba si el elemento existe en el array
        if(pedido.some( articulo => articulo.id == producto.id)){
            //El articulo existe, actualizamos la cantidad
            const pedidoActualizado = pedido.map( articulo => {
                if( articulo.id === producto.id){
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            })
            
            cliente.pedido = [...pedidoActualizado]

        }else{
            //El articulo no existe, lo agregamos al array del pedido
            cliente.pedido = [...pedido, producto];
        }
        
    }else{
        //Eliminar elementos cuando la cantidad es 0
        const resultado = pedido.filter( articulo => articulo.id !== producto.id)
        cliente.pedido = [...resultado]
    }

    //Limpiar el codigo html previo
    limpiarHTML();

    if(cliente.pedido.length){
    //Mostrar el resumen
    actualizarResumen()
    }else{
        mensajePedidoVacio()
    }
    

}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido')

    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6','card','py-5','px-3','shadow');

    //Informacion de la mesa
    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.classList.add('fw-normal')
    mesaSpan.textContent = cliente.mesa;


    //Informacion de la hora
    const hora = document.createElement('p');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.classList.add('fw-normal');
    horaSpan.textContent = cliente.hora;

    //Titulo de la sección
    const heading = document.createElement('h3');
    heading.textContent = 'Platillos consumidos'
    heading.classList.add('my-4','text-center');

    //Iterar sobre el array de pedidos
    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    const { pedido } = cliente;

    pedido.forEach( articulo => {
      const { nombre, cantidad, precio, id } = articulo;

      const lista = document.createElement('li');
      lista.classList.add('list-group-item');

      //Nombre del articulo
      const nombreEl = document.createElement('h4');
      nombreEl.classList.add('my-4');
      nombreEl.textContent = nombre;

      //Cantidad del articulo
      const cantidadEl = document.createElement('p');
      cantidadEl.classList.add('fw-bold');
      cantidadEl.textContent = 'Cantidad: ';

      const cantidadValor = document.createElement('span');
      cantidadValor.classList.add('fw-normal');
      cantidadValor.textContent = cantidad;

      //Precio del articulo
      const precioEl = document.createElement('p');
      precioEl.classList.add('fw-bold');
      precioEl.textContent = 'Precio: $';

      const precioValor = document.createElement('span');
      precioValor.classList.add('fw-normal');
      precioValor.textContent = precio;

      //Subtotal del articulo
      const subtotalEl = document.createElement('p');
      subtotalEl.classList.add('fw-bold');
      subtotalEl.textContent = 'Subtotal: $';

      const subtotalValor = document.createElement('span');
      subtotalValor.classList.add('fw-normal');
      subtotalValor.textContent = precio * cantidad;

      //Boton para eliminar
      const btnEliminar = document.createElement('button');
      btnEliminar.classList.add('btn', 'btn-danger');
      btnEliminar.textContent = 'Eliminar del pedido'
      btnEliminar.onclick = function(){
          eliminarProducto(id)
      }

      //Agregar valores a sus contenedores
      cantidadEl.appendChild(cantidadValor);
      precioEl.appendChild(precioValor);
      subtotalEl.appendChild(subtotalValor)

      //Agregar elementos al li
      lista.appendChild(nombreEl);
      lista.appendChild(cantidadEl);
      lista.appendChild(precioEl);
      lista.appendChild(subtotalEl)
      lista.appendChild(btnEliminar)

      //Agregar li al ul
      grupo.appendChild(lista);
    })



    //Agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan)

    //Agregar al contenido
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading)
    resumen.appendChild(grupo)
    

    contenido.appendChild(resumen);
}

function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild)
    }
}

function eliminarProducto(id){
    const { pedido } = cliente;

    const resultado = pedido.filter((articulo) => articulo.id !== id);
    cliente.pedido = [...resultado];

    limpiarHTML()
    if(cliente.pedido.length){
        actualizarResumen()
    }else{
        mensajePedidoVacio()
    }

    const productoEliminado = `#producto-${id}`;
    const input = document.querySelector(productoEliminado);
    input.value = 0;
    
}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);
}