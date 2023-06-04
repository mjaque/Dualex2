/**
Vista con los datos de una tarea.
**/

import { Vista } from './vista.js'

export class VistaTarea extends Vista{
  /**
  Constructor de la clase.
  @param {Object} controlador Controlador de la vista.
  @param {Node} base Nodo al que se añadirá la vista.
  **/
  constructor (controlador, base) {
	super(controlador)
    this.base = base
    this.callback = null // Función que se llamará al cerrar el diálogo.


    // Cogemos referencias a los elementos del interfaz
    this.iTitulo = this.base.getElementsByTagName('input')[0]
    this.iFechaInicio = this.base.getElementsByTagName('input')[1]
    this.iFechaFin = this.base.getElementsByTagName('input')[2]
    this.iImagenes = this.base.getElementsByTagName('input')[3]
    this.taDescripcion =  this.base.getElementsByTagName('textarea')[0]
    this.divActividades =  this.base.querySelectorAll('div')[0] //Primer div dentro de divTarea
    this.sCalificacion = this.base.getElementsByTagName('select')[0]
    this.taComentarioCalificacionEmpresa =  this.base.getElementsByTagName('textarea')[1]
    this.divEvaluaciones =  this.base.querySelectorAll('div')[1]	//Es el segundo div dentro de divTarea
    this.divBotones = this.base.querySelectorAll('div')[2]	//Tercer div dentro de divTarea
    this.btnCancelar =  this.base.getElementsByTagName('button')[0]
    this.btnAceptar =  this.base.getElementsByTagName('button')[1]
    this.btnAnterior =  this.base.getElementsByTagName('button')[2]
    this.btnSiguiente =  this.base.getElementsByTagName('button')[3]

    // Asociamos eventos
    this.btnAceptar.onclick = this.aceptar.bind(this)
    this.btnCancelar.onclick = this.cancelar.bind(this)
    this.btnSiguiente.addEventListener('click', this.aceptarYSiguiente.bind(this))
    this.btnAnterior.addEventListener('click', this.anterior.bind(this))
    this.iFechaInicio.addEventListener('change',this.cambioFecha.bind(this))
    this.imagenes = []
    this.numImagenes = 0
    this.iImagenes.addEventListener('change',this.anadirImagen.bind(this))
    

    // Referencia a la tarea que se está mostrando
    this.tarea = null
    this.array = null
    this.x = 0
  }

  /**
    Carga en la vista la información de una tarea.
    @param tarea {Tarea} Información de la tarea.
  **/
  setTarea (tarea) {
    this.tarea = tarea
    this.iTitulo.value = tarea.titulo
    this.iFechaInicio.value = tarea.fecha
    this.iFechaFin.value = tarea.fecha_fin
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
        iCalificacion.setAttribute('type', 'checkbox')
        console.log(iCalificacion.value)
        if(iCalificacion.value== 1){
          iCalificacion.checked = true
        }
        else{
          iCalificacion.checked = false
        }
        this.sCalificacion.value = iCalificacion.value
        const revisado = document.createElement('label')
        div.appendChild(revisado)
        revisado.textContent = 'Revisado'
        revisado.style.fontWeight = 'lighter'
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
    this.array = array
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
    this.iFechaInicio.disabled = deshabilitar
    this.iFechaFin.disabled = deshabilitar
    this.taDescripcion.disabled = deshabilitar
    this.btnAnterior.disabled = deshabilitar
    this.btnSiguiente.disabled = deshabilitar
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
        this.iFechaInicio.value = hoy.toLocaleDateString('en-CA')
        this.cargarCalificaciones()
      }
    }
    super.mostrar(ver)
  }

  /**
    Borra los datos del interfaz.
  **/
  limpiar () {
    this.iTitulo.value = ''
    this.iFechaInicio.value = ''
    this.iFechaFin.value = ''
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
          if (this.controlador.getUsuario().rol === 'profesor') { option.textContent = calificacion.titulo} else { option.textContent = calificacion.titulo }
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
      if (this.iFechaInicio.value === '') { throw Error('Debes especificar una fecha válida para la tarea.') }
      if (new Date(this.iFechaFin.value) < new Date(this.iFechaInicio.value)) { throw Error('La fecha de fin no puede ser anterior a la de inicio.') }
      if (new Date(this.iFechaInicio.value) > new Date()) { throw Error('No registres tareas que no hayas hecho todavía.') }
      if (this.taDescripcion.length < 10) { throw Error('Debes describir detalladamente la tarea.') }

      const tarea = {}
      tarea.titulo = this.iTitulo.value
      tarea.fecha = this.iFechaInicio.value
      tarea.fecha_fin = this.iFechaFin.value
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
          if(divEvaluacion.getElementsByTagName('input')[0].checked == true){
            divEvaluacion.getElementsByTagName('input')[0].value = 1
          }
          else{
            divEvaluacion.getElementsByTagName('input')[0].value = 0
          }
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
    Recoge los datos de la tarea, guarda en bbdd y muestra la tarea siguiente
  **/
    async aceptarYSiguiente(){
      this.works = await this.controlador.traerTareas()
      for(let i=0;i<this.works.length;i++){
        if(this.tarea.id == this.works[i].id){
            this.x = i
        }
      }
      this.x++

      try {
        // Validación de datos.
        if (this.iTitulo.value.length < 5) { throw Error('Debes especificar un título para la tarea que sea descriptivo.') }
        if (this.iFechaInicio.value === '') { throw Error('Debes especificar una fecha válida para la tarea.') }
        if (new Date(this.iFechaFin.value) < new Date(this.iFechaInicio.value)) { throw Error('La fecha de fin no puede ser anterior a la de inicio.') }
        if (new Date(this.iFechaInicio.value) > new Date()) { throw Error('No registres tareas que no hayas hecho todavía.') }
        if (this.taDescripcion.length < 10) { throw Error('Debes describir detalladamente la tarea.') }
  
        const tarea = {}
        tarea.titulo = this.iTitulo.value
        tarea.fecha = this.iFechaInicio.value
        tarea.fecha_fin = this.iFechaFin.value
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
            if(divEvaluacion.getElementsByTagName('input')[0].checked == true){
              divEvaluacion.getElementsByTagName('input')[0].value = 1
            }
            else{
              divEvaluacion.getElementsByTagName('input')[0].value = 0
            }
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
          let siguiente = 1
          this.controlador.modificarTarea(tarea,siguiente)
          this.setTarea(this.works[this.x])
          window.scroll(0,0)
        } else { this.controlador.crearTarea(tarea) }
      } catch (e) {
        this.controlador.gestionarError(e)
      }
      
      
    }

    /**
    Recoge los datos de la tarea, guarda en bbdd y muestra la tarea anterior
  **/
    async anterior(){
      this.works = await this.controlador.traerTareas()
      for(let i=0;i<this.works.length;i++){
        if(this.tarea.id == this.works[i].id){
            this.x = i
        }
      }
      this.x--
      /*console.log(this.x)
      console.log(this.works[this.x])*/
      this.setTarea(this.works[this.x])
      window.scroll(0,0)
      
    }

    /*
    Cambia la fecha fin si se cambia la fecha de inicio
    */
    cambioFecha(){
      this.iFechaFin.value = this.iFechaInicio.value
    }

    async anadirImagen(){
      if(this.numImagenes<3){
        let valorimagen = null
        console.log(this.iImagenes.files[0])
        const archivo = this.iImagenes.files[0]
        const lector = new FileReader()
        lector.addEventListener('load',() => {
          console.log(lector.result)
          valorimagen = lector.result
          this.imagenes[this.numImagenes]= valorimagen
          console.log(this.imagenes[this.numImagenes])
          this.numImagenes++
          this.iImagenes.value = ''
          if(this.numImagenes==3){
            this.iImagenes.disabled = true
          }
        })
        lector.readAsDataURL(archivo)
        
      }else{
        this.iImagenes.disabled = true
      }
    }
}
