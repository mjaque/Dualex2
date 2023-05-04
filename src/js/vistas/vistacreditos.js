/**
Vista de Créditos.
**/

export class VistaCreditos{
  /**
  Constructor de la clase.
  @param {Object} controlador Controlador de la vista.
  @param {Node} base Nodo al que se añadirá la vista.
  **/
  constructor (controlador, base) {
    this.controlador = controlador
    this.base = base
  }
  mostrar (mostrar = true, modo) {
    if (!modo) {
      if (!this.display) { modo = 'block' } else { modo = this.display }
    }
    if (mostrar) { this.base.style.display = modo } else { this.base.style.display = 'none' }
  }
}
