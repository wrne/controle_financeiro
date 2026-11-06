
/**
 * Reescreve um objeto trocando suas propriedades baseado em um objeto de mapeamento.
 * @param {Object} obj - O objeto original.
 * @param {Object} mapping - O objeto de mapeamento, onde a chave é a propriedade original e o valor é a nova propriedade.
 * @returns {Object} - O novo objeto com as propriedades renomeadas.
 */
function remapObject(any, mapping) {


	if (any instanceof Array) 		
		return any.map(item => remapObject(item, mapping))
		

	if (any instanceof Object) 
		return remap(any, mapping)
	

}

/**
 * Função que efetivamente recri o objeto com as novas propriedades.
 * @param {Object} obj - O objeto original.
 * @param {Object} mapping - O objeto de mapeamento, onde a chave é a propriedade original e o valor é a nova propriedade.
 * @returns {Object} - O novo objeto com as propriedades renomeadas.

 */
function remap(obj, mapping) {
    const newObj = {};
    for (const prop in obj) {

		let content = {}

		if (obj[prop] instanceof Array) 		
			content = obj[prop].forEach(item => remapObject(item, mapping))
		else if (obj[prop] instanceof Object) 		
			content = remapObject(obj[prop], mapping)
		else
			content = obj[prop];


		if (mapping[prop]) 			
			newObj[mapping[prop]] = content
			
		else
			newObj[prop] = obj[prop];
		
		content = null

    }
    return newObj;
}

export default remapObject;