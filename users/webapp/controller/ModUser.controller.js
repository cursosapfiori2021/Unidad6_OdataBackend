sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {


    function _onObjectMatched(oEvent) {

       //http://s4hana.sytes.net:9222/sap/opu/odata/sap/ZDATOSUSUARIOS_CONSULFF_SRV/UserBapiSet('CONSULFF')
       //oEvent.getParameter("arguments").Username 

        this.getView().bindElement({
            path: "/UserBapiSet('CONSULFF')",
            model: "DatosUser",
            events: {
                dataReceived: function (oData) {
                    _readUser.bind(this)(oData.getParameter("data").Username );
                }.bind(this)
            }
        });

        const objContext = this.getView().getModel("DatosUser").getContext("/UserBapiSet('CONSULFF')").getObject();
    if (objContext) {
        _readUser.bind(this)(objContext.Username );
    }

    };

    function _readUser(Username ) {

       
        this.getView().getModel("DatosUser").read("/UserBapiSet('CONSULFF')", {
            success: function (data) {
               
             var oJSONModelUser = new sap.ui.model.json.JSONModel();
             oJSONModelUser = data;
           //  this.getView().setModel(oJSONModelUser, "oJSONModelUser");  
             var oJSONModelCountries = new sap.ui.model.json.JSONModel();
            }.bind(this),
            error: function (data) {

            }
        });
    }


    return Controller.extend("ns.users.controller.ModUser", {
	
	onInit: function (){
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("ModUser").attachPatternMatched(_onObjectMatched, this);
	},
	
 
	

 
    });
});  