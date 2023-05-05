/**
  Vista con el Informe de Alumno (imprimible).
**/
import { Vista } from './vista.js'

export class VistaInforme extends Vista {
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
    this.sAlumno = this.base.querySelector("span[data-informe='alumno']")
    this.sCoordinador = this.base.querySelector("span[data-informe='coordinador']")
    this.sGrado = this.base.querySelector("span[data-informe='grado']")
    this.sCiclo = this.base.querySelector("span[data-informe='ciclo']")
    this.sPeriodo = this.base.querySelector("span[data-informe='periodo']")
    this.divValoracion = this.base.querySelector('.grid1')
    this.divEvaluacion = this.base.querySelector('.grid3')
    this.inputTexts = this.base.querySelectorAll('input[type="text"]')
    this.inputRadios = this.base.querySelectorAll('input[type="radio"]')
    this.textAreas = this.base.querySelectorAll('textarea')

    // Asociamos eventos

  }

  /**
    Carga los datos del informe en la vista.
    @param alumno {Alumno} Datos del alumno.
    @param informe {Informe} Datos del informe.
  **/
  cargar (alumno, informe) {
    this.borrar()
    this.sAlumno.textContent = `${alumno.nombre} ${alumno.apellidos}`
    this.sCoordinador.textContent = informe.coordinador
    this.sGrado.textContent = informe.grado
    this.sCiclo.textContent = alumno.titulo
    this.sPeriodo.textContent = informe.periodo

    this._crearGrid(informe.valoracion, this.divValoracion)
    this._anadirModulos(informe.modulos, this.divValoracion)
    this._crearGrid(informe.evaluacion, this.divEvaluacion)
  }

  /**
    Borra los campos del informe para evitar que se muestren los del informe anterior.
    Los grids se borran en el método _crearGrid.
  **/
  borrar () {
    this.sAlumno.textContent = ''
    this.sCoordinador.textContent = ''
    this.sCiclo.textContent = ''
    this.sPeriodo.textContent = ''

    for (const input of this.inputTexts) { input.value = '' }

    for (const input of this.inputRadios) { input.checked = false }

    for (const textarea of this.textAreas) { textarea.value = '' }
  }

  /**
    Cambia los input de texto y los textarea para mostrarlos como texto (no como inputs ni textareas).
  **/
  combinar () {
    for (const elemento of this.base.querySelectorAll("input[type='text'], textarea")) {
      elemento.parentElement.insertBefore(document.createTextNode(elemento.value), elemento)
      elemento.remove()
    }
  }

  _crearGrid (informe, div) {
    // Mejor si primero lo borramos
    while (div.children.length > 0) { div.lastChild.remove() }
    for (const dato of informe) {
      const div1 = document.createElement('div')
      div.appendChild(div1)
      div1.setAttribute('id', 'divInformeActividad_' + dato.orden)
      div1.appendChild(document.createTextNode(dato.titulo))
      /* if (dato.modulos)
        //Ponemos los módulos de la actividad
        for(let modulo of dato.modulos){
          let span = document.createElement('span')
          div1.appendChild(span)
          span.classList.add('modulo')
          span.textContent = modulo.codigo
          span.setAttribute('title', modulo.titulo)
          span.style.backgroundColor = modulo.color_fondo
          span.style.color = modulo.color_letra
        }
      */
      // Ponemos la calificación
      const div2 = document.createElement('div')
      div.appendChild(div2)
      div2.textContent = dato.calificacion
    }
  }

  _anadirModulos (modulos, div) {
    for (const modulo of modulos) {
      const divActividad = document.getElementById('divInformeActividad_' + modulo.actividad_orden)
      const span = document.createElement('span')
      divActividad.appendChild(span)
      span.classList.add('modulo')
      span.textContent = modulo.modulo_codigo
      span.setAttribute('title', modulo.modulo_titulo)
      span.style.backgroundColor = modulo.color_fondo
      span.style.color = modulo.color_letra
    }
  }
}
