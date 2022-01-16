sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",

], function (Controller, History ,MessageBox ,  Filter , FilterOperator) {


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
	
    onBack: function (oEvent) {

        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        } else {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("menu", true);
        }
    },
	
    onSaveUser: function (oEvent) {
       
        const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
        let objectOrder = oEvent.getSource().getBindingContext("DatosUser").getObject();

          let body = {
            Address:{
                Firstname: objectOrder.Address.Firstname.toString(),
                Fullname: objectOrder.Address.Fullname.toString(),
                EMail: objectOrder.Address.EMail,
                Tel1Numbr: objectOrder.Address.Tel1Numbr,
              }
            };

            this.getView().getModel("DatosUser").update("/UserBapiSet('CONSULFF')", body, {
                success: function () {
                    MessageBox.information(oResourceBundle.getText("UserSaved"));
                },
                error: function (e) {
                    MessageBox.error(oResourceBundle.getText("UserNotSaved"));
                },

            });
       
    },

 
    });
});  