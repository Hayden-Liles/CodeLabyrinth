/**
 * Returns the unique properties of the incoming object
 * @param {Object} base
 * @param {Object} incoming
 * @param {String} prop
 * @returns {Object}
 */
 exports.uniques = function unique(base, incoming, prop){
    base = JSON.parse(JSON.stringify(base))
    incoming = JSON.parse(JSON.stringify(incoming))
    const uniques = {}
    let baseProp = base[prop]
    let incomingProp = incoming[prop]
    if(!baseProp){ return incomingProp }
    for(let key in incomingProp){
      if(!baseProp[key]){
        uniques[key] = incomingProp[key]
      }
    }
    return uniques
  }
