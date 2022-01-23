sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/Core",
    'sap/ui/core/library',
    'sap/ui/core/message/Message',
    "sap/ui/core/Fragment"


], function (Controller, History, MessageBox, Core, coreLibrary, Message, Fragment) {


    function _onObjectMatched(oEvent) {

        //http://s4hana.sytes.net:9222/sap/opu/odata/sap/ZDATOSUSUARIOS_CONSULFF_SRV/UserBapiSet('CONSULFF')
        //oEvent.getParameter("arguments").Username 

        this.getView().bindElement({
            path: "/UserBapiSet('CONSULFF')",
            model: "DatosUser",
            events: {
                dataReceived: function (oData) {
                    _readUser.bind(this)(oData.getParameter("data").Username);
                }.bind(this)
            }
        });

        const objContext = this.getView().getModel("DatosUser").getContext("/UserBapiSet('CONSULFF')").getObject();
        if (objContext) {
            _readUser.bind(this)(objContext.Username);
        }

    };

    function _readUser(Username) {
        this.getView().getModel("DatosUser").read("/UserBapiSet('CONSULFF')", {
            success: function (data) {

            }.bind(this),
            error: function (data) {
                MessageBox.error(oResourceBundle.getText(data));
            }
        });
    }



    var MessageType = coreLibrary.MessageType;
    var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();

    return Controller.extend("ns.users.controller.ModUser", {

        onInit: function () {
            //Obtenemos la vista actual 
            oView = this.getView();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("ModUser").attachPatternMatched(_onObjectMatched, this);

            //Iniciamos un modelo de mensajes donde guardaremos los datos
            this._MessageManager = Core.getMessageManager();
            // Borramos los mensajes viejos
            this._MessageManager.removeAllMessages();
            // Registramos en nuestra vista el manegador de mensajes y el modelo
            this._MessageManager.registerObject(oView, true);
            this.oView.setModel(this._MessageManager.getMessageModel(), "message");

        },

        
        onMessagePopoverPress: function (oEvent) {
            var oSourceControl = oEvent.getSource();
            this._getMessagePopover().then(function (oMessagePopover) {
                oMessagePopover.openBy(oSourceControl);
            });
        },



        _getMessagePopover: function () {
            var oView = this.getView();
            // create popover lazily (singleton)
            if (!this._pMessagePopover) {
                this._pMessagePopover = Fragment.load({
                    id: oView.getId(),
                    name: "ns.users.fragment.MessagePopover"
                }).then(function (oMessagePopover) {
                    oView.addDependent(oMessagePopover);
                    return oMessagePopover;
                });
            }
            return this._pMessagePopover;
        },




        handleRequiredField: function (oInput) {
            var sTarget = "/_IDFullname/value";
            this.removeMessageFromTarget(sTarget);
            oInput.setValueState(MessageType.None);
            if (!oInput.getValue()) {
                this._MessageManager.addMessages(
                    new Message({
                        message: "El campo es obligatorio",
                        type: MessageType.Error,
                        additionalText: oInput.getLabels()[0].getText(),
                        target: sTarget,
                        processor: oMessageProcessor
                    })
                );
                oInput.setValueState(MessageType.Error);
            }
        },


        checkInputConstraints: function (group, oInput) {
            var sTarget = oInput.mBindingInfos.value.parts[0].path;
            var _value = oInput.getValue();
            this.removeMessageFromTarget(sTarget)

            switch (group) {
                case "GR2":
                    message = "El Telefono tiene un formato invalido";
                    type = MessageType.Warning;
                    description = "Por favor ingrese un formato valido";
                    sValueState = "Warning";
                    //954556817
                    var rexTel = /^\d{9}$/;
                    if (!_value.match(rexTel)) {

                        this._MessageManager.addMessages(
                            new Message({
                                message: message,
                                type: type,
                                additionalText: "",
                                description: description,
                                target: sTarget,
                                processor: oMessageProcessor
                            })
                        );
                        oInput.setValueState(sValueState);
                    }
                    break;
               default:
                    break;
            }

        },




        upperCase: function (sVal) {
            if (sVal) {
                return sVal.toUpperCase();

            }
            return sVal;
        },



        removeMessageFromTarget: function (sTarget) {
            // forEach pasa el object message en cada iteraccion 
            this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
                if (oMessage.target === sTarget) {
                    this._MessageManager.removeMessages(oMessage);
                }
                // Es importante este bind ya que con esto le indicamos donde se ejecuta
            }.bind(this));
        },

        onChange: function () {
            // clear potential server-side messages to allow saving the item again
            this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {

                if (oMessage.code) {
                    this._MessageManager.removeMessages(oMessage);
                }
            }.bind(this));
        },





        isPositionable: function (sControlId) {
            // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
            return sControlId ? true : true;
        },


        validateEmail: function (oEvent) {
            var _value = oEvent.getParameters("value").newValue;
            oEvent.getSource().setProperty("valueState", "None");
            var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
            if (!_value.match(rexMail)) {
                oEvent.getSource().setProperty("valueState", "Error");
            }
        },




        validateTelNumbr: function (oEvent) {
            var _value = oEvent.getValue();
            oEvent.getSource().setProperty("valueState", "None");
            var rexTel = /^\d{9}$/;
            if (!_value.match(rexTel)) {
                oEvent.getSource().setProperty("valueState", "Error");
            }
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

            //Destroys all the items in the aggregation items.

            const oView = this.getView();
            let oButton = oView.byId("messagePopover");
            let oNameInput = oView.byId("_IDFullname");
            let oEmailInput = oView.byId("emailInput");
            let oIDTelefono = oView.byId("_IDTelefono");

            this.handleRequiredField(oNameInput);
            this.validateTelNumbr(oIDTelefono);

            if (this._MessageManager.getMessageModel().getData().length === 0) {

                const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                let objectOrder = oEvent.getSource().getParent().getBindingContext("DatosUser").getObject();
                let body = {
                    Address: {
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
            }



            this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
                if (oMessage) {
                    this.oMP.getBinding("items").attachChange(function (oEvent) {
                        this.oMP.navigateBack();
                        oButton.setType(this.buttonTypeFormatter());
                        oButton.setIcon(this.buttonIconFormatter());
                        oButton.setText(this.highestSeverityMessages());
                    }.bind(this));
                    setTimeout(function () {
                        this.oMP.openBy(oButton);
                    }.bind(this), 100);
                }
                // Es importante este bind ya que con esto le indicamos donde se ejecuta
            }.bind(this));



        },




    });
});  