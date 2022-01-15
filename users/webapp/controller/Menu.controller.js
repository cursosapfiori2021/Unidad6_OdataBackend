sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {

    return Controller.extend("ns.users.controller.Menu", {
	
	onInit: function (){
		
	},
	
	//Con la siguiente funcion podemos hacer el routing a la vista "ModUser"
	 navToModUser: function(){
			//Se obtiene el conjuntos de routers del programa
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var _SAPUsername = this.getOwnerComponent().SapUserName;
			oRouter.navTo("ModUser",{Username: _SAPUsername },false);
	}
	
 
    });
});  