sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",

], function (Controller, History ,MessageBox ,  Filter , FilterOperator) {

    return Controller.extend("ns.users.controller.Menu", {
	
	onInit: function (){
		
	},
	
	//Con la siguiente funcion podemos hacer el routing a la vista "ModUser"
	 navToModUser: function(){
			//Se obtiene el conjuntos de routers del programa
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var _SAPUsername = this.getOwnerComponent().SapUserName;
			oRouter.navTo("ModUser",{Username: _SAPUsername },false);
	},
	

    });
});  