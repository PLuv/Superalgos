exports.newSocialGraph = function newSocialGraph() {
    /*
    This module represents the Social Graph Service that 
    this deals with the Social Graph this node mantains. 
    The Social Graph is one of the services the Network Node provides.

    This service is responsible for mantaining the whole Social Graph
    or relationships between User and Bot profiles and also between 
    their posts.
    */
    let thisObject = {
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        let bootstrapProcess = NT.modules.bootstrap.newBootstrap()
        bootstrapProcess.initialize()
    }
}