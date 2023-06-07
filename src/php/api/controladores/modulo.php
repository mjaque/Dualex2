<?php
/**
	Controlador de Modulos
**/
require_once('./daos/daomodulo.php');

class Modulo{
	/**
		Devuelve la lista de modulos de un ciclo.
		@param $pathParams {Array} Array de parámetros con el identificador del ciclo.
		@param $queryParams {Array} Array de parámetros. No se utiliza.
		@param $usuario {Usuario} Usuario que realiza la petición.
		@return {Array[Array[String]]}
	**/
	function get($pathParams, $queryParams, $usuario){
		if($pathParams[0]=='moduloNota' && array_key_exists('id_alumno', $queryParams)){
			$resultado = DAOModulo::getModulosNotas($queryParams['id_alumno'],$queryParams['periodo']);
			$json = json_encode($resultado);
			header('Content-type: application/json; charset=utf-8');
			header('HTTP/1.1 200 OK');
			echo $json;
			die();
		}
	}
}
