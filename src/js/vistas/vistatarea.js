/**
Vista con los datos de una tarea.
**/

export class VistaTarea {
  /**
  Constructor de la clase.
  @param {Object} controlador Controlador de la vista.
  @param {Node} base Nodo al que se añadirá la vista.
  **/
  constructor (controlador, base) {
    this.controlador = controlador
    this.base = base
    this.callback = null // Función que se llamará al cerrar el diálogo.

    // Cogemos referencias a los elementos del interfaz
    this.iTitulo = document.getElementsByTagName('input')[0]
    console.log(this.iTitulo)
    this.iFecha = document.getElementsByTagName('input')[1]
    this.taDescripcion =  document.getElementsByTagName('textarea')[0]
    this.divActividades =  document.querySelector('fieldset div')
    this.sCalificacion = document.getElementsByTagName('select')[0]
    this.taComentarioCalificacionEmpresa =  document.getElementsByTagName('textarea')[1]
    this.divEvaluaciones =  document.querySelectorAll('body > div')[0]
    this.divBotones = document.querySelectorAll('body > div')[1]
    this.btnCancelar =  document.getElementsByTagName('button')[0]
    this.btnAceptar =  document.getElementsByTagName('button')[1]

    // Asociamos eventos
    this.btnAceptar.onclick = this.aceptar.bind(this)
    this.btnCancelar.onclick = this.cancelar.bind(this)

    // Referencia a la tarea que se está mostrando
    this.tarea = null
  }

  /**
    Carga en la vista la información de una tarea.
    @param tarea {Tarea} Información de la tarea.
  **/
  setTarea (tarea) {
    this.tarea = tarea
    this.iTitulo.value = tarea.titulo
    this.iFecha.value = tarea.fecha
    this.taDescripcion.value = tarea.descripcion
    this.taComentarioCalificacionEmpresa.value = tarea.comentario_calificacion_empresa
    // Seleccionamos la calificación de la empresa
    this.cargarCalificaciones()
      .then(respuesta => {
        this.sCalificacion.value = tarea.id_calificacion_empresa
        if (this.controlador.getUsuario().rol === 'alumno') {
          if (tarea.id_calificacion_empresa || tarea.calificacion) { this.deshabilitar(true) }
          for (const modulo of tarea.modulos) {
            if (modulo.calificacion) { this.deshabilitar(true) }
          }
        } else {
          for (const modulo of tarea.modulos) {
            if (modulo.calificacion) { this.deshabilitarActividades(true) }
          }
        }
      })
    // Creamos el interfaz para mostrar las evaluaciones de los módulos
    while (this.divEvaluaciones.firstChild) { this.divEvaluaciones.firstChild.remove() }
    for (const modulo of tarea.modulos) {
      const div = document.createElement('div')
      this.divEvaluaciones.appendChild(div)
      div.classList.add('alto')
      this.crearSpanModulo(div, modulo)
      if (this.controlador.getUsuario().rol === 'alumno') {
        let evaluacion = ' Sin calificar'
        if (modulo.calificacion) { evaluacion = ' ' + modulo.calificacion + ' ' + modulo.evaluacion }
        div.appendChild(document.createTextNode(evaluacion))
      }
      if (this.controlador.getUsuario().rol === 'profesor') {
        const iCalificacion = document.createElement('input')
        div.appendChild(iCalificacion)
        iCalificacion.value = modulo.calificacion
        iCalificacion.setAttribute('type', 'number')
        div.modulo = modulo
        div.appendChild(document.createElement('br'))
        const taEvaluacion = document.createElement('textarea')
        div.appendChild(taEvaluacion)
        taEvaluacion.value = modulo.evaluacion
        taEvaluacion.setAttribute('placeholder', 'Comentario de evaluación de ' + modulo.titulo)
      }
    }
    // Marcamos las actividades de la tarea
    for (const actividad of tarea.actividades) { this.divActividades.querySelector('input[data-idActividad="' + actividad.id + '"').checked = true }
  }

  /**
    Crea el span asociado a un módulo y lo añade al div.
    @param div {DivElement} Elemento div al que se añadirá el span.
    @param alumno {Modulo} Datos del módulo.
    @param index {Number} Índice del alumno en el array.
    @param array {Array} Array de alumnos.
    TODO: Refactorizar con vistatareas.js
  **/
  crearSpanModulo (div, modulo, index, array) {
    const span = document.createElement('span')
    div.appendChild(span)
    span.classList.add('modulo')
    span.textContent = modulo.codigo
    span.setAttribute('title', modulo.titulo)
    span.style.backgroundColor = modulo.color_fondo
    span.style.color = modulo.color_letra
  }

  /**
    Cambia la capacidad de editar los campos de la vista (para el alumno).
    @param deshabilitar {Boolean} True para deshabilitar los campos.
  **/
  deshabilitar (deshabilitar) {
    this.iTitulo.disabled = deshabilitar
    this.iFecha.disabled = deshabilitar
    this.taDescripcion.disabled = deshabilitar
    this.taComentarioCalificacionEmpresa.disabled = deshabilitar
    this.sCalificacion.disabled = deshabilitar
    this.deshabilitarActividades(deshabilitar)
    if (deshabilitar) { this.divBotones.style.display = 'none' } else { this.divBotones.style.display = 'block' }
  }

  /**
    Deshabilita la modificación de actividades
    @param deshabilitar {Boolean} True para deshabilitar los campos.
  **/
  deshabilitarActividades (deshabilitar) {
    for (const input of this.divActividades.getElementsByTagName('input')) { input.disabled = deshabilitar }
  }

  /**
    Muestra u oculta.
    Al mostrar la vista carga las actividades.
    @param ver {Boolean} True para mostrar, false para ocultar
    @param tarea {Tarea} Información de la tarea que se quiere mostrar (solo en edición).
  **/
  mostrar (ver, tarea = null) {
    if (ver) {
      this.limpiar()
      this.deshabilitar(false)
      for (const input of this.divActividades.getElementsByTagName('input')) { input.checked = false }
      this.iTitulo.focus()

      if (tarea) {
        this.cargarActividades(tarea.id_curso)
          .then(() => this.setTarea(tarea))
      } else {
        this.cargarActividades(this.controlador.getUsuario().idCurso)
        this.tarea = null
        const hoy = new Date()
        this.iFecha.value = hoy.toLocaleDateString('en-CA')
        this.cargarCalificaciones()
      }
    }
    this.mostrar2(ver)
  }

  /**
    Borra los datos del interfaz.
  **/
  limpiar () {
    this.iTitulo.value = ''
    this.iFecha.value = ''
    this.taDescripcion.value = ''
    this.sCalificacion.selectedIndex = 0
    this.taComentarioCalificacionEmpresa.value = ''
    while (this.divEvaluaciones.firstChild) { this.divEvaluaciones.firstChild.remove() }
  }

  /**
    Carga la lista de Actividades de un curso.
    @param idCurso {Number} Identificador del curso.
    @return Promise
  **/
  cargarActividades (idCurso) {
    return this.controlador.verActividades(idCurso)
      .then(actividades => {
        this.eliminarHijos(this.divActividades)
        for (const actividad of actividades) {
          const div = document.createElement('div')
          this.divActividades.appendChild(div)
          const input = document.createElement('input')
          div.appendChild(input)
          input.setAttribute('type', 'checkbox')
          input.setAttribute('data-idActividad', actividad.id)
          const label = document.createElement('label')
          div.appendChild(label)
          label.textContent = actividad.orden + '. ' + actividad.titulo
          label.setAttribute('title', actividad.descripcion)
        }
      })
  }

  /**
    Carga la lista de Calificaciones.
    @param calificaciones {Calificaciones[]} Array de Calificaciones definidas.
    @return Promise de la petición.
  **/
  cargarCalificaciones (calificaciones) {
    return this.controlador.verCalificaciones()
      .then(calificaciones => {
        this.eliminarHijos(this.sCalificacion, 2)
        for (const calificacion of calificaciones) {
          const option = document.createElement('option')
          this.sCalificacion.appendChild(option)
          option.setAttribute('value', calificacion.id)
          option.setAttribute('title', calificacion.descripcion)
          if (this.controlador.getUsuario().rol === 'profesor') { option.textContent = calificacion.titulo + ' (' + calificacion.valor + ')' } else { option.textContent = calificacion.titulo }
        }
      })
  }

  /**
    Vuelve a la vista de tareas del alumno.
  **/
  volver () {
    this.controlador.mostrarTareasAlumno(this.controlador.getUsuario())
  }

  /**
    Recoge los datos de la Tarea y la envía al controlador.
  **/
  aceptar () {
    try {
      // Validación de datos.
      if (this.iTitulo.value.length < 5) { throw Error('Debes especificar un título para la tarea que sea descriptivo.') }
      if (this.iFecha.value === '') { throw Error('Debes especificar una fecha válida para la tarea.') }
      if (new Date(this.iFecha.value) > new Date()) { throw Error('No registres tareas que no hayas hecho todavía.') }
      if (this.taDescripcion.length < 10) { throw Error('Debes describir detalladamente la tarea.') }

      const tarea = {}
      tarea.titulo = this.iTitulo.value
      tarea.fecha = this.iFecha.value
      tarea.descripcion = this.taDescripcion.value
      tarea.actividades = []
      for (const iActividad of document.querySelectorAll('input[data-idActividad]')) {
        if (iActividad.checked) { tarea.actividades.push(iActividad.getAttribute('data-idActividad')) }
      }
      tarea.idCalificacionEmpresa = this.sCalificacion.value
      tarea.comentarioCalificacionEmpresa = this.taComentarioCalificacionEmpresa.value
      tarea.evaluaciones = []
      if (this.controlador.getUsuario().rol === 'profesor') {
        for (const divEvaluacion of this.divEvaluaciones.getElementsByTagName('div')) {
          const calificacion = divEvaluacion.getElementsByTagName('input')[0].value
          const comentario = divEvaluacion.getElementsByTagName('textarea')[0].value
          const evaluacion = {
            id: divEvaluacion.modulo.id,
            calificacion,
            comentario
          }
          tarea.evaluaciones.push(evaluacion)
        }
      }

      if (this.tarea) {
        tarea.id = this.tarea.id
        this.controlador.modificarTarea(tarea)
      } else { this.controlador.crearTarea(tarea) }
    } catch (e) {
      this.controlador.gestionarError(e)
    }
  }

  /**
    Cancela la acción y vuelve a la vista anterior.
  **/
  cancelar () {
    this.controlador.mostrarTareasAlumno()
  }

  /**
    Muestra u oculta la vista.
    @param mostrar {boolean} True para mostrar, false para ocultar.
    @param modo {String} Valor del atributo display de CSS para mostrar la vista. Por defecto será el atributo display de la vista o 'block'.
  **/
    mostrar2 (mostrar = true, modo) {
      if (!modo) {
        if (!this.display) { modo = 'block' } else { modo = this.display }
      }
      if (mostrar) { this.base.style.display = modo } else { this.base.style.display = 'none' }
    }

    /**
    Elimina todos los nodos hijos de un nodo.
    @param nodo {Node} Nodo del que se eliminarán los hijos.
  @param desde {Number} Índice del nodo desde el que se eliminarán los hijos. Indicando desde = 1, se salva al primer hijo (nodo 0).
  **/
  eliminarHijos (nodo, desde = 0) {
    while (nodo.childNodes.length > desde) { nodo.removeChild(nodo.childNodes.item(desde)) }
  }
}
