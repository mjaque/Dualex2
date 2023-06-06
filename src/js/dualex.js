/**
  Controlador principal de la aplicación.
**/

// Modelos
import { Modelo } from './modelos/modelo.js'

// Vistas
import { VistaLogin } from './vistas/vistalogin.js'
import { VistaDialogo } from './vistas/vistadialogo.js'
import { VistaMensaje } from './vistas/vistamensaje.js'
import { VistaMenu } from './vistas/vistamenu.js'

// Vista de tareas del alumno
import { VistaTareas } from './vistas/vistatareas.js'
// Detalle de Tarea
import { VistaTarea } from './vistas/vistatarea.js'
// Listado de Alumnos
import { VistaAlumnos } from './vistas/vistaalumnos.js'
// Informe de Alumno
import { VistaInforme } from './vistas/vistainforme.js'
// Créditos
import { VistaCreditos } from './vistas/vistacreditos.js'

// Servicios
import { Rest } from './servicios/rest.js'

/**
  Controlador principal de la aplicación.
**/
class DualEx {
  #usuario = null // Usuario logeado.

  constructor () {
    window.onload = this.iniciar.bind(this)
    window.onerror = function (error) { console.log('Error capturado. ' + error) }
  }

  /**
    Inicia la aplicación cargando la vista de login.
    Se llama al cargar la página.
  **/
  iniciar () {
    this.modelo = new Modelo()
    this.alumno = null
    this.vistaLogin = new VistaLogin(this, document.getElementById('divLogin'))
    this.vistaDialogo = new VistaDialogo(this, document.getElementById('divDialogo'))
    this.vistaMensaje = new VistaMensaje(this, document.getElementById('divMensaje'))
    this.vistaMenu = new VistaMenu(this, document.getElementById('divMenu'))
    this.vistaAlumnos = new VistaAlumnos(this, document.getElementById('divAlumnos'))
    this.vistaTarea = new VistaTarea(this, document.getElementById('divTarea'))
    this.vistaTareas = new VistaTareas(this, document.getElementById('divTareas'))
    this.vistaInforme = new VistaInforme(this, document.getElementById('divInforme'))
    this.vistaCreditos = new VistaCreditos(this, document.getElementById('divCreditos'))
    this.vistaLogin.mostrar()
  }

  /**
    Muestra el error en la vista de mensajes.
    @param error {Error} Error que se ha producido.
  **/
  gestionarError (error) {
    this.vistaMensaje.mostrar(error)
    console.error(error)
  }

  /**
    Recibe el token del login con Google y lo envía al servidor para identificar al usuario.
    @param token {Object} Token de identificación de usuario de Google.
  **/
  login (token) {
    Rest.post('login', [], token.credential, true)
      .then(usuario => {
        this.#usuario = usuario
        Rest.setAutorizacion(this.#usuario.autorizacion)
        this.vistaMenu.mostrar(true)
        this.vistaLogin.mostrar(false)
        switch (usuario.rol) {
          case 'alumno':
            this.mostrarTareasAlumno(this.#usuario)
            break
          case 'profesor':
            this.mostrarAlumnos()
            break
          default:
            console.error(`Rol de usuario desconocido: ${usuario.rol}`)
        }
      })
      .catch(e => { this.vistaLogin.mostrarError(e) })
  }

  /**
    Cierra la sesión del usuario.
  **/
  logout () {
    this.#usuario = null
    Rest.setAutorizacion(null)
    this.ocultarVistas()
    this.vistaMenu.mostrar(false)
    this.vistaLogin.mostrar(true)
  }

  /**
    Devuelve el usuario logeado.
    @return {Usuario} Devuelve el usuario logeado.
  **/
  getUsuario () {
    return this.#usuario
  }

  /**
    Oculta todas las vistas.
  **/
  ocultarVistas () {
    this.vistaTarea.mostrar(false)
    this.vistaTareas.mostrar(false)
    this.vistaAlumnos.mostrar(false)
    this.vistaInforme.mostrar(false)
    this.vistaCreditos.mostrar(false)
  }

  /**
    Muestra la vista de tareas del alumno.
    @param alumno {Alumno} Datos del alumno.
  **/
  mostrarTareasAlumno (alumno) {
    this.alumno = alumno
    // Para saber volver cuando sea el profesor
    if (this.#usuario.rol === 'profesor') {
      if (!alumno) {
        alumno = this.alumnoMostrado 
        this.alumno = this.alumnoMostrado
      } 
      else {
        this.alumnoMostrado = alumno
      }
    }
   
    if (alumno == null) { alumno = this.#usuario }
    this.ocultarVistas()
    this.modelo.getTareasAlumno(alumno)
      .then(tareas => {
        this.vistaMenu.verTareasAlumno(alumno)
        this.vistaTareas.cargar(tareas)
        this.ocultarVistas()
        this.vistaTareas.mostrar(true)
      })
      .catch(error => this.gestionarError(error))
  }

  /**
    Muestra la vista del informe de un alumno.
    @param alumno {Alumno} Datos del alumno.
    @param periodo {Number} Número del periodo del que se solicita el informe
  **/
  mostrarInformeAlumno (alumno, periodo) {
    this.alumno = alumno
    if (this.#usuario.rol !== 'profesor') return
    this.ocultarVistas()
    this.modelo.getInformeAlumno(alumno, periodo)
      .then(informe => {
        this.vistaMenu.verInforme(alumno)
        this.vistaInforme.cargar(alumno, informe)
        this.ocultarVistas()
        this.vistaInforme.mostrar(true)
      })
      .catch(error => this.gestionarError(error))
  }

  /**
    Muestra la vista de alumnos del profesor.
  **/
  mostrarAlumnos () {
    if (this.#usuario.rol !== 'profesor') { throw Error('Operación no permitida.') }
    this.modelo.getAlumnosProfesor()
      .then(alumnos => {
        this.vistaMenu.verAlumnosProfesor()
        this.vistaAlumnos.cargar(alumnos)
        this.ocultarVistas()
        this.vistaAlumnos.mostrar(true)
      })
      .catch(error => this.gestionarError(error))
  }

  /**
    Muestra la vista de tarea.
    @param tarea {Tarea} Datos de la tarea. Si es nula se mostrará la vista vacía para crear una nueva Tarea.
  **/
  mostrarTarea (tarea) {
    if (tarea) {
      console.log('llego')
      this.modelo.getTarea(tarea.id)
        .then(tareas => {
          console.log('llego al then')
          this.vistaMenu.verTarea(tareas[0])
          this.ocultarVistas()
          this.vistaTarea.mostrar(true, tareas[0])
        })
    } else {
      console.log('llego else')
      this.vistaMenu.verTarea(null)
      this.ocultarVistas()
      this.vistaTarea.mostrar(true)
    }
  }

  /**
    Devuelve la lista de actividades definidas.
    @param idCurso {Number} Identificador del curso.
    @return {Promise} Promesa de resolución de la petición.
  **/
  verActividades (idCurso) {
    return this.modelo.getActividades(idCurso)
  }

  /**
    Devuelve la lista de calificaciones definidas.
    @return {Promise} Promesa de resolución de la petición.
  **/
  verCalificaciones () {
    return this.modelo.getCalificaciones()
  }

  /**
    Crea una nueva tarea y vuelve a la vista de tareas del alumno.
    @param tarea {Tarea} Datos de la nueva tarea.
  **/
  crearTarea (tarea) {
    this.modelo.crearTarea(tarea)
      .then(resultado => {
        this.vistaMensaje.mostrar('La tarea se creó correctamente', VistaMensaje.OK)
        this.mostrarTareasAlumno(this.#usuario)
      })
      .catch(error => this.gestionarError(error))
  }

  /**
    Modifica una tarea y vuelve a la vista de tareas del alumno.
    @param tarea {Tarea} Datos de la tarea.
  **/
  modificarTarea (tarea,siguente) {
    this.modelo.modificarTarea(tarea)
      .then(resultado => {
        if(siguente!=1){
          this.vistaMensaje.mostrar('La tarea se modificó correctamente', VistaMensaje.OK)
          if (this.#usuario.rol === 'profesor') {
            this.mostrarTareasAlumno(this.alumnoMostrado) 
          } 
          else {
            this.mostrarTareasAlumno(this.#usuario) 
          }
        }
      })
      .catch(error => this.gestionarError(error))
  }

  /**
    Elimina una tarea.
    @param tarea {Tarea} Datos de la tarea.
  **/
  eliminarTarea (tarea) {
    const titulo = `¿Realmente quiere ELIMINAR la tarea  "${tarea.titulo}"?`
    const mensaje = 'Esta operación no puede deshacerse.'
    this.vistaDialogo.abrir(titulo, mensaje, confirmar => {
      if (confirmar) {
        this.modelo.borrarTarea(tarea)
          .then(respuesta => {
            this.vistaMensaje.mostrar('La tarea se eliminó correctamente.', VistaMensaje.OK)
            this.mostrarTareasAlumno(this.#usuario)
          })
          .catch(error => this.gestionarError(error))
      } else { this.vistaDialogo.cerrar() }
    })
  }

  /**
    Imprime la vista actual.
  **/
  imprimir () {
    this.vistaInforme.combinar()
    window.print()
  }

  /**
    Devuelve una promesa que devolverá la lista de periodos con su identificador y su título.
    @return {Promise} Promesa de resolución de la petición.
  **/
  verPeriodos () {
    return this.modelo.getPeriodos()
  }

  /**
    Muestra la vista de créditos de la aplicación.
  **/
  verCreditos () {
    this.vistaMenu.verCreditos()
    this.ocultarVistas()
    this.vistaCreditos.mostrar(true)
  }

  getCursos(){
    return this.modelo.getCursos()
  }

  getAlumnosProfesor(){
    return this.modelo.getAlumnosProfesor()
  }

  traerActividadNotas(id,periodo){
    return this.modelo.getActividadNotas(id,periodo)
  }

  traerTareas(){
    return this.modelo.getTareasAlumno(this.alumno)
  }

  cargarNombreTarea(tarea){
    console.log(tarea.titulo)
    this.vistaMenu.verTarea(tarea)
  }
  
}

/* eslint-disable no-new */
new DualEx()
